import { Router } from 'express';
import {
  getUsers, createUser, getUser, updateAvatar, updateProfile, getMe,
} from '../controllers/users.js';

export const router = Router();

router.get('/', getUsers);
router.get('/me', getMe);
router.get('/:id', getUser);
router.post('/', createUser);
router.patch('/me', updateProfile);
router.patch('/me/avatar', updateAvatar);
