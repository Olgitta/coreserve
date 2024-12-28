'use strict';

const Validator = require('#core/utils/Validator.js');
const {ValidationError} = require('#core/errors/index.js');

describe('Validator', () => {
    let validator;

    beforeEach(() => {
        validator = new Validator();
    });

    describe('isNonEmptyString', () => {

        test('should throw a ValidationError', () => {
            const validator = new Validator();
            validator.isNonEmptyString('', 'fieldName');
            expect(() => validator.validate()).toThrow(ValidationError);
        });

        test('should add error for empty string', () => {
            validator.isNonEmptyString('', 'name');
            const result = validator.validateAndReturnResult();
            expect(result).toBe('name value is invalid string');
        });

        test('should not add error for valid string', () => {
            validator.isNonEmptyString('John Doe', 'name');
            const result = validator.validateAndReturnResult();
            expect(result).toBeNull();
        });
    });

    describe('isNonEmptyObject', () => {
        test('should throw a ValidationError', () => {
            const validator = new Validator();
            validator.isNonEmptyString('', 'fieldName');
            expect(() => validator.validate()).toThrow(ValidationError);
        });

        test('should add error for non-object value', () => {
            validator.isNonEmptyObject(null, 'profile');
            const result = validator.validateAndReturnResult();
            expect(result).toBe('profile value is invalid object');
        });

        test('should add error for empty object', () => {
            validator.isNonEmptyObject({}, 'profile');
            const result = validator.validateAndReturnResult();
            expect(result).toBe('profile value is invalid object');
        });

        test('should not add error for non-empty object', () => {
            validator.isNonEmptyObject({ key: 'value' }, 'profile');
            const result = validator.validateAndReturnResult();
            expect(result).toBeNull();
        });
    });

    describe('isValidNumber', () => {

        test('should throw a ValidationError', () => {
            const validator = new Validator();
            validator.isNonEmptyString('', 'fieldName');
            expect(() => validator.validate()).toThrow(ValidationError);
        });

        test('should add error for non-number value', () => {
            validator.isValidNumber('string', 'age');
            const result = validator.validateAndReturnResult();
            expect(result).toBe('age value is invalid number');
        });

        test('should not add error for valid number', () => {
            validator.isValidNumber(42, 'age');
            const result = validator.validateAndReturnResult();
            expect(result).toBeNull();
        });

        test('should add error for NaN', () => {
            validator.isValidNumber(NaN, 'age');
            const result = validator.validateAndReturnResult();
            expect(result).toBe('age value is invalid number');
        });
    });

    describe('isValidNumberOrNull', () => {

        test('should throw a ValidationError', () => {
            const validator = new Validator();
            validator.isNonEmptyString('', 'fieldName');
            expect(() => validator.validate()).toThrow(ValidationError);
        });

        test('should add error for non-number and non-null value', () => {
            validator.isValidNumberOrNull('string', 'score');
            const result = validator.validateAndReturnResult();
            expect(result).toBe('score value is invalid number');
        });

        test('should not add error for valid number', () => {
            validator.isValidNumberOrNull(99, 'score');
            const result = validator.validateAndReturnResult();
            expect(result).toBeNull();
        });

        test('should not add error for null value', () => {
            validator.isValidNumberOrNull(null, 'score');
            const result = validator.validateAndReturnResult();
            expect(result).toBeNull();
        });

        test('should add error for NaN', () => {
            validator.isValidNumberOrNull(NaN, 'score');
            const result = validator.validateAndReturnResult();
            expect(result).toBe('score value is invalid number');
        });
    });

    describe('isValidBoolean', () => {

        test('should throw a ValidationError', () => {
            const validator = new Validator();
            validator.isValidBoolean('', 'onoff');
            expect(() => validator.validate()).toThrow(ValidationError);
        });

        test('should add error for non-boolean value', () => {
            validator.isValidBoolean(1, 'onoff');
            const result = validator.validateAndReturnResult();
            expect(result).toBe('onoff value is invalid boolean');
        });

        test('should not add error for valid boolean', () => {
            validator.isValidBoolean(false, 'onoff');
            const result = validator.validateAndReturnResult();
            expect(result).toBeNull();
        });
    });

    describe('validate', () => {
        test('should return all errors as a joined string', () => {
            validator.isNonEmptyString('', 'name');
            validator.isValidNumber('string', 'age');
            const result = validator.validateAndReturnResult();
            expect(result).toBe('name value is invalid string|age value is invalid number');
        });

        test('should clear errors after validate', () => {
            validator.isNonEmptyString('', 'name');
            validator.validateAndReturnResult();
            const result = validator.validateAndReturnResult();
            expect(result).toBeNull();
        });
    });
});
