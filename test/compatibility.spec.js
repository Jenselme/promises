const PromisePlus = require('../src/index')

describe('compatibility', () => {
    it('should be chanaible from standard promise', done => {
        Promise.resolve(5)
            .then(value => PromisePlus.resolve(value))
            .then(value => {
                assert.equal(value, 5)
                done()
            })
    })

    it('should be able to chain standard promise', done => {
        PromisePlus.resolve(5)
            .then(value => Promise.resolve(value))
            .then(value => {
                assert.equal(value, 5)
                done()
            })
    })

    it('should work with Promise.all', done => {
        Promise.all([
            PromisePlus.resolve(5)
        ]).then(values => {
            assert.equal(values.length, 1)
            assert.equal(values[0], 5)
            done()
        })
    })

    it('should work with Promise.race', done => {
        Promise.race([
            PromisePlus.resolve(5)
        ]).then(value => {
            assert.equal(value, 5)
            done()
        })
    })
})
