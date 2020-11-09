/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({
    path: path.join(__dirname, '..', '..', '.env')
});

const CONFIG = {
    SERVER: {
        PORT: process.env.PORT,
        HOST: process.env.HOST,
        HOSTNAME: `http://${process.env.HOST}:${process.env.PORT}`
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
        PUBLIC_PATH: path.join(process.cwd(), process.env.SETTINGS_PUBLIC_PATH),
        STORED_PATH: path.join(process.cwd(), process.env.SETTINGS_STORED_PATH),
        TEMP_PATH: path.join(process.cwd(), process.env.SETTINGS_TEMP_PATH)
    },
    UPLOAD: {
        LIMITS: {
            FILE_SIZE: +process.env.UPLOAD_LIMITS_FILE_SIZE * 1024 * 1024
        },
        TEMP_LOCATIONS: {
            LIBRARIES_BOOKS: path.join(process.cwd(), process.env.SETTINGS_TEMP_PATH, 'books'),
            LIBRARIES_SCHEMA: path.join(process.cwd(), process.env.SETTINGS_TEMP_PATH, 'schemas')
        },
        STORED_LOCATIONS: {
            LIBRARIES_BOOKS: (lid: string, bid: string) => 
                path.join(process.cwd(), process.env.SETTINGS_STORED_PATH, 'libraries', lid, 'books', bid),
            LIBRARIES_SCHEMA: (lid: string) => 
                path.join(process.cwd(), process.env.SETTINGS_STORED_PATH, 'libraries', lid, 'schema')
        }
    }
};

export default CONFIG;
