export const prodOptions = {
    stages: [
        { duration: '1m', target: 50 },   // Ramp up
        { duration: '3m', target: 50 },   // Steady state
        { duration: '1m', target: 0 },    // Ramp down
    ],

    thresholds: {
        http_req_duration: ['p(95)<300', 'p(99)<500'],
        http_req_failed: ['rate<0.01'],
    },
};
