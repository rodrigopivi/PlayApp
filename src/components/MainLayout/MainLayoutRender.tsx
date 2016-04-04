import * as React from 'react'
import { AppBar } from 'material-ui'
const Colors = require('material-ui/lib/styles/colors')
const ColorManipulator = require('material-ui/lib/utils/color-manipulator')
const getMuiTheme = require('material-ui/lib/styles/getMuiTheme')
const MuiThemeProvider = require('material-ui/lib/MuiThemeProvider')

export const muiTheme = getMuiTheme({
  palette: {
      primary1Color: Colors.orange900,
      primary2Color: Colors.purple700,
      primary3Color: Colors.grey600,
      accent1Color: Colors.greenA700,
      accent2Color: Colors.grey100,
      accent3Color: Colors.grey500,
      textColor: Colors.darkBlack,
      alternateTextColor: Colors.white,
      canvasColor: Colors.white,
      borderColor: Colors.grey300,
      disabledColor: ColorManipulator.fade(Colors.darkBlack, 0.3),
      pickerHeaderColor: Colors.cyan500,
  },
}, { userAgent: 'all' })
const Helmet = require('react-helmet')

export default class MainLayoutRender extends React.Component<any, any> {
    constructor(props, context) { super(props, context) }
    public render() {
        return (
            <div>
                <Helmet
                    title='Welcome'
                    titleTemplate='PlayApp - %s'
                />
                <MuiThemeProvider muiTheme={muiTheme}>
                    <div>
                        <AppBar title='PlayApp' iconClassNameRight='muidocs-icon-navigation-expand-more' />
                        { this.props.children }
                    </div>
                </MuiThemeProvider>
            </div>
        )
    }
}
