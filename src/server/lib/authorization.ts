import * as jwt from 'jsonwebtoken'
import * as moment from 'moment'
const settings = require('../../../config/settings')
const cookie = require('cookie')

export interface IAppToken { token: string, expires: Date }
/**
* creates a JWT signed token using the provided payload
* e.g.:
* const appToken: IAppToken = jwt.createToken({ userId: u.id })
*/
export function createToken (payload): IAppToken {
    const appToken = <IAppToken>{
        token: jwt.sign(payload, settings.jwt.secret, { expiresIn: `${settings.jwt.daysUntilExpire}d` }),
        expires: moment().add(settings.jwt.daysUntilExpire, 'days').toDate()
    }
    return appToken
}

export function validateJWTToken (token): any {
    try {
        if (!token) { throw new Error() }
        const payload = jwt.verify(token, settings.jwt.secret)
        return(payload)
    } catch (err) {
        return null
    }
}

export function restrictWebsocketAccess (handshakeData: any): boolean {
    if (handshakeData.headers.cookie) {
        try {
            const clientCookie = cookie.parse(handshakeData.headers.cookie)
            if (!clientCookie) { throw new Error() }
            handshakeData.payload = jwt.verify(clientCookie['token'], settings.jwt.secret)
            return true
        } catch (err) {
            return false
        }
    }
    return false
}

/**
* Koa middleware that validates and restrict user access without credentials, it accepts a JWT
* from a cookie or bearer header auth. If no credentials found, redirects to '/login' page.
* e.g.:  this.koa.router.get('/', restrictUnidentifiedAccess, (ctx, next) => { ... })
*/
export async function restrictUnidentifiedAccess (ctx, next): Promise<void> {
    let token: string = ctx.cookies.get('token')
    if (!token && ctx.headers['authorization']) {
        token = ctx.headers['authorization'].replace('Bearer ', '')
    }
    try {
        if (!token) { throw new Error() }
        const payload = jwt.verify(token, settings.jwt.secret)
        ctx.state.payload = payload
        return await next()
    } catch (err) {
        if (ctx.cookies.get('token')) { clearCookieToken(ctx) }
        switch (ctx.accepts('json', 'html', 'text')) {
            case 'json':
                return ctx.throw(401)
            default:
                return ctx.redirect('/login')
        }
    }
}

/**
* Koa middleware that only allows access to unkown users (users that are not logged in)
* If a user is logged in, it redirects to '/' page
* e.g.:  this.koa.router.get('/', restrictIdentifiedAccess, (ctx, next) => { ... })
*/
export async function restrictIdentifiedAccess (ctx, next): Promise<void> {
    if (ctx.cookies.get('token') || ctx.headers['authorization']) { return ctx.redirect('/') }
    await next()
}

/**
* Removes the 'token' cookie from the user's browser
*/
export function clearCookieToken(ctx): void {
    ctx.cookies.set('token', '', { expires: new Date(1), path: '/' })
}
