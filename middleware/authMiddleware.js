const jwt = require('jsonwebtoken');

const myTokenSecret = process.env.MYTOKENSECRET;

const authMiddleware = async (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return res.status(401).json({ msg: "No token provided" });
        }

        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, myTokenSecret);

        if (!decodedToken._id) {
            return res.status(401).json({ msg: "Invalid token format" });
        }

        req.user = {
            _id: decodedToken._id,
            email: decodedToken.email
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ msg: "Token expired" });
        }
        res.status(403).json({ msg: "You are not authenticated", error: error.message });
    }
};

module.exports = { authMiddleware }; 