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

    describe('with missing callbacks', () => {
        it('should call fulfill callback if last promise was fulfilled', done => {
            const promise = PromisePlus.resolve('a value')
            promise
                .then(() => 'a value')
                .then(null)
                .then(value => {
                    assert.equal(value, 'a value')
                    done()
                })
        })

        it('should call fulfill callback if last promise was already fulfilled', done => {
            const promise = PromisePlus.resolve('a value')
            promise
                .then(null)
                .then(value => {
                    assert.equal(value, 'a value')
                    done()
                })
        })

        it('should call rejection callback if last promise was rejected', done => {
            const promise = PromisePlus.resolve('a value')
            promise
                .then(() => PromisePlus.reject('a value'))
                .then(null, null)
                .then(null, value => {
                    assert.equal(value, 'a value')
                    done()
                })
        })

        it('should call rejection callback if last promise was already rejected', done => {
            PromisePlus.reject('a value')
                .then(null, null)
                .then(null, value => {
                    assert.equal(value, 'a value')
                    done()
                })
        })
    })

    describe('error management', () => {
        it('should call rejection callback if an error occurred in the previous promise', done => {
            PromisePlus.resolve()
                .then(() => {
                    throw new Error('It failed!')
                })
                .then(null, error => {
                    assert(error instanceof Error)
                    assert.equal(error.message, 'It failed!')
                    done()
                })
        })
    })

    describe('multiple chains', () => {
        it('should resolve each promise in the chain independently', done => {
            let resolveCb
            const promise = new PromisePlus(resolve => (resolveCb = resolve))
            Promise.all([
                promise.then(value => `${value} + value 1`),
                promise.then(value => `${value} + value 2`)
            ]).then(values => {
                assert.equal(values.length, 2)
                assert.equal(values[0], 'initial value + value 1')
                assert.equal(values[1], 'initial value + value 2')
                done()
            })

            resolveCb('initial value')
        })

        it('should resolve each promise registered after resolve in the chain independently', done => {
            const promise = PromisePlus.resolve('initial value')

            Promise.all([
                promise.then(value => `${value} + value 1`),
                promise.then(value => `${value} + value 2`)
            ]).then(values => {
                assert.equal(values.length, 2)
                assert.equal(values[0], 'initial value + value 1')
                assert.equal(values[1], 'initial value + value 2')
                done()
            })
        })

        it('should reject each promise in the chain independently', done => {
            let rejectCb
            const promise = new PromisePlus((resolve, reject) => (rejectCb = reject))
            Promise.all([
                promise.then(null, value => `${value} + value 1`),
                promise.then(null, value => `${value} + value 2`)
            ]).then(values => {
                assert.equal(values.length, 2)
                assert.equal(values[0], 'initial value + value 1')
                assert.equal(values[1], 'initial value + value 2')
                done()
            })

            rejectCb('initial value')
        })

        it('should resolve each promise registered after resolve in the chain independently', done => {
            const promise = PromisePlus.reject('initial value')

            Promise.all([
                promise.then(null, value => `${value} + value 1`),
                promise.then(null, value => `${value} + value 2`)
            ]).then(values => {
                assert.equal(values.length, 2)
                assert.equal(values[0], 'initial value + value 1')
                assert.equal(values[1], 'initial value + value 2')
                done()
            })
        })
    })
})
