import express from 'express';
import * as usersController from './users.controller';
import userIdRouter from './[userId]';

const router = express.Router();

router.get('/', usersController.getUsers);
router.use('/:userId', userIdRouter);

export default router;
