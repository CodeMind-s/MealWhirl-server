const NotFoundException = require('../exceptions/NotFoundException');

const middleware = (req, res, next) => {
    const err = new NotFoundException();
    next(err);
}

module.exports = middleware;
