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


## Selectors - makeGet and get

Bear in mind that under the hood we are using [Reselect](https://github.com/reduxjs/reselect) for our selectors, there are, therefore, two types of every selector - you can read about this in detail in the [reselect documentation here](https://github.com/reduxjs/reselect#sharing-selectors-with-props-across-multiple-component-instances) - but the cheatsheet version is - if you only have **one instance** of a component you can use the `get***` function, if you will have **multiple instances** of a component you need to use the equivelant `makeGet***` function to build your selectors. To be on the safe side, use the `makeGet***` - it only adds 1 additional line of code.

For some selectors we allow for caching, that caching is applied to the `makeGet***` functions so that instead of having multiple components with many functions that do the same thing, we have multiple components with a single function that does the same thing.


## APIs

There are two different API's - the Data API and the Network API. There is no link from the Data API to the Network API, but there is a link from the Network API to the Data API - that is to say, network requests can modify the 'global state'.

## The Data API

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

Remember that `makeGet***` will return a function to select on and so the value passed to a `makeGet***` function does *NOT* perform the same function as the location value that is passed to the returned function. [Read more here.](#Selectors---makeGet-and-get)


##### Listening to one location

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



##### Multiple locations

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


## The Network API


























#### Actions (NetworkActions)

##### Starting a Network Transaction

TODO flow chart of a network request here

Network transactions have a variety of configuration options, all detailed in the `NetworkActions.start*****` documentation, but fundementally there are two different types of request, and it matters because of how you will access them with the selectors:

 * Single - has an identifier, and a state - good for *getting an individual users details*
 * Multiple - has an identifier, a sub identifier, and each identifier/sub identifer combo has its own state - good for *getting paginated data*

In addition, there are two types of data when it comes to network request

 * The current state of the network request - you 'tune into' this with `makeGetNetworkData` or `getNetworkData` and it contains data about the current state of the transaction but does NOT (by default, although you can make it) contain the success response data - it will only contain error data by default.
 * The response data - usually it is expected that this be dumped onto the global state and be accessed with the `DataSelectors` - you need to see the `responseTarget` parameter for more information in the `NetworkActions.start*****`

The framework provides massive flexibility in how you handle response data, errors etc. but **the main idea is that the networking component updates the global state.**


<details><summary>NetworkActions.startGET(config), NetworkActions.startPOST(config), NetworkActions.startPATCH(config)</summary>
<p>

 * `NetworkActions.startGET(config)` 
 * `NetworkActions.startPOST(config)` 
 * `NetworkActions.startPATCH(config)`

The configuration object has these parameters:

###### The main stuff

**The request data**

| Value | Required | Default | Description                                                                 
| --- | --- | --- | --- 
| `url` | `true` | `null` | This is the fully qualified domain name for the request
| `data` | `false` | `{}` | The request data, ignored for GET requests
| `multi` | `false` | `false` | if this is true, there can be more than 1 request for the same identifier, see `multiIdentifier`
| `additionalHeaders` | `false` | `[]` | array of additional headers in the format of `{ name: 'header-name', value: 'header-value' }` to be added on, these are applied LAST so can overwride global headers


**Where to put the response**

| Value | Required | Default | Description                                                                 
| --- | --- | --- | --- 
| `responseTarget` | `false` | `null` | [see location documentation](#locations) - a string like `location.other.place` to target in the global data or null to not put it into the global data, use the `successFormatHandler` and `keyExtractor` to decide the format of what ends up here
| `responseTargetMethod` | `false` | `set` | decides how to handle placement of the data onto the `responseTarget`, merge will shallow merge the object, set will just set it, concatFirst and concatLast will perform an array concatenation (start of end of the existing array) - note concat does not work with a value set on `keyExtractor`, which will be ignored


**How to listen to the status of the network request**

| Value | Required | Default | Description                                                                 
| --- | --- | --- | --- 
| `identifier` | `false` | `null` | Identifier used to monitor the status of this request if you don't need to hook into the response at all set this to null
| `multiIdentifier` | `false` | `null` | If this is not null, it will be used as a sub identifier (see selectors to understand how it is used), if null and multi is set to true, uuid will be generated
| `dumpSuccessResponseToNetworkState` | `false` | `false` | if this is set to true, the data will be put onto the network state (specified by `identifier/multiIdentifier`). Setting this to true will not stop anything that happened with responseTarget and it's chain of actions.


**Lifecyle hooks**

TODO this list in the order they are applied

| Value | Required | Default | Description                                                                 
| --- | --- | --- | --- 
| `successFormatHandler(data, statusCode, existingData, responseHeaders) => data` | `false` | `null` | a function that is called with any 200 <> 299 status code, can return an array of objects to be dumped into the `responseTarget` - the `keyExtractor` will be called to distribute them properly, if this does not return an array, it will not call the `keyExtractor` at all and just dump onto the `responseTarget`, if the `keyExtractor` is null, the response will just be dumped onto the `responseTarget` - `existingData` is NULL if no `responseTarget` specified, or is the current data in the store at that target
| `errorFormatHandler(data, statusCode, err, responseHeaders) => { return data; }` | `false` | `null` | a function that is called with any other status code not captured by the success handler, whatever is returned by this function is returned as the data attribute when there is an error, note it is possible for this function to recieve an exception (Error) type as well as an actual response, the statusCode will be -1 if this is the case with the error as the third argument, and the error.toString() value as the data
| `successCallback(formattedData, originalData, statusCode, responseHeaders) => {}` | `false` | `null` | a function that is called with any 200 <> 299 status code after the sucessFormatHandler in case you need to do any side effects as a result of a success condition
| `errorCallback(formattedData, originalData, statusCode, responseHeaders) => {}` | `false` | `null` | called when there is an error, inverse of `successCallback`
| `preDataInsertCleanupHandler(existingData, modifiedKeys, networkState, responseHeaders) => {}` | `false` | `null` | this function is called right before successFormatHandler and the insert action for response target which can be used to remove / clean up old state changes
| `keyExtractor(item, index) => 'key'` | `false` | `null` | this is called for every element returned by the `successFormatHandler` and should return a key that will be used to allocate the data to the `responseTarget.[key]` location. if it is null then it will not be used and the data will be just dumped onto the object, this will not be called if the data returned from `successFormatHandler` is not an array
| `setGlobalHeaders(data, statusCode) => {}` | `false` | `null` | This is called before the success format handler with the same conditions as success format handler (200 <> 299 status) - any thing return by this needs to be an array of `{ name: 'header-name', value: 'header-value' }` and will update the global headers so every subsequent request has this thign in it, useful for authentication. If it does not return an array then nothing happens.


**Retrying, timeouts and multiple similar requests**

| Value | Required | Default | Description                                                                 
| --- | --- | --- | --- 
| `autoRetryOnNetworkReconnection` | `false` | `false` | If autoRetryOnNetworkReconnection is true, we will retry this network request if it fails due to network connectivity once connectivity is re-established, tested with `networkTestAction` set on the `ReduxWrapper`
| `timeout` | `false` | `-1` | Once this many seconds have gone by, the network state will be set to TIMED_OUT, negative numbers are ignored entirely
| `cancelInFlightWithSameIdentifiers` | `false` | `true` | If this is set to true, then we match against some identifier/multiIdentifier combo - if they are the same, any in flight request is cancelled and replaced with the new one.


TODO remove / rework the following params

```
{


  // this is set as a Content-Type header for post requests, will be ignored if any Content-Type header is already set, set to null to just not use this at all
  postDefaultContentType: 'application/json',

}
```

</p>
</details>


##### Clearing network data

<details><summary>clearNetworkData(identifier)</summary>
<p>

`NetworkActions.clearNetworkData(identifier)`

TODO

</p>
</details>

<details><summary>clearAllNetworkData()</summary>
<p>

`NetworkActions.clearAllNetworkData()`

TODO

</p>
</details>


##### Manipulating global headers

<details><summary>addGlobalHeaders(headers)</summary>
<p>

`NetworkActions.addGlobalHeaders(headers)`

TODO

</p>
</details>


#### Selectors (NetworkSelectors)

Remember that `makeGet***` will return a function to select on and so the value passed to a `makeGet***` function does *NOT* perform the same function as the location value that is passed to the returned function. [Read more here.](#Selectors---makeGet-and-get)


##### Listening to a single request

<details><summary>NetworkSelectors.makeGetNetworkData()</summary>
<p>

`NetworkSelectors.makeGetNetworkData()`

TODO

</p>
</details>

<details><summary>NetworkSelectors.getNetworkData()</summary>
<p>

`NetworkSelectors.getNetworkData()`

TODO

</p>
</details>



##### Listening to a multi request

<details><summary>DataSelectors.makeGetNetworkDataMulti()</summary>
<p>

`DataSelectors.makeGetNetworkDataMulti()`

TODO

</p>
</details>

<details><summary>DataSelectors.getNetworkDataMulti()</summary>
<p>

`DataSelectors.getNetworkDataMulti()`

TODO

</p>
</details>








































































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
 * rework the postDefaultContentType config option on requests - should be a global config / with optional override to the specific request

