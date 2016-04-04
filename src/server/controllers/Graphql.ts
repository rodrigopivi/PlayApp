import * as KoaRouter from 'koa-router'
import { graphql } from 'graphql'
import { restrictUnidentifiedAccess } from '../lib/authorization'
import { schema } from '../schema/mainSchema'

const body = require('koa-body')
const convert = require('koa-convert')
const graphiql = require('koa-graphiql').default
const settings = require('../../../config/settings')

export class GraphqlController {
    private router = new KoaRouter()
    constructor(app) {
        // this.router.post(
        //     '/graphql', restrictUnidentifiedAccess, convert(body({multipart: true})), this.requestHandler
        // )
        // NOTE: figure out how mobile devices should access restricted graphql
        this.router.post(
            '/graphql', restrictUnidentifiedAccess, convert(body({multipart: true})), this.requestHandler
        )
        if (settings.allowGraphiQL) {
            this.router.get(
                '/graphql', restrictUnidentifiedAccess, convert(body({multipart: true})), graphiql()
            )
        }
    }

    private async requestHandler(ctx, next) {
        try {
            ctx.body = await graphql(
                schema,
                ctx.request.body.query,
                ctx.state.payload,
                ctx.request.body.variables ? ctx.request.body.variables : {}
            )
        } catch (e) {
            ctx.throw(`[ERROR!] ${e.message} | Stack:\n ${e.stack}`, e.status || 500)
        }
    }
}
