const logger = require('./logger')

const errorHandler = (error, request, response, next) => {
    logger.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    } else if (error.name === 'JsonWebTokenError') {
        return response.status(401).json({ error: error.message })
    }

    next(error)
}

const tokenExtractor = (request, response, next) => {
    let authorization = request.get("authorization");
    if (authorization && authorization.startsWith("Bearer ")) {
        authorization = authorization.replace("Bearer ", "");
        request.token = authorization
    }

    next()
}

module.exports = {
    errorHandler,
    tokenExtractor
}