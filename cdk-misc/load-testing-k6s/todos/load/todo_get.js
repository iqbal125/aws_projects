import http from 'k6/http';
import { check, sleep } from 'k6';
import { ENV } from '../k6.config.js';

export const options = {
    stages: [
        { duration: '30s', target: 10 },
        { duration: '1m', target: 10 },
        { duration: '30s', target: 0 },
    ],

    thresholds: {
        http_req_duration: ['p(95)<500'],
        http_req_failed: ['rate<0.01'],
    },
};

export default function () {
    const res = http.get(`${ENV.BASE_URL}/todos`);
    check(res, {
        'list: status 200': (r) => r.status === 200,
    });

    sleep(1);
}
