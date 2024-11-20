import User from "../models/User";
import { Utils } from "../utils/Utils";
import { NodeMailer } from "../utils/NodeMailer";
import { Jwt } from "../utils/Jwt";
import { Redis } from "../utils/Redis";


export class UserController{

    static async signup(req, res, next){
        
        const name = req.body.name
        const email = req.body.email
        const phone = req.body.phone
        const password = req.body.password
        // const type = req.body.type
        const type = 'user'
        // const status = req.body.status
        const status = 'active'
        const verification_token= Utils.generateVerificationToken()
       
        try{
            const hash = await Utils.encryptPassword(password)
            const data = {
                email,
                verification_token,
                verification_token_time: Date.now() + new Utils().MAX_TOKEN_TIME,
                photo: null,
                phone, 
                password: hash, 
                name, 
                type, 
                status
            }
            let user = await new User(data).save()
            const accessPayload={
                _id: user._id,
                email: user.email,
                type: user.type
            }
            const refreshPayload={
                email: user.email,
                type: user.type
            }
          const accessToken = Jwt.jwtSign(accessPayload)
          const refreshToken = Jwt.jwtSignRefresh(refreshPayload)
            await NodeMailer.sendEmail({
                to:email,
                subject:'test',
                html:`<h1>Otp is ${verification_token}</h1>`
            })
            res.json({accessToken: accessToken, refreshToken: refreshToken, user: user})
        }catch(e){
            next(e)
        }
    }

    static async verifyUserEmailOtp(req, res, next){
       const verification_token = req.body.verification_token
       const email = req.user.email
        
        try{
            const user = await User.findOneAndUpdate({
                email: email, 
                verification_token: verification_token, 
                type: req.user.type,
                verification_token_time:{$gt: Date.now()}
            },{email_verified: true, updated_at: new Date()},{new: true})
            
            if(user){
                res.send(user)
            }else{
                throw new Error('wrong otp or verification otp is expired. please try again.')
            }
        }catch(e){
            next(e)
        }
    }

    static async resendVerificationEmail(req, res, next){
      
        const email = req.user.email
        const verification_token = Utils.generateVerificationToken()
        try{
           const user = await User.findOneAndUpdate({
            email: email
           },{
            updated_at: new Date(),
            verification_token: verification_token,
            verification_token_time: Date.now() + new Utils().MAX_TOKEN_TIME
           })
           if(user){
            res.json({
                success: true
            })
                await NodeMailer.sendEmail({
                    to: user.email,
                    subject:'Resend email verification',
                    html:`<h1>Otp is ${verification_token}</h1>`
                })
           }else{
            throw new Error('error in send verification otp')
           }
        }catch(e){
            next(e)
        }
    }
    static async login(req, res, next){
        const user = req.user
        const password = req.query.password
        const data={
            password,
            encrypt_password: user.password
        }
        try{
            await Utils.comparePassword(data)
            const accessPayload={
                _id:user._id,
                email: user.email,
                type: user.type
            }
            const refreshPayload={
                email: user.email,
                type: user.type
            }
          const accessToken = Jwt.jwtSign(accessPayload)
          const refreshToken = Jwt.jwtSignRefresh(refreshPayload)
            res.json({
                accessToken,
                refreshToken,
                user
            })
        }catch(e){
            next(e)
        }
    }

    static async sendResetPasswordOtp(req, res, next){
        const email = req.query.email
        const reset_password_token = Utils.generateVerificationToken()
        try{
            const user = await User.findOneAndUpdate({email: email},{
                updated_at: new Date(),
                reset_password_token: reset_password_token,
                reset_password_token_time: Date.now() + new Utils().MAX_TOKEN_TIME
            })
            if(user){
                res.json({
                    success: true
                })
                await NodeMailer.sendEmail({
                    to: user.email,
                    subject:'Reset password otp',
                    html:`<h1>Otp is ${reset_password_token}</h1>`
                })
            }else{
                throw new Error('error in send otp')
            }
        }catch(e){
            next(e)
        }
    }
    static async verifyResetPasswordToken(req, res, next){

        try{
            res.json({success: true})
        }catch(e){
            next(e)
        }
    }

