/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({
    path: path.join(__dirname, '..', '..', '..', '.env')
});

/**
 * The config, wrapper of the env
 */
const CONFIG = {
    SERVER: {
        PORT: process.env.PORT,
        HOST: process.env.HOST,
        HOSTNAME: process.env.HOSTNAME
    },
    MONGO: {
        URI: process.env.MONGO_URI,
        DB: process.env.MONGO_DB,
        OPTIONS: {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    },
    SETTINGS: {
        STORED_PATH: path.join(process.cwd(), process.env.SETTINGS_STORED_PATH),
        TEMP_PATH: path.join(process.cwd(), process.env.SETTINGS_TEMP_PATH)
    },
    UPLOAD: {
        LIMITS: {
            FILE_SIZE: +process.env.UPLOAD_LIMITS_FILE_SIZE * 1024 * 1024
        },
        TEMP_LOCATIONS: {
            USERS: path.join(process.cwd(), process.env.SETTINGS_TEMP_PATH, 'users'),
            LIBRARIES_BOOKS: path.join(process.cwd(), process.env.SETTINGS_TEMP_PATH, 'books'),
            LIBRARIES_SCHEMA: path.join(process.cwd(), process.env.SETTINGS_TEMP_PATH, 'schemas')
        },
        STORED_LOCATIONS: {
            USERS: (uid: string) =>
                path.join(process.cwd(), process.env.SETTINGS_STORED_PATH, 'users', uid),
            LIBRARIES_BOOKS: (lid: string, bid: string) =>
                path.join(process.cwd(), process.env.SETTINGS_STORED_PATH, 'libraries', lid, 'books', bid),
            LIBRARIES_SCHEMA: (lid: string) =>
                path.join(process.cwd(), process.env.SETTINGS_STORED_PATH, 'libraries', lid, 'schema')
        }
    },
    SECURITY: {
        JWT: {
            KEY: process.env.SECURITY_JWT_KEY
        }
    },
    EMAIL: {
        SERVICE: process.env.EMAIL_SERVICE,
        TYPE: process.env.EMAIL_TYPE,
        USER: process.env.EMAIL_USER,
        CLIENT_ID: process.env.EMAIL_CLIENT_ID,
        CLIENT_SECRET: process.env.EMAIL_CLIENT_SECRET,
        ACCESS_TOKEN: process.env.EMAIL_ACCESS_TOKEN,
        REFRESH_TOKEN: process.env.EMAIL_REFRESH_TOKEN,
        SCOPE: process.env.EMAIL_SCOPE,
        EXPIRY_DATE: +process.env.EMAIL_EXPIRY_DATE,
        TEMPLATES_PATH: process.env.EMAIL_TEMPLATES_PATH,
        FRONTEND_URL: process.env.EMAIL_FRONTEND_URL
    }
};

export default CONFIG;
