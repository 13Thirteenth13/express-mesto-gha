import { Card } from '../models/cards.js';
import {
  HTTPError,
  BadRequestError,
  NotFoundError,
  ServerError,
  ForbiddenError,
} from '../errors/index.js';

const errorServer = (message) => new ServerError(message);
const notFoundError = new NotFoundError('Карточка не найдена');
const forbiddenError = new ForbiddenError('Это действие можно выполнить только со своими карточками');
const errorBadRequest = (message) => new BadRequestError(`Некорректные данные для карточки. ${message}`);

export const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch((err) => {
      if (err instanceof HTTPError) {
        next(err);
      } else {
        next(errorServer(err.message));
      }
    });
};

export const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => res.send(card))
    .catch((err) => {
      if (err instanceof HTTPError) {
        next(err);
      } else if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(errorBadRequest(err.message));
      } else {
        next(errorServer(err.message));
      }
    });
};

export const deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card) {
        throw notFoundError;
      } else if (card.owner.toString() !== req.user._id) {
        throw forbiddenError;
      } else {
        return Card.findByIdAndRemove(req.params.cardId);
      }
    })
    .then((card) => {
      res.send(card);
    })
    .catch((err) => {
      if (err instanceof HTTPError) {
        next(err);
      } else if (err.name === 'CastError') {
        next(errorBadRequest(err.message));
      } else {
        next(notFoundError);
      }
    });
};

export const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card) {
        res.send(card);
      } else {
        throw notFoundError;
      }
    })
    .catch((err) => {
      if (err instanceof HTTPError) {
        next(err);
      } else if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(errorBadRequest(err.message));
      } else {
        next(errorServer(err.message));
      }
    });
};

export const dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card) {
        res.send(card);
      } else {
        throw notFoundError;
      }
    })
    .catch((err) => {
      if (err instanceof HTTPError) {
        next(err);
      } else if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(errorBadRequest(err.message));
      } else {
        next(errorServer(err.message));
      }
    });
};
