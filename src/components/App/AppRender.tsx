import * as React from 'react'
import IsomorphicRouter from 'isomorphic-relay-router'
import routes from '../../shared/routes'
import { browserHistory } from 'react-router'
const IsomorphicRelay = require('isomorphic-relay').default

const injectTapEventPlugin = require('react-tap-event-plugin') // Can go away when react 1.0 release
injectTapEventPlugin()

export default class PlayAppRender extends React.Component<any, any> {
    constructor(props, context) { super(props, context) }
    public componentWillMount(): void {
        const data = (window as any).data = JSON.parse(document.getElementById('preloadedData').textContent)
        IsomorphicRelay.injectPreparedData(data)
    }

    public render() {
        // NOTE: don't add extra markup to this component, on the server side rendering
        // this is auto generated, any extra markup should be at MainLayout
        return (<IsomorphicRouter.Router routes={routes} history={browserHistory} />)
    }
}
