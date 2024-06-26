"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = require("mongoose");
const auth_1 = __importDefault(require("./routes/auth"));
const private_1 = __importDefault(require("./routes/private"));
const teachers_1 = __importDefault(require("./routes/teachers"));
const students_1 = __importDefault(require("./routes/students"));
const constant_1 = require("./constant");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yamljs_1 = __importDefault(require("yamljs"));
// Should only be used when updating the swagger.yml file
// import { swaggerSpec } from "./swagger";
const swaggerDocument = yamljs_1.default.load("./swagger.yml");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const port = 8080;
app.use("/user", auth_1.default);
app.use("/post", private_1.default);
app.use("/teachers", teachers_1.default);
app.use("/students", students_1.default);
app.get("/", (_req, res) => {
    res.send(constant_1.DEFAULT_SERVER_RESPONSE);
});
// Serve Swagger UI
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
// how to render swagger ui from swagger.yml file
const username = process.env.MONGO_USERNAME;
const mongo_password = process.env.MONGO_PASSWORD;
const uri = `mongodb+srv://${username}:${mongo_password}@backend-serverless.3e0kv62.mongodb.net/portfolio-db?retryWrites=true&w=majority`;
console.log("uri ", uri);
try {
    (0, mongoose_1.connect)(uri);
    const dbConnection = mongoose_1.connection;
    dbConnection.once("open", function () {
        console.log("MongoDB database connection established successfully");
    });
}
catch (error) {
    console.log("Error while connection Mongodb Atlas ", error);
}
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
//# sourceMappingURL=index-local.js.map