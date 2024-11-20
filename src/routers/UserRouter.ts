import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { UserValidator } from "../validators/UserValidator";
import { GlobalMiddleware } from "../middlewares/GlobalMiddleware";
import { Utils } from "../utils/Utils";


class UserRouter{

    public router:Router

    constructor(){
        this.router=Router()
        this.getRoutes()
        this.postRoutes()
        this.patchRoutes()
        this.putRoutes()
        this.deleteRoutes()
    }
    getRoutes() {
         this.router.get('/send/verification/email', GlobalMiddleware.auth, UserController.resendVerificationEmail)
         this.router.get('/login', UserValidator.login(), GlobalMiddleware.checkError, UserController.login)
         this.router.get('/send/reset/password/token', UserValidator.checkResetPasswordEmail(), GlobalMiddleware.checkError, UserController.sendResetPasswordOtp)
         this.router.get('/verify/resetPasswordToken',UserValidator.verifyResetPasswordToken(), GlobalMiddleware.checkError, UserController.verifyResetPasswordToken)
         this.router.get('/profile', GlobalMiddleware.auth, UserController.profile)
    }

    postRoutes() {
        this.router.post('/signup', UserValidator.signup(), GlobalMiddleware.checkError, UserController.signup)
        this.router.post('/refresh_token', UserValidator.checkRefreshToken(), GlobalMiddleware.checkError, UserController.getNewTokens);
        this.router.post('/logout', GlobalMiddleware.auth, GlobalMiddleware.decodeRefreshToken, UserController.logout);
    }

    patchRoutes() {
        this.router.patch('/reset/password', UserValidator.resetPassword(), GlobalMiddleware.checkError, UserController.resetPassword)
        this.router.patch('/verify/emailOtp', GlobalMiddleware.auth, UserValidator.verifyUserEmailOtp(), GlobalMiddleware.checkError, UserController.verifyUserEmailOtp)
        this.router.patch('/update/phone', GlobalMiddleware.auth, UserValidator.verifyPhoneNumber(), GlobalMiddleware.checkError, UserController.updatePhoneNumber);
        this.router.patch('/update/profile', GlobalMiddleware.auth, UserValidator.verifyUserProfile(), GlobalMiddleware.checkError, UserController.updateUserProfile);

    }

    putRoutes() {
        this.router.put('/update/profilePic', GlobalMiddleware.auth, new Utils().multer.single('profileImages'), UserValidator.userProfilePic(), GlobalMiddleware.checkError, UserController.updateUserProfilePic);
    }

    deleteRoutes() {
        // throw new Error("Method not implemented.");
    }
    
}

export default new UserRouter().router