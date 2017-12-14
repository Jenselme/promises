const states = require('./states')

class PromisePlus {
    constructor (executor) {
        this._state = states.pending
        executor(this._resolve.bind(this), this._reject.bind(this))
    }

    _resolve (value) {
        // The promise is not pending any more, we need to ignore this call.
        // See https://promisesaplus.com/#point-59
        if (this._state !== states.pending) {
            return
        }

        this._state = states.fulfilled
    }

    _reject (value) {
        // The promise is not pending any more, we need to ignore this call.
        // See https://promisesaplus.com/#point-59
        if (this._state !== states.pending) {
            return
        }

        this._state = states.rejected
    }

    get state () {
        return this._state
    }
}

module.exports = PromisePlus