    static async resetPassword(req, res, next){
        const user = req.user
        const new_password= req.body.new_password
        try {
            const encryptedPassword = await Utils.encryptPassword(new_password)
            const updatedUser = await User.findByIdAndUpdate({
                _id: user._id
            },{update_at: new Date(), password: encryptedPassword},{new: true})
            if(updatedUser){
                res.send(updatedUser)
            }else{
                throw new Error('password not updated')
            }
        } catch (e) {
            next(e)
        }
    }
    
    static async profile(req, res, next){
        const user = req.user;
        try {
            const profile = await User.findById(user._id);
            if(profile) {
                res.send(profile);
            } else {
                throw new Error('User doesn\'t exist');
            }
        } catch(e) {
            next(e);
        }
    }

    static async updatePhoneNumber(req, res, next) {
        const user = req.user;
        const phone = req.body.phone;
        try {
            const userData = await User.findByIdAndUpdate({_id: user._id},
                { phone: phone, updated_at: new Date() },
                { new: true }
            );
            res.send(userData);
        } catch(e) {
            next(e);
        }
    }

    static async updateUserProfile(req, res, next) {
        const user = req.user;
        const phone = req.body.phone;
        const new_email = req.body.email;
        const plain_password = req.body.password;
        const verification_token = Utils.generateVerificationToken();
        try {
            const userData = await User.findById({_id: user._id});
            if(!userData) throw new Error('User doesn\'t exist');
            await Utils.comparePassword({
                password: plain_password,
                encrypt_password: userData.password
            });
            const updatedUser = await User.findByIdAndUpdate(
                {_id: user._id},
                {
                    phone: phone,
                    email: new_email,
                    email_verified: false,
                    verification_token,
                    verification_token_time: Date.now() + new Utils().MAX_TOKEN_TIME,
                    updated_at: new Date()
                },
                { new: true }
            );
            const accessPayload={
                _id:user._id,
                email: updatedUser.email,
                type: updatedUser.type
            }
            const refreshPayload={
                email: updatedUser.email,
                type: updatedUser.type
            }
            const accesToken = Jwt.jwtSign(accessPayload)
            const refreshToken = Jwt.jwtSignRefresh(refreshPayload)
            res.json({
                accesToken,
                refreshToken,
                user: updatedUser
            });
            // send email to user for updated email verification
            await NodeMailer.sendEmail({
                to: updatedUser.email,
                subject: 'Email Verification',
                html: `<h1>Your Otp is ${verification_token}</h1>`
            });
        } catch(e) {
            next(e);
        }
    }
    static async getNewTokens(req, res, next) {
        const refreshToken = req.body.refreshToken;
        try {
            const decoded_data = await Jwt.jwtVerifyRefresh(refreshToken);
            if(decoded_data) {
                const user = await User.findOne({email: decoded_data.email, type:decoded_data.type})
                if(!user) throw('please provide right valid refresh token')
                const accessPayload={
                    _id:user._id,
                    email: user.email,
                    type: user.type
                }
                const refreshPayload={
                    email: decoded_data.email,
                    type: decoded_data.type
                }
              const accessToken = Jwt.jwtSign(accessPayload)
              const refreshToken = Jwt.jwtSignRefresh(refreshPayload)
                res.json({
                    accessToken: accessToken,
                    refreshToken: refreshToken
                });
            } else {
                req.errorStatus = 403;
                // throw new Error('Access is forbidden');
                throw('Access is forbidden');
            }
        } catch(e) {
            req.errorStatus = 403;
            next(e);
        }
    }

    static async logout(req, res, next) {
        // const refreshToken = req.body.refreshToken;
        const decoded_data = req.user;
        try {
            if(decoded_data) {
                // delete refresh token from redis database
                await Redis.deleteKey(decoded_data.email);
                res.json({success: true});
            } else {
                req.errorStatus = 403;
                // throw new Error('Access is forbidden');
                throw('Access is forbidden');
            }
        } catch(e) {
            req.errorStatus = 403;
            next(e);
        }
    }

    static async updateUserProfilePic(req, res, next) {
        const path = req.file.path;
        const user = req.user;
        try {
            const updatedUser = await User.findByIdAndUpdate(
                user.aud,
                {
                    photo: `/${path}`,
                    updated_at: new Date()
                },
                { 
                    new: true,
                    projection: {
                        verification_token: 0,
                        verification_token_time: 0,
                        password: 0,
                        reset_password_token: 0,
                        reset_password_token_time: 0,
                        __v: 0,
                        _id: 0
                    } 
                }
            );
            res.send(updatedUser);
        } catch(e) {
            next(e);
        }
    }
    
}