const states = require('./states')

class PromisePlus {
    constructor (executor) {
        this._state = states.pending
        this._onFulfilledCallbacks = []
        this._onRejectedCallbacks = []
        this._value = undefined
        executor(this._resolve.bind(this), this._reject.bind(this))
    }

    then (onFulfilled, onRejected) {
        switch (this._state) {
            case states.pending:
                this._registerCallbacks(onFulfilled, onRejected)
                break
            case states.fulfilled:
                this._executeCallback(onFulfilled)
                break
            case states.rejected:
                this._executeCallback(onRejected)
                break
            default:
                // Note: this should never happen
                throw new Error('Promise is in an unknown state')
        }
    }

    _executeCallback (callback) {
        if (!(callback instanceof Function)) {
            return
        }

        callback(this._value)
    }

    _registerCallbacks (onFulfilled, onRejected) {
        this._onFulfilledCallbacks.push(onFulfilled)
        this._onRejectedCallbacks.push(onRejected)
    }

    _resolve (value) {
        // The promise is not pending any more, we need to ignore this call.
        // See https://promisesaplus.com/#point-59
        if (this._state !== states.pending) {
            return
        }

        this._state = states.fulfilled
        this._value = value
        this._onFulfilledCallbacks.forEach(callback => {
            this._executeCallback(callback)
        })
    }

    _reject (value) {
        // The promise is not pending any more, we need to ignore this call.
        // See https://promisesaplus.com/#point-59
        if (this._state !== states.pending) {
            return
        }

        this._state = states.rejected
        this._value = value
        this._onRejectedCallbacks.forEach(callback => {
            this._executeCallback(callback)
        })
    }

    get state () {
        return this._state
    }
}

module.exports = PromisePlus
