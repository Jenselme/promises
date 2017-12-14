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

    describe('with promise', () => {
        it('should call fulfill callback if previous promise returned fulfilled promise', done => {
            const promise = PromisePlus.resolve()
            promise
                .then(() => {
                    return PromisePlus.resolve('a value')
                })
                .then(value => {
                    assert.equal(value, 'a value')
                    done()
                })
        })

        it('should call rejection callback if previous promise returned rejected promise', done => {
            const promise = PromisePlus.resolve()
            promise
                .then(() => {
                    return PromisePlus.reject('a value')
                })
                .then(null, value => {
                    assert.equal(value, 'a value')
                    done()
                })
        })

        it('should call fulfill callback if previous promise returned fulfilled promise', done => {
            const promise = PromisePlus.reject()
            promise
                .then(null, () => {
                    return PromisePlus.resolve('a value')
                })
                .then(value => {
                    assert.equal(value, 'a value')
                    done()
                })
        })

        it('should call rejection callback if previous promise returned rejected promise', done => {
            const promise = PromisePlus.reject()
            promise
                .then(null, () => {
                    return PromisePlus.reject('a value')
                })
                .then(null, value => {
                    assert.equal(value, 'a value')
                    done()
                })
        })
    })
})
