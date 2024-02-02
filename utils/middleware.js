const logger = require('./logger')
const jwt = require('jsonwebtoken')

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

const userExtractor = (request, response, next) => {
    let authorization = request.get("authorization");
    if (authorization && authorization.startsWith("Bearer ")) {
        const decodedToken = jwt.verify(request.token, process.env.SECRET);
        request.user = decodedToken
    }

    next()
}

module.exports = {
    errorHandler,
    tokenExtractor,
    userExtractor
}