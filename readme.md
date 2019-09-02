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

There are some subtleties and complexities about this library, i think it is best to use the examples and then jump into the API documentation to understand why things are as they are, rather than the other way around :)

## Getting Started

First, install the package

`yarn add react-redux-with-networking-helper`

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

## Locations

Locations are an important part of the library. They are specified as string with the folowing syntax and effectively they dictate where you read and write data:

`some.location.in.the.data.store`

You can also include array indices like this

`some.location.with.an.array.[3].in.the.[0].data.store`

* Whenever **putting data into the data store**, it will create all levels specified if they do not exist, as objects. 
* Whenever **pulling data out of the data store**, traversal stops once a level is reached that does not exist and an empty object `{}` is returned or whatever was specified as the default value when creating the selector.

## API

There are two different API's - the Data API and the Network API. There is no link from the Data API to the Network API, but there is a link from the Network API to the Data API - that is to say, network requests can modify the 'global state'.

### The Data API

#### Actions (DataActions)

##### Modifying the data


<details><summary>DataActions.setData(location, data, keys = null)</summary>
<p>

`DataActions.setData(location, data, keys = null)`

Overrides any element at the current location with the data specified. See keys note below for description.

</p>
</details>

<details><summary>DataActions.mergeData(location, data, keys = null)</summary>
<p>

`DataActions.mergeData(location, data, keys = null)`

Uses `Object.assign({}, currentStateAtLocation, data)` to mutate the state

</p>
</details>

<details><summary>DataActions.concatFirstData(location, data)</summary>
<p>

`DataActions.concatFirstData(location, data)`

Uses `locationState = data.concat(currentStateAtLocation);` to add the existing state (assuming it is an array) to the end of the data you are inserting, if the `data` value is not an array it will be converted to an array prior to concatenation.

</p>
</details>

<details><summary>DataActions.concatLastData(location, data)</summary>
<p>

`DataActions.concatLastData(location, data)`

Uses `locationState = currentStateAtLocation.concat(data);` to add your data to the end of the array at the location, if the data at the location is not an array, it will be overwritten with a blank array.

</p>
</details>


<details><summary>The keys parameter</summary>
<p>

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

</p>
</details>


##### Removing data

<details><summary>DataActions.unsetData(location)</summary>
<p>

`DataActions.unsetData(location)`

Removes data at a specific location from the state.

</p>
</details>


<details><summary>DataActions.unsetKeysAtLocation(location, keys)</summary>
<p>

`DataActions.unsetKeysAtLocation(location, keys)`

Removes any keys in the keys array at the location.

</p>
</details>



<details><summary>DataActions.clearAllData()</summary>
<p>

`DataActions.clearAllData()`

Restores the state back to how it was when initialised. Useful for logout type events.

</p>
</details>


#### Selectors (DataSelectors)

