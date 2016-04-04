import * as GQL from 'graphql'
import * as db from '../models'
import * as R from 'graphql-relay'

const nodeDefinitions = R.nodeDefinitions(globalId => {
    const modelTypes = ['User', 'Message']
    const idInfo = R.fromGlobalId(globalId)
    const typeIndex = modelTypes.indexOf(idInfo.type)
    if (typeIndex !== -1) { return db[modelTypes[typeIndex]].get(idInfo.id).run() }
    return null
})

/**********************************************************************/
/*                         MODEL DEFINITIONS                          */
/**********************************************************************/
//============================== MESSAGE ================================//
const MessageType = new GQL.GraphQLObjectType({
    name: 'Message',
    isTypeOf: (obj): boolean => {
        try { new db.Message(obj).validate(); return true } catch (e) { return false }
    },
    fields: (): GQL.GraphQLFieldConfigMap => ({
        id: R.globalIdField('Message'),
        userId: { type: new GQL.GraphQLNonNull(GQL.GraphQLString) },
        createdAt: { type: GQL.GraphQLString },
        body: { type: GQL.GraphQLString },
        user: {
            type: UserType,
            resolve: async (msg, args): Promise<any> => await db.User.get(msg.userId).run()
        }
    }),
    interfaces: [nodeDefinitions.nodeInterface]
})
const messageConnection = R.connectionDefinitions({nodeType: MessageType})

//============================== USER ================================//
const UserType = new GQL.GraphQLObjectType({
    name: 'User',
    isTypeOf: (obj): boolean => {
        try { new db.User(obj).validate(); return true } catch (e) { return false }
    },
    fields: (): GQL.GraphQLFieldConfigMap => ({
        id: R.globalIdField(),
        name: { type: new GQL.GraphQLNonNull(GQL.GraphQLString) },
        email: { type: new GQL.GraphQLNonNull(GQL.GraphQLString) },
        createdAt: { type: GQL.GraphQLString },
        updatedAt: { type: GQL.GraphQLString },
        messages: {
            type: messageConnection.connectionType,
            args: R.connectionArgs,
            resolve: (user: any, args: any): Promise<R.Connection<any>> => {
                return R.connectionFromPromisedArray(db.Message.filter({ userId: user.id }).run(), args)
            }
        }
    }),
    interfaces: [nodeDefinitions.nodeInterface]
})

/**********************************************************************/
/*                             MUTATIONS                              */
/**********************************************************************/
/* NOTE: Relay injects the user session to the rootValue `args.rootValue.id`
mutation { createMessage(input: {body: "hello world!" clientMutationId: "1"}) {
    message { body, createdAt, user { name } }
}}
*/
const CreateMessageMutation = R.mutationWithClientMutationId({
    name: 'CreateMessage',
    inputFields: {
        body: { type: new GQL.GraphQLNonNull(GQL.GraphQLString) }
    },
    outputFields: {
        message: {
            type: MessageType,
            resolve: (obj): any => obj
        }
    },
    mutateAndGetPayload: async (msg, args): Promise<any> => {
        const newMsg = { body: msg.body, userId: args.rootValue.id }
        try {
            return await new db.Message(newMsg).save()
        } catch (e) { throw new GQL.GraphQLError(e.message) }
    }
})

/**********************************************************************/
/*                             ROOTS                                  */
/**********************************************************************/
const RootMutationType = new GQL.GraphQLObjectType({
    name: 'RootMutation',
    fields: (): GQL.GraphQLFieldConfigMap => ({
        createMessage: CreateMessageMutation
    })
})

const RootQueryType = new GQL.GraphQLObjectType({
    name: 'RootQuery',
    fields: (): GQL.GraphQLFieldConfigMap => ({
        root: {
            type: new GQL.GraphQLNonNull(RootQueryType),
            resolve: () => ({})
        },
        viewer: {
            type: UserType,
            resolve: (root, args, ast) => ast.rootValue
        },
        users: {
            type: new GQL.GraphQLList(UserType),
            resolve: async (root, args): Promise<any> => await db.User.run()
        },
        messages: {
            type: new GQL.GraphQLList(MessageType),
            resolve: async (root, args): Promise<any> => await db.Message.run()
        },
        recentMessages: {
            type: new GQL.GraphQLList(MessageType),
            // args: { count: { type: new GQL.GraphQLNonNull(GQL.GraphQLInt) } },
            resolve: async (root, args: any): Promise<any> => {
                const messages = await db.Message.orderBy('date', db.thinky.r.desc('createdAt')).limit(3).run()
                return messages.reverse()
            }
        }
    })
})

export const schema = new GQL.GraphQLSchema({
    mutation: RootMutationType,
    query: RootQueryType
})
