# react-redux-with-networking-helper

#### Required versions**

**react** > 16.8.6
or
**react-native** > 0.60.0 

#### Project

This project aims to produce a low code, high productivity solution to working with React/Redux and networking.

It stores networking state and 'global' state separately, but provides tools for combining the two effectively - keeping a single source of truth about your application while simultaneously updating it with network data.

In addition, the library provides some utilities to handle disconnection and network retry as well as 'expiration' of network requests over time.

This project was built for React Native, although its dependencies should all work with a React DOM project.


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


## Examples

TODO

* Using the Data API
* Using the Networking API
* Using the Data and Networking API together
* Advanced and fun stuff


## How To Think About It

The whole point of this library is to have a single source of data truth - the 'global state' - this state can then be 'tuned in to' by various components using the connect method from react-redux in order to get updates. We have a bunch of selectors for selecting this data in a convenient way.

This 'global state' is then updated, either directly through actions on components - i.e. when you need to update the user's current handle - or indirectly through network data - i.e. when you just logged in and need to update the current users object.


## Under the Hood

Under the hood we use the following:

 * **axios** - for all the networking
 * **react-redux** - for the global state
 * **redux-saga** - to handle sagary stuff (networking, in this case)
 * **reselect** - to let us efficiently subscribe to state changes on components without causing re-renders
 * **immer** - for easy global state manipulation


## A note for react-native

