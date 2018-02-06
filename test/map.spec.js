const PromisePlus = require('../src/index')

describe('map', () => {
    it('should reject if non iterable argument is passed', done => {
        PromisePlus.map(null, value => value)
            .then(null, error => {
                assert(error instanceof Error)
                assert.equal(error.message, `TypeError: Cannot read property 'Symbol(Symbol.iterator)' of null`)
                done()
            })
    })

    it('should support empty array', done => {
        PromisePlus.map([], value => value)
            .then(values => {
                assert(values instanceof Array)
                assert.equal(values.length, 0)
                done()
            })
    })

    it('should resolve with all values', done => {
        PromisePlus.map([10, 20, 30], value => PromisePlus.resolve(value * 2))
            .then(values => {
                assert(values instanceof Array)
                assert.equal(values.length, 3)
                assert.deepEqual(values, [20, 40, 60])
                done()
            })
    })

    it('should be rejected if any promise is', done => {
        PromisePlus.map([10, 20], value => {
            if (value === 10) {
                return PromisePlus.resolve(value)
            }

            return PromisePlus.reject(value)
        })
            .then(null, value => {
                assert.equal(value, 20)
                done()
            })
    })

    it('should work even if function does not return a promise', done => {
        PromisePlus.map([10, 20], value => 2 * value)
            .then(values => {
                assert(values instanceof Array)
                assert.equal(values.length, 2)
                assert.deepEqual(values, [20, 40])
                done()
            })
    })
})
