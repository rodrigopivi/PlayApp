import * as DOMServer from 'react-dom/server'
import * as KoaRouter from 'koa-router'
import * as React from 'react'
import * as ReactRouter from 'react-router'
import { restrictUnidentifiedAccess } from '../lib/authorization'
import Routes from '../../shared/routes'
import { default as IsomorphicRouter } from 'isomorphic-relay-router'
import { schema } from '../schema/mainSchema'
const helmet = require('react-helmet')
const Relay = require('react-relay')
const RelayLocalSchema = require('relay-local-schema')

export class IsomorphicRenderController {
    private router = new KoaRouter()
    //private use
    constructor(app) {
        (<any>global).navigator = { userAgent: 'all' }
        this.router.get('/*', restrictUnidentifiedAccess, IsomorphicRenderController.renderRoute)
    }

    // Handles the isomorphic rendering of a route matching the routes using react router
    public static renderRoute(ctx, next) {
        return new Promise((resolve, reject) => {
            // Use a local network layer to avoid internal http calls
            Relay.injectNetworkLayer(
                new RelayLocalSchema.NetworkLayer({ schema: schema, rootValue: ctx.state.payload })
            )
            ReactRouter.match({ routes: Routes, location: ctx.originalUrl }, (e, redirect, props) => {
                if (e) { return reject(e) }
                if (redirect) {
                    ctx.redirect(redirect.pathname + redirect.search)
                    return resolve(false)
                }
                if (props) {
                    return IsomorphicRouter.prepareData(props).then((obj) => {
                        const router = React.createElement(IsomorphicRouter.RouterContext, obj.props)
                        const reactOutput = DOMServer.renderToString(router)
                        const helmetData = helmet.rewind()
                        const preloadedData = JSON.stringify(obj.data)
                        ctx.body = IsomorphicRenderController.indexTemplate(preloadedData, reactOutput, helmetData)
                        resolve(false)
                    }, reject)
                }
                resolve(true)
            })
        }).then(shouldCallNext => {
            if (shouldCallNext) { next() }
        }).catch(e => {
            ctx.throw(`[ERROR!] ${e.message} | Stack:\n ${e.stack}`, e.status || 500)
        })
    }

    private static indexTemplate(preloadedData, reactOutput, helmetData): string {
        return `
        <!doctype html>
        <html lang='en'>
            <head>
                <link href='http://fonts.googleapis.com/css?family=RobotoDraft:regular,bold,italic,thin,light,bolditalic,black,medium&amp;lang=en' rel='stylesheet' type='text/css'>
                <link href='https://fonts.googleapis.com/icon?family=Material+Icons' rel='stylesheet'  type='text/css'>
                <meta charset='utf-8'>
                <meta name='viewport' content='width=device-width, initial-scale=1'>
                ${helmetData.title.toString()}
                ${helmetData.meta.toString()}
                ${helmetData.link.toString()}
                <style>
                    *, *:after, *:before {
                      -webkit-box-sizing: border-box;
                      -moz-box-sizing: border-box;
                      box-sizing: border-box;
                    }
                    body {
                      font-family: "Roboto", 'Helvetica Neue, Helvetica, Arial';
                      -webkit-font-smoothing: antialiased;
                      -moz-osx-font-smoothing: grayscale;
                      text-rendering: optimizeLegibility;
                    }
                </style>
            </head>
            <body style='margin: 0; padding: 0;'>
            <div id='root'>
                <div>${reactOutput}<div>
            </div>
            <script id='preloadedData' type='application/json'>${preloadedData}</script>
            <script src='/bundle.js'></script>
            </body>
        </html>
        `
    }
}
