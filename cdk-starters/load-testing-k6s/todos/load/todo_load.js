import http from 'k6/http';
import { check, sleep } from 'k6';
import { ENV } from '../k6.config.js';

export const options = {
    stages: [
        { duration: '30s', target: 10 },  // Ramp up to 10 users
        { duration: '1m', target: 10 },   // Hold at 10 users
        { duration: '30s', target: 0 },   // Ramp down
    ],

    thresholds: {
        http_req_duration: ['p(95)<500'],
        http_req_failed: ['rate<0.01'],
    },
};

const headers = {
    'Content-Type': 'application/json',
};

export default function () {
    // List todos
    const listRes = http.get(`${ENV.BASE_URL}/todos`, { headers });
    check(listRes, {
        'list: status 200': (r) => r.status === 200,
    });

    // Create a todo
    const createRes = http.post(`${ENV.BASE_URL}/todos`, JSON.stringify({
        title: `Load Test ${Date.now()}`,
        description: 'Created during load test',
    }), { headers });

    check(createRes, {
        'create: status 2xx': (r) => r.status >= 200 && r.status < 300,
    });

    sleep(1);
}
