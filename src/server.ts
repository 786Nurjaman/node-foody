import * as express from 'express'
import * as mongoose from 'mongoose'
import { getEnvVar } from './environments/env'
import UserRouter from './routers/UserRouter'
import * as bodyParser from 'body-parser'
import * as cors from 'cors'
import * as morgan from 'morgan'
import BannerRouter from './routers/BannerRouter'
import CityRouter from './routers/CityRouter'
import RestaurantRouter from './routers/RestaurantRouter'
import CategoryRouter from './routers/CategoryRouter'
import ItemRouter from './routers/ItemRouter'
import AddressRouter from './routers/AddressRouter'
import OrderRouter from './routers/OrderRouter'
import { Utils } from './utils/Utils'
import { Redis } from './utils/Redis'
import * as statusMonitor from 'express-status-monitor'
import * as client from 'prom-client'
import * as responseTime from 'response-time'


export class Server{

public app: express.Application = express()

public totalReqCounter: any
public reqResTime: any

    constructor(){
        this.setConfigs()
        this.setRoutes()
        this.error404Handler()
        this.handleError()
    }
    
    setConfigs(){
        this.setPromClient()
        this.setReqRes()
        this.dotenvConfigs();
        this.connectMongoDb()
        this.connectRedis();
        this.setMonitor()
        this.setLoggers()
        this.allowCors()
        this.configureBodyParser()
    }
    
    setPromClient(){

        const collectDefaultMetrics = client.collectDefaultMetrics
        collectDefaultMetrics({register: client.register})
        this.reqResTime = new client.Histogram({
            name:"http_express_req_res_time",
            help: "This tells how much time is taken by req and res",
            labelNames: ["method", "route", "status_code"],
            buckets: [1, 50, 100, 200, 400, 500, 800, 1000, 2000, 2500, 3000]
        })
        this.totalReqCounter = new client.Counter({
            name:'total_req',
            help:'Tells total req'
        })
    }
    setReqRes(){
        this.app.use(responseTime((req, res, time)=>{
            this.totalReqCounter.inc();
            this.reqResTime.labels({
                method: req.method,
                route: req.url,
                status_code: res.statusCode
            }).observe(time)
        }))
    }
    dotenvConfigs() {
        Utils.dotenvConfigs();
    }
    connectMongoDb() {
        mongoose.connect(getEnvVar().db_uri).then(()=>{
            console.log('Database connected')
        }).catch(e=>{
            console.log(e)
        })
    }
    connectRedis() {
        Redis.connectToRedis();
     } 
     setMonitor(){
        this.app.use(statusMonitor())
     }
    setLoggers(){
        this.app.use(morgan('dev'))
    }
    allowCors(){
        this.app.use(cors())
    }

    configureBodyParser() {
        this.app.use(bodyParser.urlencoded({extended: true}))
        // this.app.use(bodyParser.json())
    }
    

    setRoutes(){
        this.app.use('/src/uploads', express.static('src/uploads'));
        this.app.use('/api/user', UserRouter)
        this.app.use('/api/banner', BannerRouter);
        this.app.use('/api/city', CityRouter);
        this.app.use('/api/restaurant', RestaurantRouter);
        this.app.use('/api/category', CategoryRouter);
        this.app.use('/api/item', ItemRouter);
        this.app.use('/api/address', AddressRouter);
        this.app.use('/api/order', OrderRouter);
        this.app.get('/metrics', async(req, res)=>{
            res.setHeader("Content-Type",client.register.contentType)
            const metrics = await client.register.metrics()
            res.send(metrics)
        })
    }
   
    error404Handler() {
        this.app.use((req, res)=>{
            res.status(404).json({
                message:'Not Found',
                success: false
            })
        })
    }

    handleError() {
        this.app.use((error, req, res, next)=>{
            // const errMsg = error.message || 'Something went wrong. Please try again later!!'
            const errMsg = error.message || error
            const errorStatus=req.errorStatus || 500
            res.status(errorStatus).json({
                message: errMsg || 'Something went wrong. Please try again later!!',
                // message: error.message || 'Something went wrong. Please try again later!!',
                success: false
            })
        })
    }
}