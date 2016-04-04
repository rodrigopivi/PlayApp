import ChatRender from './ChatRender'
import * as Relay from 'react-relay'

class Chat extends ChatRender {
    constructor(props, context) { super(props, context) }
}

export default Relay.createContainer(Chat, {
    fragments: {
        root: (): any => Relay.QL`
        fragment on RootQuery {
            recentMessages {
                id
                createdAt
                userId
                body
                user {
                    id
                    name
                    email
                }
            }
        }
        `,
    }
})
