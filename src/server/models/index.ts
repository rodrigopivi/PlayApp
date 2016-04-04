const settings = require('../../../config/settings')
export const thinky = require('thinky')(settings.db)
export const User = require('./User')(thinky)
export const Message = require('./Message')(thinky)

let promises: PromiseLike<any>[] = []
for (let name in thinky.models) {
    if (thinky.models[name] && thinky.models[name].ready !== undefined) {
        promises.push(thinky.models[name].ready())
    }
}
Promise.all(promises).then(() => {
    for (let name in thinky.models) {
        if (thinky.models[name] && thinky.models[name].defineRelations !== undefined) {
            thinky.models[name].defineRelations()
        }
    }
})
