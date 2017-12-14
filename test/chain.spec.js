const PromisePlus = require('../src/index')

describe('chain', () => {
    describe('with basic values', () => {
        it('should return a promise', () => {
            const promise = (new PromisePlus(resolve => resolve()))
                .then(null, null)

            assert(promise instanceof PromisePlus)
        })

        it('should resolve promise with returned value when previous promise resolves', done => {
            const promise = new PromisePlus(resolve => resolve())
            promise
                .then(() => {
                    return 'a value'
                })
                .then(value => {
                    assert.equal(value, 'a value')
                    done()
                })
        })

        it('should resolve promise with returned value when previous promise rejects', done => {
            const promise = new PromisePlus((resolve, reject) => reject())
            promise
                .then(null, () => {
                    return 'a value'
                })
                .then(value => {
                    assert.equal(value, 'a value')
                    done()
                })
        })

        it('should resolve promise with returned value when chain is defined before resolution', done => {
            let resolveCb
            const promise = new PromisePlus(resolve => (resolveCb = resolve))
            promise
                .then(() => {
                    return 'a value'
                })
                .then(value => {
                    assert.equal(value, 'a value')
                    done()
                })

            resolveCb()
        })
    })
})
