import { Thinky } from 'thinky'

module.exports = (thinky: Thinky) => {
    const Message: any = thinky.createModel('Message', {
        id: thinky.type.string(),
        userId: thinky.type.string().allowNull(false).required(),
        body:  thinky.type.string().min(1).allowNull(false).required(),
        createdAt: thinky.type.date(),
    })
    Message.ensureIndex('userId')
    Message.ensureIndex('createdAt')
    Message.pre('save', function (next): void {
        if (this.isSaved()) { return next() }
        this.createdAt = thinky.r.now()
        next()
    })
    Message.defineRelations = () => Message.belongsTo(thinky.models.User, 'user', 'userId', 'id')
    return Message
}
