require('source-map-support').install()
import * as Controllers from './controllers'
import { eachValuesOf } from './lib/util'
import * as http from 'http'
import * as Koa from 'koa'
import * as KoaLogger from 'koa-logger'
import { logger } from './config/logger'
import { worker } from 'cluster'

const convert = require('koa-convert')
const serveStatic = require('koa-static')
const settings = require('../../config/settings')
const sticky = require('sticky-session')
// const https = require('https')
// const fs = require('fs')
// const enforceHttps = require('koa-sslify')

// const sslOptions = {
//   key: fs.readFileSync(settings.ssl.key),
//   cert: fs.readFileSync(settings.ssl.cert)
// }

class PlayAppServer {
    public koa = new Koa()
    public server = http.createServer(this.koa.callback())
    private controllers = []
    constructor() {
        if (settings.useServerCluster) { // create a pool of workers to use all cpu's
            if (!sticky.listen(this.server, settings.serverPort)) {
                logger.info(`Master node ${process.pid} online!.`)
            } else {
                this.setupServer()
            }
        } else { // a non clustered server will able to breakpoint
            this.setupServer()
            this.server.listen(settings.serverPort)
        }
    }
    private setupServer(): void {
        // this.koa.use(convert(enforceHttps()))
        this.koa.use(convert(serveStatic('./public', { maxage: 1000 * 60 * 60 * 24})))
        this.setupControllers()
        this.koa.use(KoaLogger())
        logger.info(`PlayAppServer on port: ${settings.serverPort}, worker: ${worker ? worker.id : 'Master'} - ${ new Date() }`)
    }
    private setupControllers(): void {
        eachValuesOf(Controllers, (Controller) => {
            const controller = new Controller(this)
            if (controller.router) { this.koa.use(controller.router.routes()) }
            if (controller.use) { this.koa.use(controller.use) }
            this.controllers.push(controller)
        })
    }
}

let noop = (x: any): void => undefined
noop(new PlayAppServer())
