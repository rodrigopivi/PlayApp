import { IAppToken, createToken } from '../lib/authorization'
import * as KoaRouter from 'koa-router'
import { User } from '../models'
import { IsomorphicRenderController } from '../controllers/IsomorphicRender'
import { clearCookieToken, restrictIdentifiedAccess, restrictUnidentifiedAccess } from '../lib/authorization'
const convert = require('koa-convert')
const body = require('koa-body')

export class UserController {
    private router = new KoaRouter()
    private errorMessages = {
        authFailed: 'Authorization failed.',
        incompleteAttributes: 'Incomplete attributes.',
        emailTaken: 'Email already taken.'
    }

    constructor(app) {
        const parseBody = convert(body({ multipart: true }))
        this.router.get('/login', restrictIdentifiedAccess, IsomorphicRenderController.renderRoute)
        this.router.post('/login', restrictIdentifiedAccess, parseBody, async (ctx) => {
            const fields = ctx.request.body.fields
            if (!fields || !fields.email || !fields.password) {
                return ctx.throw(401, this.errorMessages.authFailed)
            }
            const user = await User.getByEmailAndPass(fields.email, fields.password)
            if (!user) { return ctx.throw(401, this.errorMessages.authFailed) }
            this.authenticateUser(ctx, user, fields.rememberMe)
            ctx.body = 'OK'
        })

        this.router.get('/sign_up', restrictIdentifiedAccess, IsomorphicRenderController.renderRoute)
        this.router.post('/sign_up', restrictIdentifiedAccess, parseBody, async (ctx) => {
            const fields = ctx.request.body.fields
            if (!fields || !fields.name || !fields.password || !fields.email || !fields.password) {
                return ctx.throw(403, this.errorMessages.incompleteAttributes)
            }
            if (await User.getByEmail(fields.email)) {
                return ctx.throw(403, this.errorMessages.emailTaken)
            }
            try {
                let user = await new User({
                    name: fields.name,
                    email: fields.email,
                    password: fields.password
                }).save()
                this.authenticateUser(ctx, user)
                ctx.body = 'OK'
            } catch (e) { ctx.throw(403, e.message) }
        })

        this.router.get('/logout', (ctx) => {
            clearCookieToken(ctx)
            ctx.accepts('html', 'json', 'text') === 'json' ? ctx.status = 200 : ctx.redirect('/login')
        })

        // this route is used by native apps
        this.router.get('/ping', restrictUnidentifiedAccess, (ctx, next) => {
            ctx.type = 'application/json'
            ctx.body = JSON.stringify({status: 'OK'})
        })
    }

    private authenticateUser(ctx, user, rememberMe?): void {
        // NOTE, we store the entire User object on the JWT payload without the crypted pass
        let payload = JSON.parse(JSON.stringify(user))
        delete payload.cryptedPassword
        const appToken: IAppToken = createToken(payload)
        const cookieData: any = {
            signed: false,
            httpOnly: true,
            overwrite: true,
        }
        if (rememberMe === 'true') { cookieData.expires = appToken.expires }
        ctx.cookies.set('token', appToken.token, cookieData)
    }
}
