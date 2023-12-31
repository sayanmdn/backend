"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function checkToken(req, res, next) {
    const token = req.header('auth-token');
    if (!token)
        return res.status(401).send('Access Denied');
    try {
        const verified = jsonwebtoken_1.default.verify(token, process.env.SECRET_JWT_TOKEN);
        req.user = verified;
        next();
    }
    catch (err) {
        res.status(400).send('Token Invalid');
    }
}
exports.default = checkToken;
//# sourceMappingURL=verifyToken.js.map