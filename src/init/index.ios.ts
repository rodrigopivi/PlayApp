import { AppRegistry } from 'react-native'
import App from '../components/App'

// FIXME: https://github.com/facebook/react-native/issues/1501
(console as any).ignoredYellowBox = [
  'Warning: ScrollView doesn\'t take rejection well - scrolls anyway',
  'Warning: ReactNative.createElement is deprecated. Use React.createElement from the "react" package instead',
]

AppRegistry.registerComponent('PlayProject', () => App)
