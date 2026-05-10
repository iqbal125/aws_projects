import { ENV } from '../k6.config.js';

export const baseOptions = {
    vus: ENV.VUS,
    duration: ENV.DURATION,

    thresholds: {
        http_req_duration: ['p(95)<500'],
        http_req_failed: ['rate<0.01'],
    },
};
