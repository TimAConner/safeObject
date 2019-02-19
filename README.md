# safeObject

Safe object wraps a normal object in a layer that allows you to select properties on it which would normally throw an error, but instead it returns back undefined.  If you were trying to access a value on an undefined, parameter, for example, it would simply return undefined, not throw an error.  For example:
```js
const mySafeObj = safeObject({});
```
Calling `mySafeObj.a` would return undefined.  Calling `mySafeObj.a.b` would normally throw an error, but with safe object, it would also return undefined.