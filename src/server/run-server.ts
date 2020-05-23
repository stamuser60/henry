/**
 * Responsible for running the application is server.ts file
 */
import app from './server';
import logger from '../logger';
import { createConnection } from 'typeorm';
import router from '../../src/api/getEnrichments';

createConnection()
  .then(async connection => {
    app.use('/api/v1', router);
    const PORT = process.env.APP_PORT || 4000;
    app.listen(PORT, function() {
      logger.info(`Listening on port ${PORT}`);
    });
  })
  .catch(error => console.log('TypeORM connection error: ', error));
