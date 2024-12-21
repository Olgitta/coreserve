const BASE_URL = 'http://localhost:5000';

const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function test200andTraceId(status, traceId) {
    expect(status).toBe(200);
    expect(traceId).toMatch(guidRegex);
}

module.exports = {
    BASE_URL,
    guidRegex,
    test200andTraceId
}