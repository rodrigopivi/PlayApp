const Relay = require('react-relay')

export default {
    root: () => Relay.QL`query { root }`
}
