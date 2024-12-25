'use strict';

const {createCtx, getCtx, getTraceId} = require('../../../src/core/execution-context/context');

describe('context module', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create context and return context with valid payload and traceId', () => {

        const mockPayload = {user: 'test-user'};

        let actual;
        let traceId;

        const mockCallback = jest.fn(() => {
            traceId = getTraceId();
            actual = getCtx();
        });

        createCtx(mockPayload, mockCallback);

        const expected = {...mockPayload, traceId};

        expect(actual).toEqual(expected);
        expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should create 2 different contexts and return context with valid payload and traceId', () => {

        const mockPayload = {user: 'test-user'};

        const actual = [];
        const traceId = [];

        const mockCallback = jest.fn(() => {
            traceId.push(getTraceId());
            actual.push(getCtx());
        });

        createCtx(mockPayload, mockCallback);
        createCtx(mockPayload, mockCallback);

        const expected = [
            {...mockPayload, traceId: traceId[0]},
            {...mockPayload, traceId: traceId[1]},
        ];

        expect(actual[0]).toEqual(expected[0]);
        expect(actual[1]).toEqual(expected[1]);
        expect(mockCallback).toHaveBeenCalledTimes(2);
    });

});
