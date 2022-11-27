import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../errors/index.js';

const handleAuthError = (next) => {
  next(new UnauthorizedError('Необходима авторизация'));
};

export const auth = async (req, res, next) => {
  const { JWT_SECRET } = req.app.get('config');
  const cookieAuth = req.cookies.jwt;
  if (!cookieAuth) {
    return handleAuthError(next);
  }
  let payload;
  try {
    payload = jwt.verify(cookieAuth, JWT_SECRET);
  } catch (err) {
    return handleAuthError(next);
  }
  req.user = payload;
  return next();
};
