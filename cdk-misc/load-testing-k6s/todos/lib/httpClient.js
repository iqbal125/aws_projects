import http from 'k6/http';
import { ENV } from '../k6.config.js';

const defaultHeaders = {
    'Content-Type': 'application/json',
};

function getHeaders() {
    const headers = { ...defaultHeaders };
    if (ENV.API_KEY) {
        headers['Authorization'] = `Bearer ${ENV.API_KEY}`;
    }
    return headers;
}

export function get(path) {
    return http.get(`${ENV.BASE_URL}${path}`, {
        headers: getHeaders(),
    });
}

export function post(path, body) {
    return http.post(`${ENV.BASE_URL}${path}`, JSON.stringify(body), {
        headers: getHeaders(),
    });
}

export function put(path, body) {
    return http.put(`${ENV.BASE_URL}${path}`, JSON.stringify(body), {
        headers: getHeaders(),
    });
}

export function del(path) {
    return http.del(`${ENV.BASE_URL}${path}`, null, {
        headers: getHeaders(),
    });
}
