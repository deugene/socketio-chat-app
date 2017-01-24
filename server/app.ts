import * as express from 'express';
import * as path from 'path';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';

import routes from './routes/index';
const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.resolve(__dirname, '../client')));

// define routes
app.use('/', routes);

// catch 404 and forward to angular2
app.use((req: express.Request, res: express.Response): void => {
  console.log(`Redirecting Server 404 request: ${req.originalUrl}`);
  res.status(200).sendFile(path.resolve(__dirname, '../client/index.html'));
});

// error handler
app.use((
  err: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void => {
  // only providing error details in development
  err = process.env.NODE_ENV === 'development'
    ? { message: err.message, stack: err.stack }
    : { message: err.message };

  // send error json
  res.json({ err: err });
});

export = app;