Bear in mind that under the hood we are using [Reselect](https://github.com/reduxjs/reselect) for our selectors, there are, therefore, two types of every selector - you can read about this in detail in the [reselect documentation here](https://github.com/reduxjs/reselect) - but the cheatsheet version is - if you only have **one instance** of a component you can use the `get***` function, if you will have **multiple instances** of a component you need to use the equivelant `makeGet***` function to build your selectors. To be on the safe side, use the `makeGet***` - it only adds 1 additional line of code.

##### Listening to one location

With all of the above stuff in mind about selectors, remember that `makeGet***` will return a function to select on and so the value passed to a `makeGet***` function does *NOT* perform the same function as the location value that is passed to the returned function.


<details><summary>DataSelectors.makeGetData(cacheName = null)</summary>
<p>

`DataSelectors.makeGetData(cacheName = null)`

returns a function with the signature

* `(state, location, emptyReturnValue = {})`

The optional `cacheName` value instructs the selector to cache the returned function, and additional calls to makeGetData with the same cacheName value will return the same function, make sure that when doing this, the resulting function call also has the same location: **as a tip** use the location as the cacheName.

This returns a function that can be used to select data like this:

```
const makeMapStateToProps = () => {
  const getData = DataSelectors.makeGetData();

  function mapStateToProps(state) {
    return {
      _alertsCounter: getData(state, 'user.alerts.counter', 0),
    };
  }

  return mapStateToProps;
};
```

Which will return the data in user.alerts.counter, or 0 if it does not exist.

It will appear on the component like this:

```
console.log(this.props.alertsCounter); // reads 0 if not defined, something else if it is 
```

</p>
</details>


<details><summary>DataSelectors.getData()</summary>
<p>

`DataSelectors.getData()`


```
const makeMapStateToProps = () => {
  function mapStateToProps(state) {
    return {
      alertsCounter: DataSelectors.getData(state, 'user.alerts.counter', 0),
    };
  }

  return mapStateToProps;
};
```

Which will return the data in user.alerts.counter, or 0 if it does not exist.

It will appear on the component like this:

```
console.log(this.props.alertsCounter); // reads 0 if not defined, something else if it is 
```

</p>
</details>



##### Listening to multiple locations

Now, there is a problem with these selectors, while they may provide you with convenience, the whole point of selectors is to select just the data that changes so you don't end up render thrashing. Because of the structure of these selectors, they can lead to bad performance if missused. In general, it is better to overselect data (i.e. select staticData instead of staticData.one and staticData.two, even i there is staticData.three in the state) or use multiple selectors on the same component that have good re-use and caching than to use these.

What this is useful for is assigning data to specific keys, all from the same data structure, like `current, previous, next` in a news article app, for instance.


<details><summary>DataSelectors.makeGetDataMulti()</summary>
<p>

`DataSelectors.makeGetDataMulti()`

returns a function with the signature

* `(state, inputLocations)`

where inputLocations is an array of object like this:

```
{
  name: <string> // the name the connected component will reference this value by
  location: <string> // the location to pull data from
  emptyReturnValue: <any> // optional return value if not found, defaults to empty object {}
}
```

eg:

```
[
  { name: 'appState', location: 'app.state' },
  { name: 'userAlertsCounter', location: 'user.alerts.counter', emptyReturnValue: 0},
  ...
]
```

This returns a function that can be used to select data like this:

```
const makeMapStateToProps = () => {
  const getDataMulti = DataSelectors.makeGetDataMullti();

  function mapStateToProps(state) {
    return {
      globalData: getDataMulti(state, [
        { name: 'appState', location: 'app.state' },
        { name: 'userAlertsCounter', location: 'user.alerts.counter', emptyReturnValue: 0},
      ]),
    };
  }

  return mapStateToProps;
};
```

Which will return the data both the app.state location and the user.alerts.counter location

It will appear on the component like this:

```
console.log(this.props.globalData.appState); // contains the value in app.state or {} if undefined
console.log(this.props.globalData.userAlertsCounter); // contains teh value in user.alerts.counter or 0 if undefined
```


</p>
</details>

<details><summary>DataSelectors.getDataMulti()</summary>
<p>

`DataSelectors.getDataMulti()`

returns a function with the signature

* `(state, inputLocations)`

where inputLocations is an array of object like this:

```
{
  name: <string> // the name the connected component will reference this value by
  location: <string> // the location to pull data from
  emptyReturnValue: <any> // optional return value if not found, defaults to empty object {}
}
```

eg:

```
[
  { name: 'appState', location: 'app.state' },
  { name: 'userAlertsCounter', location: 'user.alerts.counter', emptyReturnValue: 0},
  ...
]
```

This returns a function that can be used to select data like this:

```
const makeMapStateToProps = () => {
  function mapStateToProps(state) {
    return {
      globalData: DataSelectors.getDataMulti(state, [
        { name: 'appState', location: 'app.state' },
        { name: 'userAlertsCounter', location: 'user.alerts.counter', emptyReturnValue: 0},
      ]),
    };
  }

  return mapStateToProps;
};
```

Which will return the data both the app.state location and the user.alerts.counter location

It will appear on the component like this:

```
console.log(this.props.globalData.appState); // contains the value in app.state or {} if undefined
console.log(this.props.globalData.userAlertsCounter); // contains teh value in user.alerts.counter or 0 if undefined
```


</p>
</details>


### The Network API

TODO

## Custom Actions, Reducers, Selectors and Sagas

This library provides a bunch of actions, reducers, selectors and sagas to perform the pre-canned set of tasks it was designed for, that is not to say that it is limited to just those things, you can plug your stuff into the underlying store easily

<details><summary>Actions and Reducers</summary>
<p>

You can specify your own actions and reducers by passing in the apropriate reducers to the `additionalReducers` prop on the `ReduxWrapper` component. Once you have specified them, you can call dispatch whatever actions they respond to from any connected component.

</p>
</details>


<details><summary>Selectors</summary>
<p>

You can build your own selectors anywhere, and just include them - react-redux-with-networking-helper uses reselect to build it's selectors, but you can use anything.

</p>
</details>


<details><summary>Sagas</summary>
<p>

TODO

</p>
</details>


## Internal structure and how it all slots together (for contributors?)

TODO


## TODO

 * Finish the documentation / make some example apps / refactor it
 * Provide additional / custom sagas to the initialisation of the library
 * Support all network methods (PATCH/GET/POST only right now)
 * Pass back headers to the various request lifecycle hooks
 * Test on dom react (non react-native) project / environment
 * Propper dev setup / linting etc.
 * TODO convenience method for selector creation so you don't have to reference immer directly
 * Probably loads of other stuff ;-)
 * Removal / invalidation of global headers?
 * Some kind of debugging switch for selectors etc. to see performance 
 * a way to select between shalow and deep equity checking
 * Cleanup the locationStore variable in the referenceData selector
 * A flag to toggle the redux logging middleware
 * stateUpdatedKeys - is it used?
 * Update the dependencies - don't need strict version numbers on stuff like prop-types etc.
 * When cancelling active network request SAGA forks, the axios transactions are not interrupted and will still complete and return, this can lead to performance problems as the underlying device will probably limit how many connections are allowed, meaning its possible to take ages for things to complete even though the sagas are dead and don't care about the response
 * We don't properly cleanup the timeouts when calling LOBAL_NETWORK_CLEAR_NETWORK_DATA

