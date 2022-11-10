import { constants } from 'http2';
import { Card } from '../models/cards.js';

const responseGetError = (res) => res.status(constants.HTTP_STATUS_NOT_FOUND).send({
  message: 'Карточка не найдена',
});

const responseUpdateError = (res, message) => res.status(constants.HTTP_STATUS_BAD_REQUEST).send({
  message: `Некорректные данные для карточки. ${message}`,
});

const responseServerError = (res, message) => {
  res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({
    message: `Внутренняя ошибка сервера. ${message}`,
  });
};

export const getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch((err) => responseServerError(res, err.message));
};

export const createCard = (req, res) => {
  const { name, link } = req.body;
  const card = { name, link, owner: req.user._id };

  Card.create(card)
    .then((newCard) => {
      res.send(newCard);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return responseUpdateError(res, err.message);
      }
      return responseServerError(res, err.message);
    });
};

export const updateCard = (req, res) => {
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
        responseGetError(res);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return responseUpdateError(res, err.message);
      }
      return responseServerError(res, err.message);
    });
};

export const deleteCard = (req, res) => {
  const { id } = req.params;

  Card.findByIdAndDelete(id)
    .then((card) => {
      if (card) {
        res.send(card);
      } else {
        responseGetError(res);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        responseUpdateError(res, err.message);
      } else {
        responseServerError(res, err.message);
      }
    });
};
