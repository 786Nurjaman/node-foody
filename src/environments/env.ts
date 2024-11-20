import { DevEnv } from "./env.dev";
import { ProdEnv } from "./env.prod";

export interface Environments{
    db_uri: string
    gmail_auth:{
        user:string,
        pass: string
    },
    jwt_secret_key: string,
    jwt_refresh_secret_key: string,
    redis: {
        username: string,
        password: string,
        host: string,
        port: number
    }
}
export function getEnvVar(){
    if(process.env.NODE_ENV === 'production'){
        return ProdEnv
    }
    return DevEnv
}