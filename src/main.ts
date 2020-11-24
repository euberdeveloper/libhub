import 'module-alias/register';

import * as express from 'express';
import * as http from 'http';
import * as compression from 'compression';
import * as helmet from 'helmet';
import * as cors from 'cors';
import * as morgan from 'morgan';
import * as bodyParser from 'body-parser';
import { httpsRedirect } from './utils/httpsRedirect';

import CONFIG from '@/config';
import router from '@/router';

const app = express(); 

app.use(compression());
if (process.env.NODE_ENV === 'production') {
    app.use(httpsRedirect);
}
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/api', router());
app.use(express.static(CONFIG.SETTINGS.PUBLIC_PATH));

http.createServer(app).listen(CONFIG.SERVER.PORT);
console.log(`Http listening on port ${CONFIG.SERVER.PORT}`);