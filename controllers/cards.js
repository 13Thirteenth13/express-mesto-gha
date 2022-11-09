import { constants } from 'http2';
import { Card } from '../models/cards.js';

const responseReadError = (res) => res.status(constants.HTTP_STATUS_NOT_FOUND).send({
  message: 'Карточка не найдена',
});

const responseUpdateError = (res, message) => res.status(constants.HTTP_STATUS_BAD_REQUEST).send({
  message: `Некорректные данные для карточки. ${message}`,
});

export const read = (req, res) => {
  Card.find({})
    .then((cards) => {
      if (cards) {
        res.send(cards);
      } else {
        responseReadError(res);
      }
    })
    .catch((err) => {
      console.error(err);
      responseReadError(res);
    });
};

export const create = (req, res) => {
  const { name, link } = req.body;
  const card = { name, link, owner: req.user._id };

  Card.create(card)
    .then((newCard) => {
      if (newCard) {
        res.send(newCard);
      } else {
        responseReadError(res);
      }
    })
    .catch((err) => {
      console.error(err);
      responseUpdateError(res, err.message);
    });
};

export const update = (req, res) => {
  const { id, isLike = false } = req.params;
  const userId = req.user._id;
  const updateParams = isLike
    ? { $addToSet: { likes: userId } }
    : { $pull: { likes: userId } };

  Card.findByIdAndUpdate(id, updateParams, { new: true })
    .then((card) => {
      if (card) {
        res.send(card);
      } else {
        responseReadError(res);
      }
    })
    .catch((err) => {
      console.error(err);
      responseUpdateError(res, err.message);
    });
};

export const remove = (req, res) => {
  const { id } = req.params;

  Card.findByIdAndDelete(id)
    .then((card) => {
      console.log('card', card);
      if (card) {
        res.send(card);
      } else {
        responseReadError(res);
      }
    })
    .catch((err) => {
      console.error(err);
      if (err.name === 'CastError') {
        responseUpdateError(res, err.message);
      } else {
        responseReadError(res);
      }
    });
};
