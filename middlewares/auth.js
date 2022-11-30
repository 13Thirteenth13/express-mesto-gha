import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../errors/index.js';

export const auth = (req, res, next) => {
  const token = req.cookies.jwt;
  const { JWT_SECRET } = req.app.get('config');
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    next(new UnauthorizedError('Необходима авторизация'));
  }
};
