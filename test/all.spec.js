const PromisePlus = require('../src/index')

describe('all method', () => {
    it('should reject if non iterable argument is passed', done => {
        PromisePlus.all(null)
            .then(null, error => {
                assert(error instanceof Error)
                assert.equal(error.message, `TypeError: Cannot read property 'Symbol(Symbol.iterator)' of null`)
                done()
            })
    })

    it('should resolve immediately when an empty array is passed', done => {
        PromisePlus.all([])
            .then(values => {
                assert(values instanceof Array)
                assert.equal(values.length, 0)
                done()
            })
    })

    it('should resolve if all promises resolve are resolved', done => {
        PromisePlus.all([
            PromisePlus.resolve(10)
        ])
            .then(values => {
                assert(values instanceof Array)
                assert.equal(values.length, 1)
                assert.equal(values[0], 10)
                done()
            })
    })

    it('should preserve value order', done => {
        PromisePlus.all([
            PromisePlus.resolve(10),
            PromisePlus.resolve(null),
            PromisePlus.resolve(),
            PromisePlus.resolve('a string')
        ])
            .then(values => {
                assert(values instanceof Array)
                assert.equal(values.length, 4)
                assert.deepEqual(values, [10, null, undefined, 'a string'])
                done()
            })
    })

    it('should support mixed values in iterable', done => {
        PromisePlus.all([
            PromisePlus.resolve(10),
            null,
            10,
            'a string'
        ])
            .then(values => {
                assert(values instanceof Array)
                assert.equal(values.length, 4)
                assert.deepEqual(values, [10, null, 10, 'a string'])
                done()
            })
    })

    it('should fail if one promise fail', done => {
        PromisePlus.all([
            PromisePlus.reject('snif')
        ])
            .then(null, value => {
                assert.equal(value, 'snif')
                done()
            })
    })

    it('should fail if at least one promise fail', done => {
        PromisePlus.all([
            PromisePlus.resolve(10),
            PromisePlus.reject('snif'),
            PromisePlus.resolve(30)
        ])
            .then(null, value => {
                assert.equal(value, 'snif')
                done()
            })
    })

    it('should fail with first rejected message', done => {
        PromisePlus.all([
            PromisePlus.resolve(10),
            PromisePlus.reject('snif'),
            PromisePlus.reject(30)
        ])
            .then(null, value => {
                assert.equal(value, 'snif')
                done()
            })
    })
})
