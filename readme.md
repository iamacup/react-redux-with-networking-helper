# react-redux-with-networking-helper

This project aims to produce a low code, high productivity solution to working with React/Redux and networking.

It stores networking state and 'global' state seperately, but provides tools for combining the two effectively - keeping a single source of truth about your application while simultaniously updating it with network data.

In addition, the library provides some utilities to handle disconnection and network retry as well as 'expiration' of network requests over time.

This project was built for React Native, although it's dependencies should all work with a React DOM project.

**Note:** This project is still in it's early stages and does have a TODO list, any feedback is welcome.

## Under the Hood

Under the hood we use the following:

 * **axios** - for all the networking
 * **react-redux** - for the global state
 * **redux-saga** - to handle sagary stuff (networking, in this case)
 * **reselect** - to let us efficiently subscribe to state changes on components without causing re-renders
 * **immer** - for easy global state manipulation

## How To Think About It

The whole point of this library is to have a single source of data truth - the 'global state' - this state can then be 'tuned in to' by various components using the connect method from react-redux in order to get updates. We have a bunch of selectors for selecting this data in a convenient way.

This 'global state' is then updated, either directly through actions on components - i.e. when you need to update the user's current handle - or indirectly through network data - i.e. when you just logged in and need to update the current users object.


## Getting Started

First, install the package

`yarn install react-redux-with-networking-helper`

Then you need to wrap your upper most component (usually the one registered with `AppRegistry.registerComponent`) like this:

```
import { ReduxWrapper } from 'react-redux-with-networking-helper';

export default class Entrypoint extends Component {
  render() {
    return (
      <ReduxWrapper>
        {/* Your app children here */}
      </ReduxWrapper>
    );
  }
}
```

Then you are ready to go - you can connect up any components to the store and use any of the API's below, or create and use your own.

## Some Examples

TODO

* Simple data update
* Simple network request
* Paginated network request

## API

There are two different API's - the Data API and the Network API. There is no link from the Data API to the Network API, but there is a link from the Network API to the Data API - that is to say, network requests can modify the 'global state'

### Locations

Locations are specified as string with the folowing syntax to specify what object location to look at:

`some.location.in.the.data.store`

You can also include array indices like this

`some.location.with.an.array.[3].in.the.[0].data.store`

* Whenever putting data into the data store, it will create all levels specified if they do not exist, as objects. 
* Whenever pulling data out of the data store, traversal stops once a level is reached that does not exist and the default value is returned (an empty object `{}`) or whatever was specified as the default value to the selector

### The Data API

#### Actions

##### Modifying the data

* `DataActions.setData(location, data, keys = null)`

Overrides any element at the current location with the data specified. See keys note below for description.

* `DataActions.mergeData(location, data, keys = null)`

Uses `Object.assign({}, currentStateAtLocation, data)` to mutate the state

* `DataActions.concatFirstData(location, data)`

Uses `locationState = data.concat(currentStateAtLocation);` to add the existing state (assuming it is an array) to the end of the data you are inserting, if the `data` value is not an array it will be converted to an array prior to concatenation.

* `DataActions.concatLastData(location, data)`

Uses `locationState = currentStateAtLocation.concat(data);` to add your data to the end of the array at the location, if the data at the location is not an array, it will be overwritten with a blank array.

**The keys parameter**

The `keys` parameter is useful for putting array data with some unique ID into the global state so it can be referenced - the keyExtractor parameter in network requests is used to generate the `keys` array.

If the `keys` parameter is specified, it must be an array, and the `data` must be an array with the same length as keys.

The data in `data` is 'spread' onto the `location` with the keys as values - an example:

```
const data = [{one: true}, {two: true}, {three: true}];
const keys = ['a', 'b', 'c'];
const location = 'some.location';

setData(location, data, keys);

// the modified state would now have this value:

{
  some: {
    location: {
      a: {one: true},
      b: {two: true},
      c: {three: true},
    }
  }
}

```

in contrast, not using a keys array gives this behavior:

```
const data = [{one: true}, {two: true}, {three: true}];
const location = 'some.location';

setData(location, data);

// the modified state would now have this value:

{
  some: {
    location: [
      {one: true}, 
      {two: true}, 
      {three: true}
    ]
  }
}
```


##### Removing data

* `DataActions.unsetData(location)`

Removes data at a specific location from the state

* `DataActions.clearAllData()`

Restores the state back to how it was when initialised. Useful for logout type events.



### The Network API


## Custom Actions, Reducers, Selectors and Sagas

This library provides a bunch of actions, reducers, selectors and sagas to perform the pre-canned set of tasks it was designed for, that is not to say that it is limited to just those things, you can plug your stuff into the underlying store easily

#### Actions and Reducers

You can specify your own actions and reducers by passing in the apropriate reducers to the `additionalReducers` prop on the `ReduxWrapper` component. Once you have specified them, you can call dispatch whatever actions they respond to from any connected component.

#### Selectors

You can build your own selectors anywhere, and just include them - react-redux-with-networking-helper uses immer to build it's selectors, but you can use anything.

#### Sagas

TODO


## TODO

 * Provide additional / custom sagas to the initialisation of the library
 * Support all network methods (PATCH/GET/POST only right now)
 * Pass back headers to the various request lifecycle hooks
 * Test on dom react (non react-native) project / environment
 * Propper dev setup / linting etc.
 * Finish the documentation / make some example apps
 * TODO convenience method for selector creation so you don't have to reference immer directly
 * Probably loads of other stuff ;-)
 * Removal / invalidation of global headers?
 * Some kind of debugging switch for selectors etc. to see performance 
 * a way to select between shalow and deep equity checking


