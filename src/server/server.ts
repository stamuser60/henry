import express from 'express';
import bodyParser from 'body-parser';
import swaggerui from '../swaggerRouter';
import exampleApi from '../api/getEnrichments';

export const API_PREFIX_V1 = '/api/v1';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(API_PREFIX_V1, exampleApi);

app.get('/', (req, res) => res.redirect('/swagger'));
app.use('/swagger', swaggerui);

export default app;
