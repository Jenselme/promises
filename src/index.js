const states = require('./states')

class PromisePlus {
    constructor (executor) {
        this._state = states.pending
        executor(this._resolve.bind(this), this._reject.bind(this))
    }

    _resolve (value) {
        this._state = states.fulfilled
    }

    _reject (value) {
        this._state = states.rejected
    }

    get state () {
        return this._state
    }
}

module.exports = PromisePlus
