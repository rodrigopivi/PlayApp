// TODO: make this load automatically all files on the directory
import { GraphqlController } from './Graphql'
import { MessageController } from './Message'
import { UserController } from './User'
import { IsomorphicRenderController } from './IsomorphicRender'
exports.Message = MessageController
exports.User = UserController
exports.GQL = GraphqlController
// NOTE: IsomorphicRender should be the last one since it handles wildcard paths
exports.IsomorphicRender = IsomorphicRenderController
