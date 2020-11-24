import { Request, Response, NextFunction } from 'express';
import { IncomingForm } from 'formidable';
import bcrypt from 'bcrypt';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { verifyRequestData, verifyToken } from '@/utils/utils';
import { userModel } from '@/models';
import config from '@/config';
import { TIME, TOKEN_TYPE, ERROR_MESSAGE } from '@/utils/constants';
import redisClient from '@/lib/redis';

/**
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email, pw } = req.body;
  if (verifyRequestData([email, pw])) {
    const [[user]] = await userModel.getUserByEmail({ email });
    if (user) {
      try {
        const match = await bcrypt.compare(pw, user.pw);
        if (match) {
          // 비번 일치 할 때
          const claims = { id: user.id, email: user.email };
          const accessToken = jwt.sign(claims, config.jwtSecret, { expiresIn: TIME.FIVE_MINUTE });
          const refreshToken = jwt.sign(claims, config.jwtRefreshSecret, {
            expiresIn: TIME.TWO_MONTH,
          });
          // 해당 유저의 refresh token 설정
          await redisClient.set(user.id, refreshToken);
          await redisClient.expire(user.id, TIME.TWO_MONTH);

          res.json({ accessToken, refreshToken });
          return;
        }
        res.status(401).json({ message: ERROR_MESSAGE.WRONG_PW });
        return;
      } catch (err) {
        next(err);
        return;
      }
    }
    res.status(401).json({ message: ERROR_MESSAGE.WRONG_USER });
    return;
  }
  res.status(400).json({ message: ERROR_MESSAGE.MISSING_REQUIRED_VALUES });
};

/**
 * POST /api/auth/logout
 */
export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { accessToken, refreshToken } = req.body;
  if (verifyRequestData([accessToken, refreshToken])) {
    /* 로그아웃을 위해 access token을 블랙리스트에 추가 */
    try {
      await verifyToken(accessToken, TOKEN_TYPE.ACCESS);
      await redisClient.set(accessToken, accessToken);
      await redisClient.expire(accessToken, TIME.FIVE_MINUTE);
    } catch (err) {
      if (err instanceof JsonWebTokenError) {
        console.log('유효하지 않은 access 토큰, pass');
      } else {
        next(err);
        return;
      }
    }

    /* 유저를 key으로 저장된 refresh token을 삭제 */
    try {
      const decodedRefreshToken = await verifyToken(refreshToken, TOKEN_TYPE.REFRESH);
      const { id } = decodedRefreshToken;
      await redisClient.del(id);
    } catch (err) {
      if (err instanceof JsonWebTokenError) {
        res.status(401).json({ message: ERROR_MESSAGE.INVALID_TOKEN });
        return;
      }
      next(err);
      return;
    }
  }
  res.status(200).end();
};

/**
 * POST /api/auth/signup
 */
export const signup = (req: Request, res: Response, next: NextFunction): void => {
  const form = new IncomingForm();
  form.uploadDir = './src/public/imgs/profile/';
  form.keepExtensions = true;
  form.multiples = true;

  form.on('fileBegin', (name, file) => {
    const imgSrc = `${Date.now()}_${file.name}`;
    // eslint-disable-next-line no-param-reassign
    file.path = `${form.uploadDir}${imgSrc}`;
  });

  const port = req.app.get('port');
  const prefix = `${req.protocol}://${req.hostname}${port !== 80 ? `:${port}` : ''}`;
  form.parse(req, async (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }

    const { email, pw } = fields;
    const { image } = files;
    console.log(image.name);
    if (verifyRequestData([email, pw])) {
      // TODO : DB에 회원정보 저장
      res.json({ email, image: `${prefix}/${image.name}` });
      return;
    }
    res.status(400).json({ message: '필수 값 누락' });
  });
};
