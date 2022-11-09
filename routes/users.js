import { Router } from 'express';
import { read, create, update } from '../controllers/users.js';

export const router = Router();

router.get('/', read);
router.get('/:id', read);
router.post('/', create);
router.patch('/me', update);
router.patch('/me/avatar', update);
