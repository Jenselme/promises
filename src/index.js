const callbackKinds = require('./callback-kinds')
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
                this._executeCallback(onFulfilled, callbackKinds.resolve)
                break
            case states.rejected:
                this._executeCallback(onRejected, callbackKinds.reject)
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

    _executeCallback (callback, kind) {
        if (!(callback instanceof Function)) {
            // We need to pass the value the current promise in the chain got
            // to the next one in the chain.
            // We also need to respect the callback (resolve or reject) that was called.
            // To do this, we create a callback that return the proper promise.
            switch (kind) {
                case callbackKinds.resolve:
                    callback = value => PromisePlus.resolve(value)
                    break
                case callbackKinds.reject:
                    callback = value => PromisePlus.reject(value)
                    break
                default:
                    // This should never happen.
                    throw new Error('Unsupported callback kind')
            }
        }

        setTimeout(() => {
            let deferredValue
            try {
                deferredValue = callback(this._value)
            } catch (error) {
                deferredValue = PromisePlus.reject(error)
            }

            // Resolve the "then" deferred to pass values down the chain.
            this._resolveDeferred(deferredValue)
        })
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
            this._executeCallback(callback, callbackKinds.resolve)
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
            this._executeCallback(callback, callbackKinds.reject)
        })
    }

    get state () {
        return this._state
    }
}

module.exports = PromisePlus
