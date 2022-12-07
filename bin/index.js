import { run } from '../app.js';

run(process.env.NODE_ENV || 'development')
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
