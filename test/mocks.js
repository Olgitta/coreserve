'use strict';

const log = require('#core/logger/index.js')();

jest.mock('#core/logger/index.js', () => {
    return jest.fn(() => ({
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    }));
});