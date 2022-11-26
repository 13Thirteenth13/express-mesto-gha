import jwt from 'jsonwebtoken';
import { constants } from 'http2';

const handleAuthError = (res) => {
  res.status(constants.HTTP_STATUS_UNAUTHORIZED).send({ message: 'Необходима авторизация' });
};

export const auth = async (req, res, next) => {
  const { JWT_SECRET } = req.app.get('config');
  const cookieAuth = req.cookies.jwt;
  if (!cookieAuth) {
    return handleAuthError(res);
  }
  let payload;
  try {
    payload = await jwt.verify(cookieAuth, JWT_SECRET);
  } catch (err) {
    return handleAuthError(res);
  }
  req.user = payload;
  next();
};
