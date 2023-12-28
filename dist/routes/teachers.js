"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = __importDefault(require("../models/User"));
const lodash_1 = require("lodash");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constant_1 = require("../constant");
const router = (0, express_1.Router)();
// seacrhes for the teachers with the given name or subject
router.post("/find", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { data } = req.body;
    // check if data is received
    if ((0, lodash_1.isEmpty)(data))
        return res.status(400).send({ code: "empty" });
    // return all the users whole have role = TEACHER_USER_ROLE and name or subject matches the given data
    try {
        const returnedData = yield User_1.default.find({
            $and: [
                {
                    $or: [{ name: { $regex: new RegExp(data, "i") } }, { subjects: { $regex: new RegExp(data, "i") } }],
                },
                { role: constant_1.TEACHER_USER_ROLE },
            ],
        });
        // remove password and phone from the returned data
        for (const obj of returnedData) {
            obj.password = null;
            obj.phone = null;
        }
        // return the data
        if (returnedData)
            return res.status(200).send(returnedData);
        // if no data is found
        res.status(200).send({ code: "notFound" });
    }
    catch (err) {
        res.status(400).send("Error" + err);
    }
}));
// searches for the teacher with the given id
router.post("/findById", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: _id } = req.body;
    // check if id is received
    if ((0, lodash_1.isEmpty)(_id))
        return res.status(400).send({ code: "empty" });
    // return the user with the given id
    try {
        // fetch the user with the given id
        const returnedData = yield User_1.default.findOne({ _id });
        // remove password from the returned data
        returnedData.password = null;
        // increment the profileViews by 1
        yield User_1.default.updateOne({ _id: returnedData._id }, { $inc: { profileViews: 1 } });
        // return the data
        if (returnedData)
            return res.status(200).send(returnedData);
        // if no data is found
        res.status(200).send({ code: "notFound" });
    }
    catch (err) {
        res.status(400).send("Error" + err);
    }
}));
// return all the users whole have role = TEACHER_USER_ROLE in a paginated way
router.post("/list", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { authorization: token } = req.headers;
    const { page, limit } = req.body;
    // check if token is received
    if (!token)
        return res.status(400).send({ code: "tokenNotReceived", message: token });
    // check if token is valid
    try {
        jsonwebtoken_1.default.verify(token, process.env.SECRET_JWT_TOKEN);
    }
    catch (err) {
        res.status(400).send("tokenInvalid" + err);
    }
    // check if page and limit is received
    if ((0, lodash_1.isEmpty)(page) || (0, lodash_1.isEmpty)(limit))
        return res.status(400).send({ code: "empty" });
    // return all the users whole have role = TEACHER_USER_ROLE in a paginated way
    try {
        const returnedData = yield User_1.default
            .find({ role: constant_1.TEACHER_USER_ROLE })
            .skip(page * limit)
            .limit(limit);
        // remove password and phone from the returned data
        for (const obj of returnedData) {
            obj.password = null;
            obj.phone = null;
        }
        // return the data
        if (returnedData)
            return res.status(200).send(returnedData);
        // if no data is found
        res.status(200).send({ code: "notFound" });
    }
    catch (err) {
        res.status(400).send("Error" + err);
    }
}));
exports.default = router;
//# sourceMappingURL=teachers.js.map