[![Build Status](https://travis-ci.org/Jenselme/promises.svg?branch=master)](https://travis-ci.org/Jenselme/promises)

# promises

An implementation of Promises/A+ to see how it can be done. It is not fully compliant.

You can use this in your project by installing it with `npm install git+https://github.com/Jenselme/promises.git` and then importing it with:
```js
// You shouldn't name the imported class Promise to avoid name collision with the default implementation.
const PromisePlus = require('promises')

PromisePlus.resolve('a value')
    .then(value => console.log(value))
```
