const PromisePlus = require('../src/index')

describe('race method', () => {
    it('should reject if non iterable argument is passed', done => {
        PromisePlus.race(null)
            .then(null, error => {
                assert(error instanceof Error)
                assert.equal(error.message, `TypeError: Cannot read property 'Symbol(Symbol.iterator)' of null`)
                done()
            })
    })

    it('should not resolve with empty array', done => {
        PromisePlus.race([])
            .then(done, done)

        // Give a chance to the promise to resolve.
        setTimeout(done, 500)
    })

    it('should resolve with value of only resolved promise', done => {
        PromisePlus.race([
            PromisePlus.resolve(10)
        ])
            .then(value => {
                assert.equal(value, 10)
                done()
            })
    })

    it('should resolve with value of first resolved promise', done => {
        let p1Resolve
        const p1 = new PromisePlus(resolve => (p1Resolve = resolve))
        let p2Resolve
        const p2 = new PromisePlus(resolve => (p2Resolve = resolve))

        PromisePlus.race([
            p1,
            p2
        ])
            .then(value => {
                assert.equal(value, 10)
                done()
            })

        p2Resolve(10)
        p1Resolve(30)
    })

    it('should be rejected if first resolve promise is rejected', done => {
        let p1Reject
        const p1 = new PromisePlus((resolve, reject) => (p1Reject = reject))
        let p2Reject
        const p2 = new PromisePlus((resolve, reject) => (p2Reject = reject))

        PromisePlus.race([
            p1,
            p2
        ])
            .then(null, value => {
                assert.equal(value, 10)
                done()
            })

        p2Reject(10)
        p1Reject(30)
    })

    it('should resolve if race is called with resolve promise first', done => {
        PromisePlus.race([
            PromisePlus.resolve(10),
            PromisePlus.reject(30)
        ])
            .then(value => {
                assert.equal(value, 10)
                done()
            })
    })

    it('should resolve if race is called with reject promise first', done => {
        PromisePlus.race([
            PromisePlus.reject(10),
            PromisePlus.resolve(30)
        ])
            .then(null, value => {
                assert.equal(value, 10)
                done()
            })
    })
})
