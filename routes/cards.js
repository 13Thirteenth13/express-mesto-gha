import { Router } from 'express';
import {
  getCards, createCard, updateCard, deleteCard,
} from '../controllers/cards.js';

export const router = Router();

router.get('/', getCards);
router.post('/', createCard);
router.put('/:id/likes', (req, ...other) => {
  req.params.isLike = true;
  updateCard(req, ...other);
});
router.delete('/:id/likes', updateCard);
router.delete('/:id', deleteCard);
