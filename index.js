'use strict';
const util = require('util');

const {
  isNull,
  isObject,
  isDefined,
  isBoolean,
  hasValue,
  doesObjectHaveAnyProperties,
  doesObjHaveProperty
} = require('./utils');

const getValidationErrorString = (variableName, variableValue, properType) => {
  const string = `safeObject '${variableName}' option must be of type '${properType}'. Its value is: ${variableValue} with type '${typeof variableValue}'.`;
  return string;
};

/*
  Needed because Node tries to find a property on the object
  with a symbol of inspect as the property
  and we don't implement an inspect function here.
*/
const isNodeInspectingObj = (property) => (
  property === util.inspect.custom
  || property === Symbol.iterator
  || property === Symbol.toStringTag
  || property === 'inspect'
  || property === 'stack'
);

const shouldGetProperty = (safeObjOptions, propAddress) => {
  if (safeObjOptions.ignoreNodeInspection === false) {
    return true;
  }
  if (safeObjOptions.ignoreNodeInspection === true && isNodeInspectingObj(propAddress) === false) {
    return true;
  }

  return false;
};


const determineIfChildShouldBeSafeObject = (val, safeObjOptions) => (
  safeObjOptions.shouldMakeChildrenSafeObject === true && isObject(val) === true
    ? safeObject(val, safeObjOptions)
    : val
);

const getProperty = (safeObjOptions) => (originalObj, propAddress) => {
  if (shouldGetProperty(safeObjOptions, propAddress) === true) {
    const arrayOfProps = propAddress.split('.');
    let curPropValue = originalObj;

    // If the value is not undefined or null
    if (hasValue(curPropValue) === false) {
      return determineIfChildShouldBeSafeObject(curPropValue, safeObjOptions);
    }

    // For loop is required because we can't break out of a forEach.
    for (let i = 0; i < arrayOfProps.length; i += 1) { // Important that i += 1 instead 

      // If the current value is null or undefined, we won't be able to look at anything deeper.
      if (isNull(curPropValue) === true || isDefined(curPropValue) === false) {
        console.log(safeObjOptions.valueToReturnInsteadOfError);
        console.log((safeObjOptions.valueToReturnInsteadOfError instanceof Error));
        // If being used to throw an error other than Error, throw the valueToReturnInsteadOfError.
        if ((safeObjOptions.valueToReturnInsteadOfError instanceof Error) === true) {
          console.log('here');
          throw new safeObjOptions.valueToReturnInsteadOfError();
        }

        curPropValue = safeObjOptions.valueToReturnInsteadOfError;
        break; // Break so we don't try to look at an undefined value.
      }

      const nextProperty = arrayOfProps[i];
      const nextValue = curPropValue[nextProperty];

      if (isDefined(nextValue) === false) {
        console.log(safeObjOptions.valueToReturnInsteadOfError);
        console.log((safeObjOptions.valueToReturnInsteadOfError instanceof Error));
        // If being used to throw an error other than Error, throw the valueToReturnInsteadOfError.
        if ((safeObjOptions.valueToReturnInsteadOfError instanceof Error) === true) {
          console.log('here');
          throw new safeObjOptions.valueToReturnInsteadOfError();
        }

        curPropValue = safeObjOptions.valueToReturnInsteadOfError;
        break; // Break since a null doesn't have any properties.
      }

      curPropValue = nextValue;
    }

    return determineIfChildShouldBeSafeObject(curPropValue, safeObjOptions);
  }
};

const safeObject = (object, {
  shouldMakeChildrenSafeObject = true,
  ignoreNodeInspection = true,
  valueToReturnInsteadOfError = undefined,
  ...notRequiredProps
} = {}) => {
  if (isBoolean(shouldMakeChildrenSafeObject) === false) {
    const errorString = getValidationErrorString('shouldMakeChildrenSafeObject', shouldMakeChildrenSafeObject, 'boolean');
    throw new Error(errorString);
  }
  if (isBoolean(ignoreNodeInspection) === false) {
    const errorString = getValidationErrorString('ignoreNodeInspection', ignoreNodeInspection, 'boolean');
    throw new Error(errorString);
  }
  if (doesObjectHaveAnyProperties(notRequiredProps) === true) {
    console.log(`Provided safeObject safeObjOptions are not recognized: ${Object.keys(notRequiredProps)}`);
  }
  if (isObject(object) === false) {
    throw new Error('Object passed to safeObject is not an object');
  }

  const objectCopy = { ...object };

  /*
    No getter and setter are set for the __isSafeObject property, 
    so this can't be seen unless you test for __isSafeObject specifically
  */
  Object.defineProperty(objectCopy, '__isSafeObject', { value: true });

  const safeObjOptions = { shouldMakeChildrenSafeObject, ignoreNodeInspection, valueToReturnInsteadOfError };
  const safeObject = new Proxy(objectCopy, {
    get: getProperty(safeObjOptions)
  });

  return safeObject;
};

// Allows safe object to be created using new SafeObject syntax
class SafeObject {
  constructor(object, options) {
    return safeObject(object, options);
  }
};

const isSafeObject = (val) => isObject(val) === true && doesObjHaveProperty(val, '__isSafeObject') === true;

module.exports = {

  // Alternate syntax to define a safe object
  safeObject,
  createSafeObject: safeObject,
  SafeObject,

  isSafeObject
};