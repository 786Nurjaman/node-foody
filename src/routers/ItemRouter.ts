import { Router } from "express";
import { Utils } from "../utils/Utils";
import { GlobalMiddleware } from "../middlewares/GlobalMiddleware";
import { ItemController } from "../controllers/ItemController";
import { ItemValidator } from "../validators/ItemValidator";


class ItemRouter {

    public router: Router;

    constructor() {
        this.router = Router();
        this.getRoutes();
        this.postRoutes();
        this.patchRoutes();
        this.putRoutes();
        this.deleteRoutes();
    }

    getRoutes() {
        this.router.get('/menuItems/:restaurantId', GlobalMiddleware.auth, ItemValidator.getMenuItems(), GlobalMiddleware.checkError, ItemController.getMenu);
    }

    postRoutes() {
        this.router.post('/create', GlobalMiddleware.auth, GlobalMiddleware.adminRole, new Utils().multer.single('itemImages'), ItemValidator.addItem(), GlobalMiddleware.checkError, ItemController.addItem);
    }

    patchRoutes() {
    }

    putRoutes() {}

    deleteRoutes() {}

}

export default new ItemRouter().router;