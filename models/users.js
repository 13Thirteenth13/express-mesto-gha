import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import isEmail from 'validator/lib/isEmail.js';

const { Schema } = mongoose;

const schema = new Schema({
  name: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 30,
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 30,
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    default:
      'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator: (link) => {
        const reg = /(https|http)+:\/\/?([\da-z\.-]+)\.([a-z\.]+)([\/\w \.-]*)*\/?/;
        return reg.test(link);
      },
      message: 'Некорректный формат ссылки на аватар',
    },
  },
  email: {
    type: String,
    unique: true,
    required: true,
    dropDups: true,
    validate: {
      validator: (v) => isEmail(v),
      message: 'Некорректный формат почты',
    },
  },
  password: {
    type: String,
    minLength: 3,
    required: true,
    select: false,
  },
}, { versionKey: false });

schema.statics.findUserByCredentials = function findUserByCredentials(email, password) {
  return this.findOne({ email }, { runValidators: true })
    .select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error('Неправильные почта или пароль'));
      }
      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          return Promise.reject(new Error('Неправильные почта или пароль'));
        }
        return user;
      });
    });
};

export const User = mongoose.model('User', schema);
