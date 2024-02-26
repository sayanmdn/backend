"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const serverless_http_1 = __importDefault(require("serverless-http"));
const mongoose_1 = require("mongoose");
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./routes/auth"));
const private_1 = __importDefault(require("./routes/private"));
const teachers_1 = __importDefault(require("./routes/teachers"));
const students_1 = __importDefault(require("./routes/students"));
const constant_1 = require("./constant");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/user", auth_1.default);
app.use("/post", private_1.default);
app.use("/teachers", teachers_1.default);
app.use("/students", students_1.default);
app.get("/", (_req, res) => {
    res.send(constant_1.DEFAULT_SERVER_RESPONSE);
});
const username = process.env.MONGO_USERNAME;
const mongo_password = process.env.MONGO_PASSWORD;
const uri = `mongodb+srv://${username}:${mongo_password}@backend-serverless.3e0kv62.mongodb.net/portfolio-db?retryWrites=true&w=majority`;
try {
    (0, mongoose_1.connect)(uri);
}
catch (error) {
    console.log("Error while connection Mongodb Atlas ", error);
}
module.exports.handler = (0, serverless_http_1.default)(app);
//# sourceMappingURL=index.js.map