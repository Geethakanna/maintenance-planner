const createLog = require("../utils/logger")

function loggerMiddleware(req, res, next) {
    createLog(
        "info",
        "middleware",
        `${req.method} ${req.originalUrl} request received`
    )

    next()
}

module.exports = loggerMiddleware