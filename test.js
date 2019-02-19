'use strict';

const assert = require('assert');
const { expect } = require('./utils');

const {
  safeObject,
  SafeObject,
  createSafeObject,
  isSafeObject
} = require('./');

const mySafeObject = new SafeObject({
  a: {
    b: 1,
    q: {
      z: {
        r: 1
      }
    }
  },
  c: 'hi',
  d: null
});

const myOtherSafeObject = safeObject({
  human: {
    name: 'Xi',
    weight: 25,
    inventory: {
      hand: 'sword',
      foot: 'boot'
    }
  }
});

const alsoASafeObject = createSafeObject({});

const notASafeObject = {};

expect('mySafeObject to be a safeObject when using new SafeObject', () => {
  assert.deepEqual(isSafeObject(mySafeObject), true);
});

expect('myOtherSafeObject to be a safeObject when using safeObject', () => {
  assert.deepEqual(isSafeObject(myOtherSafeObject), true);
});

expect('alsoASafeObject to be a safeObject when using createSafeObject to create it', () => {
  assert.deepEqual(isSafeObject(alsoASafeObject), true);
});

expect('notASafeObject to not be a safe object', () => {
  assert.deepEqual(isSafeObject(notASafeObject), false);
});

expect('mySafeObject.a and mySafeObject.a.q.z to be safeObjects', () => {
  assert.deepEqual(isSafeObject(mySafeObject['a']), true);
  assert.deepEqual(isSafeObject(mySafeObject['a.q.z']), true);
});

expect('mySafeObject.a.b and mySafeObject.d to not be safe objects', () => {
  assert.deepEqual(isSafeObject(mySafeObject['a.b']), false);
  assert.deepEqual(isSafeObject(mySafeObject['d']), false);
});

expect('Property address\' with values that aren\'t undefined to retun their value', () => {
  assert.deepEqual(mySafeObject['a.b'], 1);
  assert.deepEqual(mySafeObject['a.q.z.r'], 1);
  assert.deepEqual(mySafeObject['d'], null);
  assert.deepEqual(mySafeObject['c'], 'hi');
  assert.deepEqual(mySafeObject['a.q'], {
    z: {
      r: 1
    }
  });
  assert.deepEqual(mySafeObject['a'], {
    b: 1,
    q: {
      z: {
        r: 1
      }
    }
  });
});

expect('All safeObject properties that don\'t exist to be undefined', () => {
  assert.deepEqual(mySafeObject['d.dontExist'], undefined);
  assert.deepEqual(mySafeObject['a.dontExist.dontExist'], undefined);
  assert.deepEqual(mySafeObject['a.b.dontExist.dontExist'], undefined);
  assert.deepEqual(mySafeObject['a.dontExist'], undefined);
  assert.deepEqual(mySafeObject['a.dontExist.dontExist.dontExist.dontExist'], undefined);
  assert.deepEqual(mySafeObject['a.d.dontExist'], undefined);
});

expect('safeObject\'s ignoreNodeInspection to throw an error if not a boolean', () => {
  assert.throws(() => { safeObject({}, { ignoreNodeInspection: 'notBoolean' }) }, Error);
});

expect('safeObject\'s shouldMakeChildrenSafeObject to throw an error if not a boolean', () => {
  assert.throws(() => { safeObject({}, { shouldMakeChildrenSafeObject: 'notBoolean' }) }, Error);
});

expect('safeObject\'s provided with alternate valueToReturnInsteadOfError to return sit when reach undefined.', () => {
  const safeObjThatReturns2 = createSafeObject({}, { valueToReturnInsteadOfError: 2 });
  assert.deepEqual(safeObjThatReturns2['a'], 2);
  assert.deepEqual(safeObjThatReturns2['a.b'], 2);
});

expect('safeObject\'s provided with alternate error to throw should throw that error when reach undefined.', () => {
  class MyError extends Error {
    constructor(values) {
      super(values);
    }
  };

  const safeObjThatReturns2 = createSafeObject({}, { valueToReturnInsteadOfError: MyError });
  assert.throws(() => { safeObjThatReturns2['a'] }, MyError);
});