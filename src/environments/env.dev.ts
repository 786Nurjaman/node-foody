import { Utils } from "../utils/Utils";
import { Environments } from "./env";

Utils.dotenvConfigs();

export const DevEnv:Environments={
    db_uri: process.env.DEV_DB_URI,
    gmail_auth: {
        user: process.env.DEV_GMAIL_USER,
        pass: process.env.DEV_GMAIL_PASS
    },
    jwt_secret_key: process.env.DEV_JWT_SECRET_KEY,
    jwt_refresh_secret_key: process.env.DEV_JWT_REFRESH_SECRET_KEY,
    redis: {
        username: process.env.DEV_SERVER_REDIS_USERNAME,
        password: process.env.DEV_SERVER_REDIS_PASSWORD,
        host: process.env.DEV_SERVER_REDIS_HOST,
        port: parseInt(process.env.DEV_SERVER_REDIS_PORT)
    }
}
