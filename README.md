

[![Dependency Status](https://david-dm.org/rodrigopivi/playApp.svg)](https://david-dm.org/rodrigopivi/playApp.svg) [![devDependency Status](https://david-dm.org/rodrigopivi/playApp/dev-status.svg)](https://david-dm.org/rodrigopivi/playApp/dev-status.svg)

# Real-time chat application on top of React, React-Native, Relay, GraphQL, RethinkDB and Typescript
It's intended to be an example implementation of all of this technologies playing together.

## Screenshots

### Universal web application

![Universal Web application](https://raw.githubusercontent.com/rodrigopivi/PlayApp/master/public/playAppWeb.gif "Universal Web application")

### React-native iOS application

![React-native iOS application](https://raw.githubusercontent.com/rodrigopivi/PlayApp/master/public/playAppIOS.gif "React-native iOS application")

### React-native android application

![React-native android application](https://raw.githubusercontent.com/rodrigopivi/PlayApp/master/public/playAppAndroid.gif "React-native android application")

## Features
Web, iOS and android apps running under the same codebase

Server side rendering support thanks to isomorphic-relay and isomorphic-relay-router.

Great real time support thanks to RethinkDB and WebSockets. (using a temporal Relay hack to feed the store in real time).

User registration and authentication using JWT with httpOnly cookies.

Secured GraphQL endpoint.

Relay for web and native clients.

Native navigation using NavigationExperimental with redux for the native client-side state.

## Architecture

All the source, for the server, web client and native clients, is located at `./src/`
This is the structure our source:

`./client` Code for the native client, and the web app client, excluding components.
`./server` Code for the NodeJS server only.
`./shared` Code used by the web client and the server app (for server side rendering), excluding components.
`./native` Code used by the native clients only.
`./init` The entry point for the react application clients.

```
./components
```
All our custom components, this code may be used by the server for server-side rendering, and by the client platforms.

Each component, have an `index.ts` file which is responsible for two things:

- It may provide a base component class each target renderer class can extend so we can reuse code between web components and native components.

- It should load the correct renderer component for each platform. ReactNative automatically knows when to load `.ios.js` files, or `.android.js`, or `.native.js` in an smart way. So requiring the render component by name is enough.

## What's next
This is a WIP, and there are a lot of things to improve.

Relay does not support subscriptions atm, as a temporal solution, this project uses a custom network
layer that hijacks selected graphql queries to push the real time messages to Relay store.

There is a bug with React-Native websockets implementation that is not sending the secure auth cookies at the handshake,
because of this the restricted access to the websocket has being disabled temporarily until this is fixed, a workaround
would be to use the swift socket.io implementation.

## Setup
Install Rethinkdb and nvm with node v5.9.0.

Setup virtual hostname. Edit /etc/hosts and add this:
```
127.0.0.1 play.dev
```
Install react-native and gulp globally, then install deps and run the dev server

```
npm i -g react-native-cli gulp
npm i
gulp
```

## How to run on devices

Make sure rethinkdb is running. (Once installed you run it with `rethinkdb` if it's not auto starting on boot)

To run web development server (runs webpack dev server with react HMR)
```
gulp
```

To generate a web production build:
```
gulp build-prod
```

To start production cluster:
```
npm run web
```

To run the iOS App (will launch iPhone simulator automatically)
```
npm run ios
```

To run the android App (first open your android emulator)
```
npm run android
```

NOTE: To be able to query the server from android, you need to setup a virtual hostname on the device.
For you are using AVD, `10.0.2.2` is the local ip, if you are using GenieMotion `10.0.3.2`
From your local console:
```
adb remount
adb pull /system/etc/hosts .
# add '127.0.0.1 play.dev' to the hosts file and push it
adb push hosts /system/etc  
```

## Author
Rodrigo Pimentel

## License
The MIT License (MIT)

Copyright (c) 2016 Rodrigo Pimentel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
