const PromisePlus = require('../src/index')

describe('catch', () => {
    it('should not call callback if chain resolved', done => {
        PromisePlus.resolve()
            .catch(() => done(new Error('Should not be called')))
        // Give a chance to the promise to resolve.
        setTimeout(done, 500)
    })

    it('should call callback if chain is rejected', done => {
        PromisePlus.reject()
            .catch(done)
    })

    it('should call callback with rejection value', done => {
        PromisePlus.reject(10)
            .catch(value => {
                assert.equal(value, 10)
                done()
            })
    })

    it('should call "normal" callback after catch', done => {
        PromisePlus.reject()
            .catch(() => 10)
            .then(value => {
                assert.equal(value, 10)
                done()
            })
    })
})
