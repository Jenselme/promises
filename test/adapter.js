const PromisePlus = require('../src/index')

module.exports = {
    resolve: PromisePlus.resolve,
    reject: PromisePlus.reject,
    deferred: () => {
        const defer = {}
        defer.promise = new PromisePlus((resolve, reject) => {
            defer.resolve = resolve
            defer.reject = reject
        })

        return defer
    }
}
