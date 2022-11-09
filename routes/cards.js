import { Router } from 'express';
import {
  read, create, update, remove,
} from '../controllers/cards.js';

export const router = Router();

router.get('/', read);
router.post('/', create);
router.put('/:id/likes', (req, ...other) => {
  req.params.isLike = true;
  update(req, ...other);
});
router.delete('/:id/likes', update);
router.delete('/:id', remove);
