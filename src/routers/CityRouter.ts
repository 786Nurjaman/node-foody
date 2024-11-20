import { Router } from "express";
import { CityController } from "../controllers/CityController";
import { GlobalMiddleware } from "../middlewares/GlobalMiddleware";
import { CityValidators } from "../validators/CityValidator";


class CityRouter {

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
        this.router.get('/cities', CityController.getCities);
    }

    postRoutes() {
        this.router.post('/create', CityValidators.addCity(), GlobalMiddleware.checkError, CityController.addCity);
    }

    patchRoutes() {}

    putRoutes() {}

    deleteRoutes() {}

}

export default new CityRouter().router;