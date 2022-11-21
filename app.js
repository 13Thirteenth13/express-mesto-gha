import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import express from 'express';
import bodyParser from 'body-parser';
import { constants } from 'http2';

import { router as userRouter } from './routes/users.js';
import { router as cardRouter } from './routes/cards.js';

export const run = async (envName) => {
  process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
  });

  const config = dotenv.config({ path: path.resolve('.env.common') }).parsed;
  if (!config) {
    throw new Error('Config не найден');
  }
  config.NODE_ENV = envName;

  const app = express();

  app.use(bodyParser.json());
  app.use((req, res, next) => {
    req.user = {
      _id: '637bd850469b909137c2f8b3',
    };

    if (req.headers['User-ID'] || req.headers['user-id']) {
      req.user._id = req.headers['User-ID'] || req.headers['user-id'];
    }

    next();
  });
  app.use('/users', userRouter);
  app.use('/cards', cardRouter);
  app.all('/*', (req, res) => {
    res.status(constants.HTTP_STATUS_NOT_FOUND).send({ message: 'Cтраница не найдена' });
  });

  mongoose.set('runValidators', true);
  await mongoose.connect('mongodb://localhost:27017/mestodb');
  const server = app.listen(config.PORT, config.HOST, () => {
    console.log(`Server run on http://localhost:${config.PORT}`);
  });

  const stop = async () => {
    await mongoose.connection.close();
    server.close();
    process.exit(0);
  };

  process.on('SIGTERM', stop);
  process.on('SIGINT', stop);
};
