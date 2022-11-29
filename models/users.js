import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { UnauthorizedError } from '../errors/index.js';
import { urlRegex, emailRegex } from '../utils/regex.js';

const { Schema } = mongoose;

const schema = new Schema({
  name: {
    type: String,
    minLength: 2,
    maxLength: 30,
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    minLength: 2,
    maxLength: 30,
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    default:
      'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator: (value) => urlRegex.test(value),
      message: () => 'Некорректный формат ссылки',
    },
  },
  email: {
    type: String,
    unique: true,
    required: true,
    dropDups: true,
    validate: {
      validator: (value) => emailRegex.test(value),
      message: () => 'Некорректный формат почты',
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
}, { versionKey: false });

schema.statics.findUserByCredentials = function findUserByCredentials(email, password) {
  return this.findOne({ email }, { runValidators: true })
    .select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('Неправильные почта или пароль');
      }
      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          throw new UnauthorizedError('Неправильные почта или пароль');
        }
        return user;
      });
    });
};

export const User = mongoose.model('User', schema);
