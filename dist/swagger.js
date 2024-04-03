"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const js_yaml_1 = __importDefault(require("js-yaml")); // Import the 'yaml' module
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Define swagger definition
const swaggerDefinition = {
    info: {
        title: "Your API Title",
        version: "1.0.0",
        description: "Your API description",
    },
    basePath: "localhost:8080", // Base path of the API
};
// Options for the swagger specification
const options = {
    swaggerDefinition,
    // Paths to files containing OpenAPI definitions
    apis: [path_1.default.join(__dirname, "./**/*.ts")],
};
// Initialize swagger-jsdoc
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
exports.swaggerSpec = swaggerSpec;
// Convert swagger JSON to YAML
try {
    const swaggerYaml = js_yaml_1.default.dump(swaggerSpec);
    // Write YAML to file
    fs_1.default.writeFileSync("swagger.yml", swaggerYaml);
    console.log("Swagger YAML file created successfully.");
}
catch (error) {
    console.error("Error occurred while generating Swagger YAML:", error);
}
//# sourceMappingURL=swagger.js.map