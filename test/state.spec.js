const PromisePlus = require('../src/index')
const states = require('../src/states')

describe('State', () => {
    it('should be pending on creation', () => {
        const promise = new PromisePlus(() => {})
        assert.equal(promise.state, states.pending)
    })

    it('should be fulfilled if resolved', () => {
        const promise = new PromisePlus(resolve => resolve())
        assert.equal(promise.state, states.fulfilled)
    })

    it('should be rejected if rejected', () => {
        const promise = new PromisePlus((resolve, reject) => reject())
        assert.equal(promise.state, states.rejected)
    })

    it('should not change state once fulfilled', () => {
        let resolveCb
        let rejectCb
        const promise = new PromisePlus((resolve, reject) => {
            resolveCb = resolve
            rejectCb = reject
        })

        resolveCb()
        rejectCb()

        assert.equal(promise.state, states.fulfilled)
    })

    it('should not change state once rejected', () => {
        let resolveCb
        let rejectCb
        const promise = new PromisePlus((resolve, reject) => {
            resolveCb = resolve
            rejectCb = reject
        })

        rejectCb()
        resolveCb()

        assert.equal(promise.state, states.rejected)
    })
})
