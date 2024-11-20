import { body, query } from "express-validator"
import User from "../models/User"

export class UserValidator{
    static signup(){
        return [
            body('name', 'name is required').isString(),
            body('email', 'email is required').isEmail().custom((email,{req})=>{
                return User.findOne({email: email}).then(user=>{
                    if(user){
                        throw('user already exists')
                    }else{
                        return true
                    }
                }).catch(e=>{
                    throw new Error(e)
                })
            }),
            body('phone', 'phone is required').isString(),
            body('password','password is required').isAlphanumeric().isLength({min: 8, max: 25}).withMessage('password must be 8-20 characters'),
            // body('status','user status is required').isString(),
            // body('type','user role type is required').isString(),
        ]
    }
    static login(){
        return[
            query('email', 'email is required').isEmail()
                .custom((email,{req})=>{
                    return User.findOne({email: email}).then(user=>{
                        if(user){
                            req.user= user
                            return true
                        }else{
                            throw('user does not exist')
                        }
                    }).catch(e=>{
                        throw new Error(e)
                    })
                }),
                query('password', 'password is required').isAlphanumeric()
        ]
    }
    static verifyUserEmailOtp(){
        return [
            body('verification_token','Email verification token is required').isNumeric(),
            // body('email','Email is required').isEmail()
        ]
    }
    
    static verifyUserForResendEmail(){
        return [
            query('email','email is required').isEmail()
        ]
    }
    static checkResetPasswordEmail(){
        return[
            query('email', 'email is required').isEmail()
                .custom((email,{req})=>{
                    return User.findOne({email: email}).then(user=>{
                        if(user){
                            return true
                        }else{
                            throw('user does not exist')
                        }
                    }).catch(e=>{
                        throw new Error(e)
                    })
                })
        ]
    }
    static verifyResetPasswordToken(){
        return[
            query('email', 'email is required').isEmail(),
            query('reset_password_token', 'reset password token is required').isNumeric()
                .custom((reset_password_token,{req})=>{
                    return User.findOne({
                        email: req.query.email,
                        reset_password_token: reset_password_token,
                        reset_password_token_time:{$gt: Date.now()}
                    }).then(user=>{
                        if(user){
                            return true
                        }else{
                            throw('reset password token doest not exist.please generate new token')
                        }
                    }).catch(e=>{
                        throw new Error(e)
                    })
                })
        ]
    }
    static resetPassword(){
        return[
            body('email', 'email is required').isEmail()
            .custom((email,{req})=>{
                return User.findOne({
                    email: email
                }).then(user=>{
                    if(user){
                        req.user=user
                        return true
                    }else{
                        throw('user does not exist.')
                    }
                }).catch(e=>{
                    throw new Error(e)
                })
            }),
            body('new_password', 'new password is required').isAlphanumeric().isLength({min: 8, max: 25}).withMessage('password must be 8-20 characters'),
            body('otp', 'reset otp is required').isNumeric()
                .custom((otp,{req})=>{
                    if(otp===req.user.reset_password_token){
                        return true
                    }else{
                        req.errorStatus=422
                        throw('otp is invalid, please try again')
                    }
                })
        ]      
    }
    static verifyPhoneNumber() {
        return [
            body('phone', 'Phone is required').isString(),
        ];
    }
    static verifyUserProfile() {
        return [
            body('phone', 'Phone is required').isString(),
            body('email', 'Email is required').isEmail()
            .custom((email, {req}) => {
                return User.findOne({
                    email: email
                }).then(user => {
                    if (user) {
                        // throw new Error('A User with entered email already exist, please provide a unique email id');
                        throw('A User with entered email already exist, please provide a unique email id');
                    } else {
                        return true;
                    }
                }).catch(e => {
                    throw new Error(e);
                })
            }),
            body('password', 'Password is required').isAlphanumeric(),
        ];
    }
    static checkRefreshToken() {
        return [
            body('refreshToken', 'Refresh token is required').isString()
            .custom((refreshToken, {req}) => {
                if(refreshToken) {
                    return true;
                } else {
                    req.errorStatus = 403;
                    // throw new Error('Access is forbidden');
                    throw('Access is forbidden');
                }
            })
        ];
    }

    static userProfilePic() {
        return [
            body('profileImages', 'profile image is required')
            .custom((profileImages, {req}) => {
                if(req.file) {
                    return true;
                } else {
                    // throw new Error('File not uploaded');
                    throw('File not uploaded');
                }
            })
        ];
    }
}
