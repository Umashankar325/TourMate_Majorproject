const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';

module.exports.verifyToken = (req, res, next) => {
    const token = req.cookies.access_token;
    if (!token)
        return res.status(401).json({ authenticated: false });

    try {
        const decoded = jwt.verify(token, jwtSecret);   
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ authenticated: false });
    }
};