There are problems with react native on android with large states when usinig the redux-persist library. If you want to work around this, you need to install [redux-persist-filesystem-storage](https://github.com/robwalkerco/redux-persist-filesystem-storage) into your project and link it correctly, then pass the storage into the Wrapper like this:

```
import FilesystemStorage from 'redux-persist-filesystem-storage';
import { Platform } from 'react-native';
...

<ReduxWrapper
  persistorStorageOverride={ Platform.OS === 'android' ? FilesystemStorage : null }
<
...
</ReduxWrapper>

...
```

## Something about the persistor

We only persist network transactions to the storage once they are finished, this is to stop the case where the runtime crashes, and is then restarted but with half complete network transaction states in the global state that no saga is operating on and will never complete.


## Locations

Locations are an important part of the library. They are specified as string with the following syntax and effectively they dictate where you read and write data:

`some.location.in.the.data.store`

You can also include array indices like this

`some.location.with.an.array.[3].in.the.[0].data.store`

* Whenever **putting data into the data store**, it will create all levels specified if they do not exist, as objects. 
* Whenever **pulling data out of the data store**, traversal stops once a level is reached that does not exist and an empty object `{}` is returned or whatever was specified as the default value when creating the selector.


## Selectors - makeGet and get

Bear in mind that under the hood we are using [Reselect](https://github.com/reduxjs/reselect) for our selectors, there are, therefore, two types of every selector - you can read about this in detail in the [reselect documentation here](https://github.com/reduxjs/reselect#sharing-selectors-with-props-across-multiple-component-instances) - but the cheatsheet version is - if you only have **one instance** of a component you can use the `get***` function, if you will have **multiple instances** of a component you need to use the equivalent `makeGet***` function to build your selectors. To be on the safe side, use the `makeGet***` - it only adds 1 additional line of code.

For some selectors we allow for caching, that caching is applied to the `makeGet***` functions so that instead of having multiple components with many functions that do the same thing, we have multiple components with a single function that does the same thing.


## APIs

There are two different API's that have actions and selectors: the **Data API** and the **Network API**. There is no link from the Data API to the Network API, but there is a link from the Network API to the Data API - that is to say, network requests can modify the 'global state'.

In addition, there is the **ReduxWrapper API** which is the main component you will use to wrap your application.

## The ReduxWrapper API


<details><summary>ReduxWrapper properties</summary>
<p>


| Property | Default | Description                                                      
| --- | --- | ---
| `setDebugWithCurlirize` | `false` | Will print all network out as curl commands
| `networkExceptionCallback` | `(err) => {}` | Is called for any exceptions that occur in axios, *application order* can be seen [here](#network-request-flow)
| `globalResponseIntercept` | `(obj) => {}` | Is called for all network responses with the obj formatted like this:<br><br>{<br>`    type`: 'error' or 'success',<br>`    insertData`: 'data after relevant formatters are applied',<br>`    responseData`: 'the original network response data' or 'exception object if responseStatusCode is -1',<br>`    responseStatusCode:` 'response status code' or '-1 if an exception',<br>`    responseHeaders`: 'response headers' or 'empty object if an exception',<br>}<br><br>*application order* can be seen [here](#network-request-flow)
| `globalErrorFormatter` | `(data) => data` | This is called for any error condition, see order [here](#network-request-flow), and should return any data format you want to use in subsequent items, this is useful because often you want to format your error data from an API in a specific, and global way.
| `additionalReducers` | `[]` | Should contain any additional reducers that you want to include in the state, you can fire actions that will be picked up by these in any connected component.
| `networkTestAction` | `{}` | If specified as some `NetworkActions.start***` action, this will be used to test for network connectivity changes once a downtime event is triggered. I.e.<br><br> `networkTestAction={NetworkActions.startGET({url: 'https://some-test-url'})}`.<br><br>All network connections that fail, with this specified, will be queued up if they have `autoRetryOnNetworkReconnection` set to true on their individual config and then will be actioned when this network request succeeds
| `networkTestDelay` | `10000` | This is the delay between uptime checks on the `networkTestAction`
| `persistorStorageOverride` | `null` | Provide an alternative storage method for the persistor, see more [here](#a-note-for-react-native)
| `defaultContentTypes`| `defaultContentTypesObject` | For each type of request, this object specifies the default value for the `Content-Type` header. This value can and will be overwritten by other headers, see header order of priority [here](#header-order-priority). See below this table for the default values, null set for any method will not apply any value to `Content-Type`

`defaultContentTypesObject` default value

```
{
    get: null,
    post: 'application/json',
    patch: 'application/json',
    delete: 'application/json',
    head: null,
    options: null,
    put: 'application/json',
}
```

</p>
</details>


<details><summary>ReduxWrapper methods</summary>
<p>

You can access methods on the ReduxWrapper like this:

```
<ReduxWrapper
  ref={(el) => { this.wrapper = el; }}
>
  {/* Your app children here */}
</ReduxWrapper>
```

| Function | Description                                                      
| --- | --- 
| `persistorPurge()` | Will clear the persistor storage completely.


</p>
</details>

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

in contrast, not using a keys array gives this behaviour:

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


<details><summary>DataActions.clearWithIgnoreList(ignores)</summary>
<p>

`DataActions.clearWithIgnoreList(ignores)`

Removes everything from the state, while ignoring any keys in 'ignores'

This would remove all keys on the global data store except `userObject` and `applicationVersion`

```
DataActions.clearWithIgnoreList(['userObject', 'applicationVersion'])
```

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
function mapStateToProps(state) {
  return {
    alertsCounter: DataSelectors.getData(state, 'user.alerts.counter', 0),
  };
}
```

Which will return the data in user.alerts.counter, or 0 if it does not exist.

It will appear on the component like this:

```
console.log(this.props.alertsCounter); // reads 0 if not defined, something else if it is 
```

</p>
</details>



##### Multiple locations

Now, there is a problem with these selectors, while they may provide you with convenience, the whole point of selectors is to select just the data that changes so you don't end up render thrashing. Because of the structure of these selectors, they can lead to bad performance if miss-used. In general, it is better to over-select data (i.e. select staticData instead of staticData.one and staticData.two, even i there is staticData.three in the state) or use multiple selectors on the same component that have good re-use and caching than to use these.

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

`DataSelectors.getDataMulti(state, inputLocations)`

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
function mapStateToProps(state) {
  return {
    globalData: DataSelectors.getDataMulti(state, [
      { name: 'appState', location: 'app.state' },
      { name: 'userAlertsCounter', location: 'user.alerts.counter', emptyReturnValue: 0},
    ]),
  };
}
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

Network transactions have a variety of configuration options, all detailed in the `NetworkActions.start*****` documentation, but fundamentally there are two different types of request, and it matters because of how you will access them with the selectors:

 * Single - has an identifier, and a state - good for *getting an individual users details*
 * Multiple - has an identifier, a sub identifier, and each identifier/sub identifier combo has its own state - good for *getting paginated data*

In addition, there are two types of data when it comes to network request

 * The current state of the network request - you 'tune into' this with `makeGetNetworkData` or `getNetworkData` and it contains data about the current state of the transaction but does NOT (by default, although you can make it) contain the success response data - it will only contain error data by default.
 * The response data - usually it is expected that this be dumped onto the global state and be accessed with the `DataSelectors` - you need to see the `responseTarget` parameter for more information in the `NetworkActions.start*****`

The framework provides massive flexibility in how you handle response data, errors etc. but **the main idea is that the networking component updates the global state.**

##### Network request flow

| >= 200 && <= 299 | Other status codes | Exception                                                         
| --- | --- | ---
| `requestConfig.successFormatHandler` | *`ReduxWrapper.globalErrorFormatter`* | *`ReduxWrapper.networkExceptionCallback`*
| `requestConfig.setGlobalHeaders` | `requestConfig.errorFormatHandler` | `requestConfig.errorFormatHandler`
| `requestConfig.keyExtractor` | `requestConfig.errorCallback` | *`ReduxWrapper.globalResponseIntercept`* 
| `requestConfig.preDataInsertCleanupHandler` | *`ReduxWrapper.globalResponseIntercept`*
| `requestConfig.successCallback` |
| *`ReduxWrapper.globalResponseIntercept`* |


##### Header order priority

There are a variety of ways to modify headers for an individual request - here is the order in which they are applied to any request:

 * `ReduxWrapper.defaultContentTypes` is applied for the specific request type, setting the `Content-Type` header if not null
 * The global headers are then collected, these are set through either `requestConfig.setGlobalHeaders` or directly through `NetworkActions.setGlobalHeaders`. If there is a `Content-Type` header, it will override the header set in the previous step.
 * The request specific headers are then applied from `requestConfig.additionalHeaders`, overwriting anything from the previous two steps if there are conflicts


<details><summary>NetworkActions.startGET(requestConfig), NetworkActions.startPOST(requestConfig), NetworkActions.startPATCH(requestConfig), NetworkActions.startDELETE(requestConfig), NetworkActions.startHEAD(requestConfig), NetworkActions.startOPTIONS(requestConfig), NetworkActions.startPUT(requestConfig)</summary>
<p>

 * `NetworkActions.startGET(requestConfig)` 
 * `NetworkActions.startPOST(requestConfig)` 
 * `NetworkActions.startPATCH(requestConfig)`
 * `NetworkActions.startDELETE(requestConfig)`
 * `NetworkActions.startHEAD(requestConfig)`
 * `NetworkActions.startOPTIONS(requestConfig)`
 * `NetworkActions.startPUT(requestConfig)`

The `requestConfig` object has these parameters:

**The request data**

| Value | Required | Default | Description                                                                 
| --- | --- | --- | --- 
| `url` | `true` | `null` | This is the fully qualified domain name for the request
| `data` | `false` | `{}` | The request data, ignored for GET requests
| `multi` | `false` | `false` | if this is true, there can be more than 1 request for the same identifier, see `multiIdentifier`
| `additionalHeaders` | `false` | `[]` | array of additional headers in the format of `{ name: 'header-name', value: 'header-value' }` to be added on, these are applied LAST so can override global headers


**Where to put the response**

| Value | Required | Default | Description                                                                 
| --- | --- | --- | --- 
| `responseTarget` | `false` | `null` | [see location documentation](#locations) - a string like `location.other.place` to target in the global data or null to not put it into the global data, use the `successFormatHandler` and `keyExtractor` to decide the format of what ends up here
| `responseTargetMethod` | `false` | `set` | decides how to handle placement of the data onto the `responseTarget`, `merge` will shallow merge the object, `set` will just set it, `concatFirst` and `concatLast` will perform an array concatenation (start of end of the existing array) - note the concat values do not work with a value set on `keyExtractor` - the extractor will be ignored


**How to listen to the status of the network request**

| Value | Required | Default | Description                                                                 
| --- | --- | --- | --- 
| `identifier` | `false` | `null` | Identifier used to monitor the status of this request if you don't need to hook into the response at all set this to null, check out the [selectors section](#selectors-networkselectors) for more info
| `multiIdentifier` | `false` | `null` | If this is not null, it will be used as a sub identifier (see selectors to understand how it is used), if null and multi is set to true, uuid will be generated, check out the [selectors section](#selectors-networkselectors) for more info
| `dumpSuccessResponseToNetworkState` | `false` | `false` | if this is set to true, the data will be put onto the network state (specified by `identifier/multiIdentifier`). Setting this to true will not stop anything that happened with responseTarget and its chain of actions.


**Lifecyle hooks**

*application order* can be seen [here](#network-request-flow)

| Value | Required | Default | Description                                                                 
| --- | --- | --- | --- 
| `successFormatHandler(data, statusCode, existingData, responseHeaders) => data` | `false` | `null` | a function that is called with any 200 <> 299 status code, can return an array of objects to be dumped into the `responseTarget` - the `keyExtractor` will be called to distribute them properly, if this does not return an array, it will not call the `keyExtractor` at all and just dump onto the `responseTarget`, if the `keyExtractor` is null, the response will just be dumped onto the `responseTarget` - `existingData` is NULL if no `responseTarget` specified, or is the current data in the store at that target
| `errorFormatHandler(data, statusCode, err, responseHeaders) => { return data; }` | `false` | `null` | a function that is called with any other status code not captured by the success handler, whatever is returned by this function is returned as the data attribute when there is an error, note it is possible for this function to receive an exception (Error) type as well as an actual response, the statusCode will be -1 if this is the case with the error as the third argument, and the error.toString() value as the data
| `successCallback(formattedData, originalData, statusCode, responseHeaders) => {}` | `false` | `null` | a function that is called with any 200 <> 299 status code after the sucessFormatHandler in case you need to do any side effects as a result of a success condition
| `errorCallback(formattedData, originalData, statusCode, responseHeaders) => {}` | `false` | `null` | called when there is an error, inverse of `successCallback`
| `preDataInsertCleanupHandler(existingData, modifiedKeys, networkState, responseHeaders) => {}` | `false` | `null` | this function is called right before successFormatHandler and the insert action for response target which can be used to remove / clean up old state changes
| `keyExtractor(item, index) => 'key'` | `false` | `null` | this is called for every element returned by the `successFormatHandler` and should return a key that will be used to allocate the data to the `responseTarget.[key]` location. if it is null then it will not be used and the data will be just dumped onto the object, this will not be called if the data returned from `successFormatHandler` is not an array
| `setGlobalHeaders(formattedData, originalData, statusCode) => {}` | `false` | `null` | This is called before the success format handler with the same conditions as success format handler (200 <> 299 status) - any thing return by this needs to be an array of `{ name: 'header-name', value: 'header-value' }` and will update the global headers so every subsequent request has this set of headers, useful for authentication. If it does not return an array then nothing happens.


**Retrying, timeouts and multiple similar requests**

| Value | Required | Default | Description                                                                 
| --- | --- | --- | --- 
| `autoRetryOnNetworkReconnection` | `false` | `false` | If autoRetryOnNetworkReconnection is true, we will retry this network request if it fails due to network connectivity once connectivity is re-established, tested with `networkTestAction` set on the `ReduxWrapper`. Make sure `networkTestAction` is specified or these network connections will not be retried.
| `timeout` | `false` | `-1` | Once this many seconds have gone by, the network state will be set to EXPIRED, negative numbers are ignored entirely
| `cancelInFlightWithSameIdentifiers` | `false` | `true` | If this is set to true, then we match against some identifier/multiIdentifier combo - if they are the same, any in flight request is cancelled and replaced with the new one.



</p>
</details>


##### Clearing network data

<details><summary>clearNetworkData(identifier)</summary>
<p>

`NetworkActions.clearNetworkData(identifier)`

This will clear all the network response data for a given identifier, regardless of if it is single or multi

</p>
</details>

<details><summary>clearAllNetworkData()</summary>
<p>

`NetworkActions.clearAllNetworkData()`

This completely clears everything in the network state, setting the whole thing to default, including all headers and anything else.

</p>
</details>


##### Manipulating global headers

<details><summary>setGlobalHeaders(headers)</summary>
<p>

`NetworkActions.setGlobalHeaders(headers)`

You can call this to set a global header, see how global headers are applied [here](#header-order-priority). 

Format for `headers` parameter is

```
[
  {name: 'Content-Type', value :'application/json'}
  ....
]
```

Any headers in the state with the same name will be overwritten.

</p>
</details>


#### Selectors (NetworkSelectors)

Remember that `makeGet***` will return a function to select on and so the value passed to a `makeGet***` function does *NOT* perform the same function as the location value that is passed to the returned function. [Read more here.](#Selectors---makeGet-and-get)


##### Network response object

When using a network selector there are a couple of scenarios to worry about:

1. Single request selectors always return an object with the structure outlined below
2. Multi request selectors return a keyed object, if a request was started for a specific key then it will have the structure outline below, if it is not started it will be undefined - this is a limitation because we do not know ahead of time what the 'multi identifiers' will be so can't get the selector to populate them with 'not started'


<details><summary>Structure of the response object</summary>
<p>


The object takes this form: 

```
{
  state: NetworkStates.NOT_STARTED || NetworkStates.LOADING || NetworkStates.RELOADING ||  || NetworkStates.ERROR || NetworkStates.SUCCESS || NetworkStates.EXPIRED,
  statusCode: null || <response status code>,
  data: {} || <error data> || <success data if requestConfig.dumpSuccessResponseToNetworkState set to true>,
  started: false || true,
  finished: false || true,
  startTimestamp: null || <timestamp>,
  endTimestamp: null || <timestamp>,
  stateUpdatedKeys: null || <array of keys>,
  _internalID: null || <internal tracking ID for this library>,
}
```

Some details about the values:

| Value | Description                                                                 
| --- | ---
| `state` | Is a value that indicates what sort of state the network request is in so you can show loading spinners etc.
| `statusCode` | Will be null until the `state` is either `NetworkStates.ERROR` or `NetworkStates.SUCCESS` or `NetworkStates.EXPIRED`
| `data` | Will contain data if `state` `=` `NetworkStates.ERROR` OR if `state` `=` `NetworkStates.SUCCESS` and `requestConfig.dumpSuccessResponseToNetworkState` `=` `true`
| `started` | False if the request is not started for single requests, it will never be false for a multi request as starting a multi request is the thing that populates the relevant key on the multi identifier object
| `false` | False if the state is not `NetworkStates.ERROR` or `NetworkStates.SUCCESS` or `NetworkStates.EXPIRED`
| `startedTimestamp` | The time the network request was started
| `endTimestamp` | The time the network request ended
| `stateUpdatedKeys` | Details the keys the `requestConfig.keyExtractor` updated as part of this request
| `_internalID` | Used by this library internally

</p>
</details>


<details><summary>NetworkStates object</summary>
<p>

Network requests have a set of 'states' associated with them - you can compare the current state of a network request to the `NetworkStates` object

```
import { NetworkStates } from 'react-redux-with-networking-helper';

console.log(NetworkState);

{
  NOT_STARTED: 'not-started', // not started - note this will never be seen for multi requests
  LOADING: 'loading', // we are loading something (for the first time)
  RELOADING: 'reloading', // we are 're' loading something
  ERROR: 'error', // there was an error
  SUCCESS: 'success', // there was success
  EXPIRED: 'timed-out', // a request has been expired because of the requestConfig.timeout value
}
```

</p>
</details>




##### Listening to a single request

<details><summary>NetworkSelectors.makeGetNetworkData()</summary>
<p>

`NetworkSelectors.makeGetNetworkData()`

Returns a function with the signature

* `(state, identifier)`

Where identifier matches whatever you used in the initial request config.

The usage is like this:

```
const makeMapStateToProps = () => {
  const getNetworkData = NetworkSelectors.makeGetNetworkData();

  function mapStateToProps(state) {
    return {
      _networkData: getNetworkData(state, 'user-settings'),
    };
  }

  return mapStateToProps;
};
```

Which returns data in this format onto the `_networkData` property, details of which can be found [here](#network-response-object)


</p>
</details>


<details><summary>NetworkSelectors.getNetworkData()</summary>
<p>

`NetworkSelectors.getNetworkData(state, identifier)`

Where identifier matches whatever you used in the initial request config.

The usage is like this:

```
function mapStateToProps(state) {
  return {
    _networkData: NetworkSelectors.getNetworkData(state, 'user-settings'),
  };
}

return mapStateToProps;
```

Which returns data in this format onto the `_networkData` property, details of which can be found [here](#network-response-object)

</p>
</details>



##### Listening to a multi request

<details><summary>DataSelectors.makeGetNetworkDataMulti()</summary>
<p>

`DataSelectors.makeGetNetworkDataMulti()`

Returns a function with the signature

* `(state, identifier)`

Where identifier matches whatever you used in the initial request config.

The usage is like this:

```
const makeMapStateToProps = () => {
  const getNetworkDataMulti = NetworkSelectors.makeGetNetworkDataMulti();

  function mapStateToProps(state) {
    return {
      _networkData: getNetworkDataMulti(state, 'user-settings'),
    };
  }

  return mapStateToProps;
};
```

Which returns data in this format onto the `_networkData` property, details of which can be found [here](#network-response-object)

</p>
</details>

<details><summary>DataSelectors.getNetworkDataMulti()</summary>
<p>

`DataSelectors.getNetworkDataMulti(state, identifier)`

Where identifier matches whatever you used in the initial request config.

The usage is like this:

```
function mapStateToProps(state) {
  return {
    _networkData: NetworkSelectors.getNetworkDataMulti(state, 'user-settings'),
  };
}

return mapStateToProps;
```

Which returns data in this format onto the `_networkData` property, details of which can be found [here](#network-response-object)

</p>
</details>








































































## Custom Actions, Reducers, Selectors and Sagas

This library provides a bunch of actions, reducers, selectors and sagas to perform the pre-canned set of tasks it was designed for, that is not to say that it is limited to just those things, you can plug your stuff into the underlying store easily

<details><summary>Actions and Reducers</summary>
<p>

You can specify your own actions and reducers by passing in the appropriate reducers to the `additionalReducers` prop on the `ReduxWrapper` component. Once you have specified them, you can call dispatch whatever actions they respond to from any connected component.

</p>
</details>


<details><summary>Selectors</summary>
<p>

You can build your own selectors anywhere, and just include them - react-redux-with-networking-helper uses reselect to build it's selectors, but you can use anything.

</p>
</details>


<details><summary>Sagas</summary>
<p>

TODO - not supported yet

</p>
</details>




## TODO

 * Make examples and finish documentation
 * Provide additional / custom sagas to the initialisation of the library
 * Test on dom react (non react-native) project / environment
 * TODO convenience method for selector creation so you don't have to reference immer directly
 * Removal / invalidation of global headers?
 * Some kind of debugging switch for selectors etc. to see performance 
 * a way to select between shallow and deep equity checking
 * Cleanup the locationStore variable in the referenceData selector
 * A flag to toggle the redux logging middleware
 * Update the dependencies - don't need strict version numbers on stuff like prop-types etc.
 * When cancelling active network request SAGA forks, the axios transactions are not interrupted and will still complete and return, this can lead to performance problems as the underlying device will probably limit how many connections are allowed, meaning its possible to take ages for things to complete even though the sagas are dead and don't care about the response
 * We don't properly cleanup the timeouts when calling LOCAL_NETWORK_CLEAR_NETWORK_DATA
 * need to do something to support state migrations as is supported by react-redux
 * test what will happen is networkTestAction is not specified - we need to not store up network requests if we have no way of unblocking them etc.
 * toggle if you want to even use the persistor

