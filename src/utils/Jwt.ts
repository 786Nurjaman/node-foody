import { getEnvVar } from "../environments/env"
import * as jwt from 'jsonwebtoken'
import { Redis } from "./Redis"

export class Jwt {
    static jwtSign(payload){
        return jwt.sign(payload, getEnvVar().jwt_secret_key,{expiresIn: '1h'})
    }
    static jwtVerify(token:string):Promise<any>{
        return new Promise((resolve, reject)=>{
            jwt.verify(token, getEnvVar().jwt_secret_key,(err, decoded)=>{
                if(err) reject(err)
                else if(!decoded) reject(new Error('user is not authorized'))
                else resolve(decoded)
            })
        })
    }

    static async jwtSignRefresh(payload){
         const refreshToken = jwt.sign(payload, getEnvVar().jwt_refresh_secret_key,{expiresIn: '7d'})
         const redis_ex = 7 * 24 * 60 * 60
         // set refreshToken in Redis with key email
         await Redis.setValue(payload.email.toString(), refreshToken, redis_ex);
         return refreshToken
    }
    static jwtVerifyRefresh(refreshToken:string):Promise<any>{
        return new Promise((resolve, reject)=>{
            jwt.verify(refreshToken, getEnvVar().jwt_refresh_secret_key,(err, decoded)=>{
                if(err) reject(err)
                else if(!decoded) reject(new Error('User is not authorised.'));
                else {
                    // match refresh tokens from Redis database
                    const user: any = decoded;
                    Redis.getValue(user.email).then(value => {
                        if(value === refreshToken) resolve(decoded);
                        else reject(new Error('Your Session is Expired! Please Login Again...'));
                    })
                    .catch(e => {
                        reject(e);
                    })
                }
            })
        })
    }
}