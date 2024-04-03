import swaggerJSDoc from "swagger-jsdoc";
import yaml from "js-yaml"; // Import the 'yaml' module
import fs from "fs";
import path from "path";

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
  apis: [path.join(__dirname, "./**/*.ts")],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

// Convert swagger JSON to YAML
try {
  const swaggerYaml = yaml.dump(swaggerSpec);
  // Write YAML to file
  fs.writeFileSync("swagger.yml", swaggerYaml);
  console.log("Swagger YAML file created successfully.");
} catch (error) {
  console.error("Error occurred while generating Swagger YAML:", error);
}

export { swaggerSpec };
