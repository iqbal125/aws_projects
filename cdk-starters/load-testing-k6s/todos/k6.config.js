// k6 uses __ENV to read environment variables
// Source .env before running: source .env && k6 run tests/smoke.test.js

export const ENV = {
    BASE_URL: 'https://5skrae6udj.execute-api.us-east-1.amazonaws.com/prod',
    VUS: Number(__ENV.VUS) || 10,
    DURATION: __ENV.DURATION || '30s',
};
