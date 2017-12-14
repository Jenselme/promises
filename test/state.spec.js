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
})
