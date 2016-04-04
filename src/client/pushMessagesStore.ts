const { createStore } = require('redux')

const INITIAL_STATE = { messagesToPush: [] }
const reducer = (state: any = INITIAL_STATE, action) => {
    if (action.type === 'ADD_MESSAGE') {
        let messagesToPush = state.messagesToPush || []
        messagesToPush = messagesToPush.concat([action.newMessage])
        return Object.assign({}, state, { messagesToPush })
    }
    if (action.type === 'CLEAR_MESSAGES') {
        return INITIAL_STATE
    }
    return state
}
const store = createStore(reducer)
export default store
