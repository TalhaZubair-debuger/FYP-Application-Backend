const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
        const error = new Error("Not Authorized")
        error.statusCode = 401;
        throw error;
    }
    const bearer = authHeader.split(" ")[0];
    const token = authHeader.split(" ")[1];
    let decodedToken;
    if (bearer === "Bearer-Investor") {
        try {
            decodedToken = jwt.verify(token, "investorssupersecrettoken")
        } catch (error) {
            error.statusCode = 500;
            next(error)
        }
    }
    else {
        try {
            decodedToken = jwt.verify(token, "realsupersecretshit")
        } catch (error) {
            error.statusCode = 500;
            next(error)
        }
    }

    if (!decodedToken) {
        const error = new Error("Not authenticated!");
        error.statusCode = 500;
        throw error;
    }
    req.userId = decodedToken.userId;
    next();
}