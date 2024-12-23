const Validator = require('../../../src/core/utils/Validator');

describe('Validator', () => {
    let validator;

    beforeEach(() => {
        validator = new Validator();
    });

    test('isNonEmptyString validates correctly', () => {
        const result = validator.isNonEmptyString('hello').validate();
        expect(result).toEqual({ success: true });

        const invalidResult = validator.isNonEmptyString('').validate();
        expect(invalidResult).toEqual({ success: false, failed: ['isNonEmptyString'] });
    });

    test('isNonEmptyObject validates correctly', () => {
        const result = validator.isNonEmptyObject({ key: 'value' }).validate();
        expect(result).toEqual({ success: true });

        const invalidResult = validator.isNonEmptyObject({}).validate();
        expect(invalidResult).toEqual({ success: false, failed: ['isNonEmptyObject'] });
    });

    test('isValidNumber validates correctly', () => {
        const result = validator.isValidNumber(10, {
            gt:5
        }).validate();
        expect(result).toEqual({ success: true });

        const invalidResult = validator.isValidNumber(2, {
            gt:5
        }).validate();
        expect(invalidResult).toEqual({ success: false, failed: ['isValidNumber'] });
    });

    test('validate handles multiple validations', () => {
        const result = validator
            .isNonEmptyString('hello')
            .isNonEmptyObject({ key: 'value' })
            .isValidNumber(10, {
                lt:20
            })
            .isValidNumber(null, {
                nullable:true
            })
            .validate();
        expect(result).toEqual({ success: true });

        const invalidResult = validator
            .isNonEmptyString('')
            .isNonEmptyObject({})
            .isValidNumber(2, {
                gt:5
            })
            .validate();
        expect(invalidResult).toEqual({
            success: false,
            failed: ['isNonEmptyString', 'isNonEmptyObject', 'isValidNumber']
        });
    });

    test('validate clears payload after execution', () => {
        validator.isNonEmptyString('hello').validate();
        const result = validator.isNonEmptyObject({ key: 'value' }).validate();
        expect(result).toEqual({ success: true });
    });
});
