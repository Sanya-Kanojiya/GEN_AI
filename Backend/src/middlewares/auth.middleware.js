/* helps to identify req kis user ne ki h*/

const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")

async function authUser(req, res, next) {

    const token = req.cookies.token; /// create token

    if (!token) { // agr token nhi  ila toh yahi se return kr jayege
        return res.status(401).json({
            message: "Token not provided."
        })
    }



    //token kahi blacklist toh nhi hai
    const isTokenBlacklisted = await tokenBlacklistModel.findOne({
        token
    })

    if (isTokenBlacklisted) {
        return res.status(401).json({
            message: "token is invalid"
        })
    }



    // agr token milta hai toh use verify krna hoga

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = decoded

        next()

    } catch (err) {

        return res.status(401).json({
            message: "Invalid token."
        })
    }
}
module.exports = { authUser }