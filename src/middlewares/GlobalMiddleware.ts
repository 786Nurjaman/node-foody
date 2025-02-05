import { validationResult } from "express-validator";
import { Jwt } from "../utils/Jwt";

export class GlobalMiddleware{
    static checkError(req, res, next){
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            next(new Error(errors.array()[0].msg))
        }else{
            next()
        }
    }
    static async auth(req, res, next){
        const header_auth = req.headers.authorization;
        const token = header_auth ? header_auth.slice(7, header_auth.length) : null
        try{
            if(!token){
                req.errorStatus = 401
                next(new Error('auth token is required'))
            }
            const decoded = await Jwt.jwtVerify(token)
            req.user=decoded
            next()
        }catch(e){
            req.errorStatus = 401
            next(e)
        }
    }

    static adminRole(req, res, next) {
        const user = req.user;
        if(user.type !== 'admin') {
            req.errorStatus = 401;
            next(new Error('You are an Unauthorised User'));
        }
        next();
    }

    static async decodeRefreshToken(req, res, next) {
        const refreshToken = req.body.refreshToken;
        try {
            if(!refreshToken) {
                req.errorStatus = 403;
                next(new Error('Access is forbidden! User doesn\'t exist'));
            }
            const decoded = await Jwt.jwtVerifyRefresh(refreshToken);
            req.user = decoded;
            next();
        } catch(e) {
            req.errorStatus = 403;
            // next(e);
            next(new Error('Your Session is Expired or you are an Invalid User! Please Login Again...'));
        }
    }
}