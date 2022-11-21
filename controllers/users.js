import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { constants } from 'http2';
import { User } from '../models/users.js';

const responseGetError = (res) => res.status(constants.HTTP_STATUS_NOT_FOUND).send({
  message: 'Пользователь не найден',
});

const responseUpdateError = (res, message) => res.status(constants.HTTP_STATUS_BAD_REQUEST).send({
  message: `Некорректные данные для пользователя. ${message}`,
});

const responseServerError = (res, message) => {
  res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({
    message: `Внутренняя ошибка сервера. ${message}`,
  });
};

export const getUser = (req, res) => {
  const { id } = req.params;

  User.findById(id)
    .then((user) => {
      if (!user) {
        return responseGetError(res);
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return responseUpdateError(res, err.message);
      }
      return responseServerError(res, err.message);
    });
};

export const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send(users))
    .catch((err) => responseServerError(res, err.message));
};

export const createUser = (req, res) => {
  const { name, about, avatar, email, password } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({ name, about, avatar, email, password: hash }))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return responseUpdateError(res, err.message);
      }
      return responseServerError(res, err.message);
    });
};

export const updateProfile = (req, res) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, about }, { runValidators: true })
    .then((user) => res.send({
      _id: user._id,
      avatar: user.avatar,
      name,
      about,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return responseUpdateError(res, err.message);
      }
      return responseServerError(res, err.message);
    });
};

export const updateAvatar = (req, res) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar }, { runValidators: true })
    .then((user) => res.send({
      _id: user._id,
      avatar,
      name: user.name,
      about: user.about,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return responseUpdateError(res, err.message);
      }
      return responseServerError(res, err.message);
    });
};

export const login = (req, res) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const { NODE_ENV, JWT_SECRET } = req.app.get('config');
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );
      res
        .cookie('jwt', token, {
          maxAge: 3600000,
          httpOnly: true,
        })
        .end();
      res.send({ token });
    })
    .catch((err) => {
      res.status(constants.HTTP_STATUS_UNAUTHORIZED).send({ message: err.message });
    });
};
