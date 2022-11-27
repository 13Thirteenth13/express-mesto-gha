import { AppError } from './AppError.js';

export class HTTPError extends AppError {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'HTTPError';
  }
}
