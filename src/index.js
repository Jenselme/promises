const callbackKinds = require('./callback-kinds')
const states = require('./states')

/**
 * Basic, not fully compliant Promise/A+ implementation.
 *
 * It takes as argument an executor function. This function will be passed a callback to
 * resolve the promise and one to reject it. The promise will stay pending until one of
 * theses callbacks is called.
 */
class PromisePlus {
    static resolve (value) {
        return new PromisePlus(resolve => resolve(value))
    }

    static reject (value) {
        return new PromisePlus((resolve, reject) => reject(value))
    }

    constructor (executor) {
        this._state = states.pending
        // List all the deferred created by the then method and
        // the related onFulfilled/onRejected callbacks.
        this._thenChainInfo = []
        this._value = undefined

        this._launchExecutor(executor)
    }

    _launchExecutor (executor) {
        try {
            executor(this._resolve.bind(this), this._reject.bind(this))
        } catch (e) {
            this._reject(e)
        }
    }

    /**
     * Method used to chain promise.
     *
     * @param {Function} onFulfilled callback called if/when the previous promise is fulfilled.
     * @param {Function} onRejected callback called if/when the previous promise is rejected.
     * @return {PromisePlus} The promise to rely on for the rest of the chain.
     */
    then (onFulfilled, onRejected) {
        const deferred = this._createDeferred()

        switch (this._state) {
            case states.pending:
                this._registerDeferred(deferred, onFulfilled, onRejected)
                break
            case states.fulfilled:
                this._processThenChain({onFulfilled, deferred}, callbackKinds.resolve)
                break
            case states.rejected:
                this._processThenChain({onRejected, deferred}, callbackKinds.reject)
                break
            default:
                // Note: this should never happen
                throw new Error('Promise is in an unknown state')
        }

        return deferred.promise
    }

    _createDeferred () {
        const deferred = {}
        deferred.promise = new PromisePlus((resolve, reject) => {
            deferred.resolve = resolve
            deferred.reject = reject
        })

        return deferred
    }

    _processThenChain ({onFulfilled, onRejected, deferred}, kind) {
        let callback = this._selectCallback(onFulfilled, onRejected, kind)

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

        this._executeThenCallback(deferred, callback)
    }

    _executeThenCallback (deferred, callback) {
        setTimeout(() => {
            let deferredValue
            try {
                deferredValue = callback(this._value)
            } catch (error) {
                deferredValue = PromisePlus.reject(error)
            }

            // Resolve the "then" deferred to pass values down the chain.
            this._resolveDeferred(deferred, deferredValue)
        })
    }

    _selectCallback (onFulfilled, onRejected, kind) {
        switch (kind) {
            case callbackKinds.resolve:
                return onFulfilled
            case callbackKinds.reject:
                return onRejected
        }
    }

    _resolveDeferred (deferred, value) {
        if (deferred.promise.state !== states.pending) {
            return
        }

        // If value is a thenable, we need to unwrap its value before resolving our deferred.
        if (value && value.then instanceof Function) {
            value.then(deferred.resolve, deferred.reject)
        } else {
            deferred.resolve(value)
        }
    }

    _registerDeferred (deferred, onFulfilled, onRejected) {
        this._thenChainInfo.push({onFulfilled, onRejected, deferred})
    }

    _resolve (value) {
        // The promise is not pending any more, we need to ignore this call.
        // See https://promisesaplus.com/#point-59
        if (this._state !== states.pending) {
            return
        }

        this._state = states.fulfilled
        this._value = value
        this._thenChainInfo.map(thenableInfo => this._processThenChain(thenableInfo, callbackKinds.resolve))
    }

    _reject (value) {
        // The promise is not pending any more, we need to ignore this call.
        // See https://promisesaplus.com/#point-59
        if (this._state !== states.pending) {
            return
        }

        this._state = states.rejected
        this._value = value
        this._thenChainInfo.map(thenableInfo => this._processThenChain(thenableInfo, callbackKinds.reject))
    }

    /**
     * Return the current state of the promise.
     *
     * This is mostly useful for debugging purposes.
     * The returned state can be PENDING, FULFILLED or REJECTED.
     */
    get state () {
        return this._state
    }
}

module.exports = PromisePlus
