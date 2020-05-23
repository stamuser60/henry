/**
 * Responsible for running the application is server.ts file
 */

import app from './server';
import logger from '../logger';
import { startConsumingEnrichment } from '../api/kafka';
import { sqlCreateGlobalConnection } from '../infrastructure/sql/incidentRepo';
import { HENRY_PORT, SQL_DB_DATABASE, SQL_DB_HOST, SQL_DB_PASSWORD, SQL_DB_PORT, SQL_DB_USERNAME } from '../config';

/**
 * Function that initializes all the important parts of the application.
 */
(async function runServer(): Promise<void> {
  await sqlCreateGlobalConnection(SQL_DB_HOST, SQL_DB_PORT, SQL_DB_USERNAME, SQL_DB_PASSWORD, SQL_DB_DATABASE);
  startConsumingEnrichment();

  app.listen(HENRY_PORT, function() {
    logger.info(`Listening on port ${HENRY_PORT}`);
  });
})();
