/* tslint:disable */
// Type definitions for koa-router v7.x
// Project: https://github.com/koajs/logger
// Definitions by: Wang Zishi and contributors
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module KoaLogger {
    interface logger {
        (): { <T>(ctx: any, next: any): void | Promise<T> }
    }
}
declare module 'koa-logger' {
    const _tmp: KoaLogger.logger
    export = _tmp
}
