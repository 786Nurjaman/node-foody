import { Utils } from "../utils/Utils";
import { Environments } from "./env";

Utils.dotenvConfigs();

export const ProdEnv:Environments={
    db_uri: process.env.PROD_DB_URI,
    gmail_auth: {
        user: process.env.PROD_GMAIL_USER,
        pass: process.env.PROD_GMAIL_PASS
    },
    jwt_secret_key: process.env.PROD_JWT_SECRET_KEY,
    jwt_refresh_secret_key: process.env.PROD_JWT_REFRESH_SECRET_KEY,
    redis: {
        username: process.env.PROD_SERVER_REDIS_USERNAME,
        password: process.env.PROD_SERVER_REDIS_PASSWORD,
        host: process.env.PROD_SERVER_REDIS_HOST,
        port: parseInt(process.env.PROD_SERVER_REDIS_PORT)
    }
}