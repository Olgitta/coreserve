'use strict';

const Validator = require('../../../src/core/utils/Validator');

describe('Validator', () => {
    let validator;

    beforeEach(() => {
        validator = new Validator();
    });

    describe('isNonEmptyString', () => {
        test('should add error for empty string', () => {
            validator.isNonEmptyString('', 'name');
            const result = validator.validate();
            expect(result).toBe('name value is invalid string');
        });

        test('should not add error for valid string', () => {
            validator.isNonEmptyString('John Doe', 'name');
            const result = validator.validate();
            expect(result).toBeNull();
        });
    });

    describe('isNonEmptyObject', () => {
        test('should add error for non-object value', () => {
            validator.isNonEmptyObject(null, 'profile');
            const result = validator.validate();
            expect(result).toBe('profile value is invalid object');
        });

        test('should add error for empty object', () => {
            validator.isNonEmptyObject({}, 'profile');
            const result = validator.validate();
            expect(result).toBe('profile value is invalid object');
        });

        test('should not add error for non-empty object', () => {
            validator.isNonEmptyObject({ key: 'value' }, 'profile');
            const result = validator.validate();
            expect(result).toBeNull();
        });
    });

    describe('isValidNumber', () => {
        test('should add error for non-number value', () => {
            validator.isValidNumber('string', 'age');
            const result = validator.validate();
            expect(result).toBe('age value is invalid number');
        });

        test('should not add error for valid number', () => {
            validator.isValidNumber(42, 'age');
            const result = validator.validate();
            expect(result).toBeNull();
        });

        test('should add error for NaN', () => {
            validator.isValidNumber(NaN, 'age');
            const result = validator.validate();
            expect(result).toBe('age value is invalid number');
        });
    });

    describe('isValidNumberOrNull', () => {
        test('should add error for non-number and non-null value', () => {
            validator.isValidNumberOrNull('string', 'score');
            const result = validator.validate();
            expect(result).toBe('score value is invalid number');
        });

        test('should not add error for valid number', () => {
            validator.isValidNumberOrNull(99, 'score');
            const result = validator.validate();
            expect(result).toBeNull();
        });

        test('should not add error for null value', () => {
            validator.isValidNumberOrNull(null, 'score');
            const result = validator.validate();
            expect(result).toBeNull();
        });

        test('should add error for NaN', () => {
            validator.isValidNumberOrNull(NaN, 'score');
            const result = validator.validate();
            expect(result).toBe('score value is invalid number');
        });
    });

    describe('validate', () => {
        test('should return all errors as a joined string', () => {
            validator.isNonEmptyString('', 'name');
            validator.isValidNumber('string', 'age');
            const result = validator.validate();
            expect(result).toBe('name value is invalid string|age value is invalid number');
        });

        test('should clear errors after validate', () => {
            validator.isNonEmptyString('', 'name');
            validator.validate();
            const result = validator.validate();
            expect(result).toBeNull();
        });
    });
});
