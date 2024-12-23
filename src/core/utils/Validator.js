'use strict';

class Validator {
    #payload;

    constructor() {
        this.#payload = new Map();
    }

    /**
     *
     * @param v
     * @returns {Validator}
     */
    isNonEmptyString(v) {
        const result = typeof v === 'string' && v.trim().length > 0;
        this.#payload.set(Symbol('isNonEmptyString'), result);

        return this;
    }

    /**
     *
     * @param v
     * @returns {Validator}
     */
    isNonEmptyObject(v) {
        const result = v !== null && typeof v === 'object' && Object.keys(v).length > 0;
        this.#payload.set(Symbol('isNonEmptyObject'), result);

        return this;
    }

    /**
     *
     * @param v
     * @returns {Validator}
     */
    isValidNumber(v) {

        if(Number.isNaN(v)) {
            this.#payload.set(Symbol('isValidNumber'), false);
            return this;
        }

        const result = typeof v === 'number';
        this.#payload.set(Symbol('isValidNumber'), result);

        return this;
    }

    /**
     *
     * @param v
     * @returns {Validator}
     */
    isValidNumberOrNull(v){

        if(Number.isNaN(v)) {
            this.#payload.set(Symbol('isValidNumberOrNull'), false);
            return this;
        }

        const result = v === null || typeof v === 'number';
        this.#payload.set(Symbol('isValidNumberOrNull'), result);

        return this;
    }

    /**
     *
     * @returns {{errors: null}|{errors: *[]}}
     */
    validate() {
        const falsy = [];

        for (const p of this.#payload) {
            const [validator, result] = p;
            if (!result) {
                falsy.push(validator.description);
            }
        }

        this.#payload.clear();

        return falsy.length === 0
            ? {errors: null}
            : {errors: falsy};
    }
}

module.exports = Validator;