/**
 * Responsible for running the application is server.ts file
 */

import app from './server';
import logger from '../logger';
import { startConsumingEnrichment } from '../api/kafka';
import { sqlCreateGlobalConnection } from '../infrastructure/sql/incidentRepo';
import { SQL_DB_DATABASE, SQL_DB_HOST, SQL_DB_PASSWORD, SQL_DB_PORT, SQL_DB_USERNAME } from '../config';

(async function runServer() {
  // await sqlCreateGlobalConnection(SQL_DB_HOST, SQL_DB_PORT, SQL_DB_USERNAME, SQL_DB_PASSWORD, SQL_DB_DATABASE);
  startConsumingEnrichment();

  const PORT = process.env.APP_PORT || 4000;
  app.listen(PORT, function() {
    logger.info(`Listening on port ${PORT}`);
  });
})();
