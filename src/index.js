const states = require('./states')

class PromisePlus {
    static resolve (value) {
        return new PromisePlus(resolve => resolve(value))
    }

    static reject (value) {
        return new PromisePlus((resolve, reject) => reject(value))
    }

    constructor (executor) {
        this._state = states.pending
        this._onFulfilledCallbacks = []
        this._onRejectedCallbacks = []
        this._value = undefined
        // This will hold the deferred we return with the `then` method.
        this._deferred = undefined

        try {
            executor(this._resolve.bind(this), this._reject.bind(this))
        } catch (e) {
            this._reject(e)
        }
    }

    then (onFulfilled, onRejected) {
        this._createDeferred()

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

        return this._deferred.promise
    }

    _createDeferred () {
        // The deferred may have been created with a previous call to `then`.
        // Don't create it again.
        if (this._deferred) {
            return
        }

        this._deferred = {}
        this._deferred.promise = new PromisePlus((resolve, reject) => {
            this._deferred.resolve = resolve
            this._deferred.reject = reject
        })
    }

    _executeCallback (callback) {
        if (!(callback instanceof Function)) {
            return
        }

        const deferredValue = callback(this._value)
        // Resolve the "then" defered to pass values down the chain.
        this._resolveDeferred(deferredValue)
    }

    _resolveDeferred (value) {
        if (!this._deferred || this._deferred.promise.state !== states.pending) {
            return
        }

        // If value is a thenable, we need to unwrap its value before resolving our deferred.
        if (value && value.then instanceof Function) {
            value.then(this._deferred.resolve, this._deferred.reject)
        } else {
            this._deferred.resolve(value)
        }
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
