import { Router } from "express";
import { OrderController } from "../controllers/OrderController";
import { GlobalMiddleware } from "../middlewares/GlobalMiddleware";
import { OrderValidator } from "../validators/OrderValidator";


class OrderRouter {

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
        this.router.get('/userOrders', GlobalMiddleware.auth, OrderController.getUserOrders);
    }

    postRoutes() {
        this.router.post('/create', GlobalMiddleware.auth, OrderValidator.placeOrder(), GlobalMiddleware.checkError, OrderController.placeOrder);
    }

    patchRoutes() {
    }

    putRoutes() {
    }

    deleteRoutes() {
    }

}

export default new OrderRouter().router;