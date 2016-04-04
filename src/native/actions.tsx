export const navigateBack = () => ({ type: 'BACK_SCENE' })
export const navigatePush = (sceneKey) => ({ type: 'PUSH_SCENE', key: sceneKey })

export const finishMainTransition = () => ({ type: 'FINISH_MAIN_TRANSITION' })
export const startMainTransition = () => ({ type: 'START_MAIN_TRANSITION' })

export const setAsAuthenticated = () => ({ type: 'IS_AUTHENTICATED' })
export const setAsNotAuthenticated = () => ({ type: 'IS_NOT_AUTHENTICATED' })

export const setAsOnline = () => ({ type: 'IS_ONLINE' })
export const setAsOffline = () => ({ type: 'IS_OFFLINE' })

export const updateDimensions = () => ({ type: 'UPDATE_DIMENSIONS'})

export const keyboardWillShow = (e) => ({ type: 'KEYBOARD_WILL_SHOW', evt: e})
export const keyboardWillHide = (e) => ({ type: 'KEYBOARD_WILL_HIDE', evt: e})
