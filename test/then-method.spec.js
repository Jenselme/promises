const PromisePlus = require('../src/index')

describe('then method', () => {
    it('should exist and accept callbacks', () => {
        const promise = new PromisePlus(() => {})
        promise.then(() => {}, () => {})
    })

    it('should call fulfilled callback when fulfilled', done => {
        let resolveCb
        const promise = new PromisePlus(resolve => (resolveCb = resolve))
        promise.then(done)

        resolveCb()
    })

    it('should call rejection callback when rejected', done => {
        let rejectCb
        const promise = new PromisePlus((resolve, reject) => (rejectCb = reject))
        promise.then(null, done)

        rejectCb()
    })

    it('should ignore fulfill callback if it is not a function', () => {
        let resolveCb
        const promise = new PromisePlus(resolve => (resolveCb = resolve))
        promise.then(null)

        resolveCb()
    })

    it('should ignore rejection callback if it is not a function', () => {
        let rejectCb
        const promise = new PromisePlus((resolve, reject) => (rejectCb = reject))
        promise.then(null, null)

        rejectCb()
    })

    it('should call all registered callback on fulfill', done => {
        let resolveCb
        let firstCallbackCalled
        const onFulfillCb = () => {
            if (firstCallbackCalled) {
                return done()
            }

            firstCallbackCalled = true
        }
        const promise = new PromisePlus(resolve => (resolveCb = resolve))
        promise.then(onFulfillCb)
        promise.then(onFulfillCb)

        resolveCb()
    })

    it('should call all registered callback on rejection', done => {
        let rejectCb
        let firstCallbackCalled
        const onFulfillCb = () => {
            if (firstCallbackCalled) {
                return done()
            }

            firstCallbackCalled = true
        }
        const promise = new PromisePlus((resolve, reject) => (rejectCb = reject))
        promise.then(null, onFulfillCb)
        promise.then(null, onFulfillCb)

        rejectCb()
    })

    it('should call fulfill callback registered after resolution', done => {
        let resolveCb
        const promise = new PromisePlus(resolve => (resolveCb = resolve))

        resolveCb()

        promise.then(done)
    })

    it('should call rejection callback registered after rejection', done => {
        let rejectCb
        const promise = new PromisePlus((resolve, reject) => (rejectCb = reject))

        rejectCb()

        promise.then(null, done)
    })

    describe('pass value to callbacks', () => {
        it('should pass resolution value to fulfill callback', done => {
            const promise = new PromisePlus(resolve => resolve('a value'))
            promise.then(value => {
                assert.equal(value, 'a value')
                done()
            })
        })

        it('should pass rejection value to rejection callback', done => {
            const promise = new PromisePlus((resolve, reject) => reject('a value'))
            promise.then(null, value => {
                assert.equal(value, 'a value')
                done()
            })
        })

        it('should pass value to fulfill cb when cb registered before resolution', done => {
            let resolveCb
            const promise = new PromisePlus(resolve => (resolveCb = resolve))
            promise.then(value => {
                assert.equal(value, 'a value')
                done()
            })

            resolveCb('a value')
        })

        it('should pass value to rejection cb when cb registered before resolution', done => {
            let rejectCb
            const promise = new PromisePlus((resolve, reject) => (rejectCb = reject))
            promise.then(null, value => {
                assert.equal(value, 'a value')
                done()
            })

            rejectCb('a value')
        })
    })

    describe('error management', () => {
        it('should reject promise with an error when exceptions occurs in executor', done => {
            const promise = new PromisePlus(resolve => {
                throw new Error('It failed!')
            })
            promise.then(null, error => {
                assert(error instanceof Error)
                assert.equal(error.message, 'It failed!')
                done()
            })
        })
    })
})
