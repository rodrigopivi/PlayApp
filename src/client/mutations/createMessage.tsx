import * as Relay from 'react-relay'
export class CreateMessageMutation extends Relay.Mutation {
  // static fragments = {}
  public getMutation() {
    return Relay.QL`mutation { createMessage }`
  }
  public getConfigs() {
      return []
  }
  public getFatQuery() {
      return Relay.QL`fragment on RootQuery { recentMessages }`
  }
  public getVariables() {
    return { body: this.props.body }
  }
}
