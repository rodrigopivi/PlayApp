import * as React from 'react'
import { Link } from 'react-router'
import {
    Card, CardMedia, CardText, CardTitle, CardActions, RaisedButton, FlatButton
} from 'material-ui'
// using require for TextField to be able to use the 'autoComplete' that is missing at d.ts
const TextField = require('material-ui/lib/text-field')
const Helmet = require('react-helmet')

export default class SignUpRender extends React.Component<any, any> {
    constructor(props, context) { super(props, context) }
    public render() {
        return (
            <div>
                <Helmet title='Sign Up' />
                <Card style={{maxWidth: '400px', margin: '30px auto' }}>
                    <CardMedia
                        style={{minHeight: '150px'}}
                        overlay={
                            <CardTitle title='Sign Up' style={{ textAlign: 'center' }} />
                        } >
                        <img src='http://lorempixel.com/400/150/nature/' />
                    </CardMedia>
                    <form onSubmit={this.handleSignUpSubmit.bind(this)} >
                        <CardText>
                            <TextField
                                hintText='Enter your first name'
                                floatingLabelText='Name'
                                multiLine={false}
                                fullWidth={true}
                                ref='name'
                                autoComplete='off'
                            />
                            <TextField
                                hintText='Enter your email address'
                                floatingLabelText='Email'
                                multiLine={false}
                                fullWidth={true}
                                ref='email'
                                autoComplete='off'
                            />
                            <TextField
                                hintText='Enter your password'
                                floatingLabelText='Password'
                                multiLine={false}
                                fullWidth={true}
                                type='password'
                                ref='password'
                            />
                            <TextField
                                hintText='Confirm your password'
                                floatingLabelText='Password confirmation'
                                multiLine={false}
                                fullWidth={true}
                                type='password'
                                ref='confirmation'
                            />
                        </CardText>
                        <CardActions style={{ textAlign: 'center' }}>
                            <RaisedButton primary={true} label='Sign Up' type='submit'/>
                            <Link to={'/login'}>
                                <FlatButton label='Already a member?' />
                            </Link>
                        </CardActions>
                    </form>
                </Card>
            </div>
        )
    }

    private async handleSignUpSubmit(evt) {
        evt.preventDefault()
        const refs: any = this.refs
        const name = refs.name && refs.name.getValue()
        const email = refs.email && refs.email.getValue()
        const password = refs.password && refs.password.getValue()
        const confirmation = refs.confirmation && refs.confirmation.getValue()
        if (name && email && password && confirmation && password === confirmation) {
            const formData = new FormData()
            formData.append('name', name)
            formData.append('email', email)
            formData.append('password', password)
            try {
                const response = await fetch('/sign_up', {
                  method: 'POST',
                  body: formData,
                  credentials: 'same-origin'
                })
                if (response.status !== 200 && response.statusText !== 'OK') {
                    throw new Error('Invalid credentials.')
                }
            } catch (e) { this.handleSignUpFailed(e) }
            //  browserHistory.push('/')
            document.location.href = '/'
        } else { this.handleSignUpFailed(new Error('Invalid credentials.')) }
    }

    private handleSignUpFailed(error) {
        console.error(error)
        document.location.href = '/sign_up'
    }
}
