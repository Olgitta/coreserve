'use strict';

const Validator = require('../../../src/core/utils/Validator');

describe('Validator Test', () => {
    let validator;

    beforeEach(() => {
        validator = new Validator();
    });

    describe('isNonEmptyString', () => {
        it('should return true for a non-empty string', () => {
            const result = validator.isNonEmptyString('Hello').validate();
            expect(result.errors).toBeNull();
        });

        it('should return false for an empty string', () => {
            const result = validator.isNonEmptyString('').validate();
            expect(result.errors).toEqual(expect.arrayContaining(['isNonEmptyString']));
        });

        it('should return false for a non-string value', () => {
            const result = validator.isNonEmptyString(123).validate();
            expect(result.errors).toEqual(expect.arrayContaining(['isNonEmptyString']));
        });
    });

    describe('isNonEmptyObject', () => {
        it('should return true for a non-empty object', () => {
            const result = validator.isNonEmptyObject({ key: 'value' }).validate();
            expect(result.errors).toBeNull();
        });

        it('should return false for an empty object', () => {
            const result = validator.isNonEmptyObject({}).validate();
            expect(result.errors).toEqual(expect.arrayContaining(['isNonEmptyObject']));
        });

        it('should return false for null', () => {
            const result = validator.isNonEmptyObject(null).validate();
            expect(result.errors).toEqual(expect.arrayContaining(['isNonEmptyObject']));
        });

        it('should return false for a non-object value', () => {
            const result = validator.isNonEmptyObject(123).validate();
            expect(result.errors).toEqual(expect.arrayContaining(['isNonEmptyObject']));
        });
    });

    describe('isValidNumber', () => {
        it('should return true for a valid number', () => {
            const result = validator.isValidNumber(123).validate();
            expect(result.errors).toBeNull();
        });

        it('should return false for NaN', () => {
            const result = validator.isValidNumber(NaN).validate();
            expect(result.errors).toEqual(expect.arrayContaining(['isValidNumber']));
        });

        it('should return false for a non-number value', () => {
            const result = validator.isValidNumber('123').validate();
            expect(result.errors).toEqual(expect.arrayContaining(['isValidNumber']));
        });
    });

    describe('isValidNumberOrNull', () => {
        it('should return true for a valid number', () => {
            const result = validator.isValidNumberOrNull(123).validate();
            expect(result.errors).toBeNull();
        });

        it('should return true for null', () => {
            const result = validator.isValidNumberOrNull(null).validate();
            expect(result.errors).toBeNull();
        });

        it('should return false for NaN', () => {
            const result = validator.isValidNumberOrNull(NaN).validate();
            expect(result.errors).toEqual(expect.arrayContaining(['isValidNumberOrNull']));
        });

        it('should return false for a non-number value', () => {
            const result = validator.isValidNumberOrNull('123').validate();
            expect(result.errors).toEqual(expect.arrayContaining(['isValidNumberOrNull']));
        });
    });

    describe('validate', () => {
        it('should return errors for multiple failing validators', () => {
            const result = validator
                .isNonEmptyString('')
                .isNonEmptyObject({})
                .isValidNumber(NaN)
                .validate();
            expect(result.errors).toEqual(expect.arrayContaining([
                'isNonEmptyString',
                'isNonEmptyObject',
                'isValidNumber'
            ]));
        });

        it('should clear payload after validation', () => {
            validator.isNonEmptyString('');
            validator.validate();
            const result = validator.isNonEmptyString('Hello').validate();
            expect(result.errors).toBeNull();
        });
    });
});
