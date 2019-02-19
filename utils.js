'use strict';

const isNull = (val) => val === null;
const isObject = (val) => isNull(val) === false && typeof val === 'object';
const isDefined = (val) => typeof val !== 'undefined';
const isBoolean = (val) => typeof val === 'boolean';
const isFunction = (val) => typeof val === 'function';

const hasValue = (val) => typeof val !== 'undefined' && val !== null;
const doesObjectHaveAnyProperties = (val) => isObject(val) === true && Object.keys(val).length > 0;

const doesPropertyExist = (val, propertyName) => Object.getOwnPropertyNames(val).indexOf(propertyName) !== -1;
const doesObjHaveProperty = (val, propertyName) => isObject(val) === true && doesPropertyExist(val, propertyName) === true;

const expect = (description, testFunction) => {
  try {
    testFunction();
    console.log(`PASSED: ${description}`);
  } catch (err) {
    console.log(`FAILED: ${description} WITH ERROR: ${err.stack}.`);
  }
};

module.exports = {
  isNull,
  isObject,
  isDefined,
  isBoolean,
  isFunction,
  hasValue,
  doesObjectHaveAnyProperties,
  doesPropertyExist,
  doesObjHaveProperty,
  expect
};