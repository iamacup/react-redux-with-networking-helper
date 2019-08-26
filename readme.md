# react-redux-with-networking-helper

This project aims to produce a low code, high productivity solution to working with React/Redux and networking.

It stores networking state and 'global' state seperately, but provides tools for combining the two effectively - keeping a single source of truth about your application while simultaniously updating it with network data.

In addition, the library provides some utilities to handle disconnection and network retry as well as 'expiration' of network requests over time.

This project was built for React Native, although it's dependencies should all work with a React DOM project.

**Note:** This project is still in it's early stages and does have a TODO list, any feedback is welcome.

## Under the hood

Under the hood we use the following:

 * **axios** - for all the networking
 * **react-redux** - for the global state
 * **redux-saga** - to handle sagary stuff (networking, in this case)
 * **reselect** - to let us efficiently subscribe to state changes on components without causing re-renders
 * **immer** - for easy global state manipulation

## Getting Started

`yarn install react-redux-with-networking-helper`



## API


TODO


## Examples

TODO


## TODO

 * Provide additional / custom sagas to the initialisation of the library
 * Support all network methods (PATCH/GET/POST only right now)
 * Pass back headers to the various request lifecycle hooks
 * Test on dom react (non react-native) project / environment
 * Propper dev setup / linting etc.
 * Finish the documentation / make some example apps
 * Probably loads of other stuff ;-)


