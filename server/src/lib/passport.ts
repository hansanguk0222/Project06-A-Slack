import config from '@/config';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';
import { userModel } from '@/models';
import { User } from '@/types';

export default () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.oauth.google.clientID,
        clientSecret: config.oauth.google.clientSecret,
        callbackURL: config.oauth.google.callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        const { id, emails, displayName } = profile;
        if (!emails) {
          done(new Error('no email error'), null);
          return;
        }
        const email = emails[0].value;
        try {
          const [[user]]: [[User]] = await userModel.getUserByEmail({ email });

          if (user) {
            done(undefined, {
              user: { id: user.id, displayName: user.displayName, email: user.email },
            });
            return;
          }

          const [{ insertId }] = await userModel.addOAuthUser({ email, displayName });
          done(undefined, { user: { id: insertId, displayName, email } });
          return;
        } catch (err) {
          done(err, null);
        }
      },
    ),
  );
};
