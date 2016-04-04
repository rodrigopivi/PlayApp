import * as React from 'react'
import {
    Card, CardActions, CardMedia, CardText, CardTitle, FlatButton, RaisedButton, Toggle
} from 'material-ui'
import { Link } from 'react-router'
 // using require for TextField to be able to use the 'autoComplete' that is missing at d.ts
const TextField = require('material-ui/lib/text-field')
const Helmet = require('react-helmet')

export default class LoginRender extends React.Component<any, any> {
    constructor(props, context) {
        super(props, context)
        this.state = { rememberMe: true }
    }
    public render() {
        // http://codepen.io/zavoloklom/pen/IkaFL
        const mdTyphographyBody = {
            fontSize: '13px',
            lineHeight: '20px',
            letterSpacing: '0.1px',
            fontWeight: '300',
            color: '#212121',
            textTransform: 'inherit'
        }
        return (
            <div>
                <Helmet title='Login' />
                <Card style={{maxWidth: '400px', margin: '30px auto' }}>
                    <CardMedia style={{minHeight: '150px'}}
                               overlay={
                                   <CardTitle title='Login' style={{ textAlign: 'center' }} />
                               } >
                        <img src='http://lorempixel.com/400/150/nature/' />
                    </CardMedia>
                    <form onSubmit={this.handleLoginSubmit.bind(this)} >
                        <CardText>
                            <TextField
                                hintText='Enter your email address'
                                floatingLabelText='Email'
                                multiLine={false}
                                fullWidth={true}
                                ref='email'
                                autoComplete='off' />
                            <TextField
                                hintText='Enter your password'
                                floatingLabelText='Password'
                                multiLine={false}
                                fullWidth={true}
                                type='password'
                                ref='password' />
                            <Toggle
                                label='Remember me'
                                toggled={this.state.rememberMe}
                                labelPosition='right'
                                style={{marginTop: '20px'}}
                                labelStyle={mdTyphographyBody}
                                onToggle={() => this.setState({rememberMe: !this.state.rememberMe})} />
                        </CardText>
                        <CardActions style={{ textAlign: 'center' }}>
                            <RaisedButton primary={true} label='Login' type='submit'/>
                            <Link to={'/sign_up'}>
                                <FlatButton label='Not a member?' href={'/sign_up'}/>
                            </Link>
                        </CardActions>
                    </form>
                </Card>
            </div>
        )
    }

    private async handleLoginSubmit(evt) {
        evt.preventDefault();
        const refs: any = this.refs
        const email = refs.email && refs.email.getValue()
        const password = refs.password && refs.password.getValue()
        if (email && password) {
            const formData = new FormData();
            formData.append('email', email)
            formData.append('password', password)
            formData.append('rememberMe', this.state.rememberMe)
            try {
                const response = await fetch('/login', {
                  method: 'POST',
                  body: formData,
                  credentials: 'same-origin'
                })
                if (response.status !== 200 && response.statusText !== 'OK') {
                    throw new Error('Invalid credentials.')
                }
            } catch (e) { this.handleAuthorizationFailed(e) }
            // browserHistory.push('/')
            document.location.href = '/'

        } else { this.handleAuthorizationFailed(new Error('Invalid credentials.')) }
    }

    private handleAuthorizationFailed(error) {
        // TODO: handle validation errors
        console.error(error)
        document.location.href = '/'
    }
}
