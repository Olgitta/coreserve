const postmanToOpenApi = require('postman-to-openapi');
const path = require('node:path');

const postmanCollection = path.join(__dirname, '../coreserve.postman_collection.json');
const outputJsonFile = path.join(__dirname, '../src/openapi/api-spec.json');

postmanToOpenApi(postmanCollection, outputJsonFile,
    {
        defaultTag: 'API',
        replaceVars: true,
        responseHeaders: false,
        outputFormat: 'json',
    })
    .then((result) => {
        console.log(`OpenAPI generated: ${outputJsonFile}`);
    })
    .catch((err) => {
        console.error('Error generating OpenAPI:', err);
    });
