import { NavigationExperimental, StatusBar } from 'react-native'
const { StateUtils } = NavigationExperimental
const Dimensions = require('Dimensions')
const windowSize = Dimensions.get('window')

const INITIAL_NAVIGATION_STATE = {
    key: 'Root',
    index: 0,
    children: [{key: 'Login'}]
}

const RESTRICTED_NAVIGATION_STATE = {
    key: 'Root',
    index: 0,
    children: [{ key: 'Chat' }]
}

const INITIAL_STATE = {
    mainTransitionActive: false,
    isAuthenticated: false,
    isOnline: true,
    windowDimensions: {
        width: windowSize.width,
        height: windowSize.height,
        visibleHeight: windowSize.height
    },
    navigationState: INITIAL_NAVIGATION_STATE
}

export default function reducer(state: any = INITIAL_STATE, action) {
    const validActions = {
        'START_MAIN_TRANSITION': () => {
            if (state.mainTransitionActive) { return state }
            return Object.assign({}, state, { mainTransitionActive: true })
        },
        'FINISH_MAIN_TRANSITION': () => {
            if (!state.mainTransitionActive) { return state }
            return Object.assign({}, state, { mainTransitionActive: false })
        },
        'IS_ONLINE': () => {
            if (state.isOnline) { return state }
            return Object.assign({}, state, { isOnline: true })
        },
        'IS_OFFINE': () => {
            if (!state.isOnline) { return state }
            return Object.assign({}, state, { isOnline: false })
        },
        'IS_AUTHENTICATED': () => {
            if (state.isAuthenticated) { return state }
            return Object.assign({}, state, {
                isAuthenticated: true, navigationState: RESTRICTED_NAVIGATION_STATE
            })
        },
        'IS_NOT_AUTHENTICATED': () => {
            if (!state.isAuthenticated) { return state }
            return Object.assign({}, state, {
                isAuthenticated: false,
                navigationState: INITIAL_NAVIGATION_STATE
            })
        },
        'BACK_SCENE': () => {
            const {navigationState} = state
            if (!navigationState) { return INITIAL_STATE }
            return Object.assign({}, state, { navigationState: StateUtils.pop(navigationState) })
        },
        'CHANGE_SCENE': () => {
            const {navigationState: ns} = state
            if (!ns.children || isNaN(ns.index) || !ns.children.length || !action || !action.key) { return state }
            if (ns.children && ns.children[ns.index].key === action.key) { return state }
            const newIndex = StateUtils.indexOf(ns, action.key)
            if (newIndex === -1) { return state }
            const newNS = Object.assign({}, ns, { index: newIndex })
            return Object.assign({}, state, { navigationState: newNS })
        },
        'PUSH_SCENE': () => {
            const {navigationState} = state
            if (navigationState.children && navigationState.children.find(child => child.key === action.key)) {
                return state
            }
            return Object.assign({}, state, {
                navigationState: StateUtils.push(navigationState, {key: action.key})
            })
        },
        'UPDATE_DIMENSIONS': () => {
            const {width, height} = Dimensions.get('window')
            if (state.windowDimensions.height === height || state.windowDimensions.width === width) { return state }
            StatusBar.setHidden(false, 'slide')
            return Object.assign({}, state, {
                windowDimensions: { width, height, visibleHeight: height }
            })
        },
        'KEYBOARD_WILL_SHOW': () => {
            const wd = Dimensions.get('window')
            const visibleHeight = wd.height - action.evt.endCoordinates.height
            if (state.windowDimensions.visibleHeight === visibleHeight) { return state }
            return Object.assign({}, state, {
                windowDimensions: { visibleHeight: visibleHeight, height: wd.height, width: wd.width }
            })
        },
        'KEYBOARD_WILL_HIDE': () => {
            const wd = Dimensions.get('window')
            if (state.windowDimensions.visibleHeight === wd.height) { return state }
            return Object.assign({}, state, {
                windowDimensions: { visibleHeight: wd.height, height: wd.height, width: wd.width }
            })
        }
    }
    const typeCall = validActions[action.type]
    if (typeCall) { return typeCall() }
    return state
}
