'use strict';

class Validator {
    #errorsSet;

    constructor() {
        this.#errorsSet = new Set();
    }

    /**
     *
     * @param v
     * @param k
     * @returns {Validator}
     */
    isNonEmptyString(v, k) {
        const sym = Symbol(`${k} value is invalid string`);
        const result = typeof v === 'string' && v.trim().length > 0;
        if (!result) {
            this.#errorsSet.add(sym);
            return this;
        }

        return this;
    }

    /**
     *
     * @param v
     * @param k
     * @returns {Validator}
     */
    isNonEmptyObject(v, k) {
        const sym = Symbol(`${k} value is invalid object`);
        const result = v !== null && typeof v === 'object' && Object.keys(v).length > 0;
        if (!result) {
            this.#errorsSet.add(sym);
            return this;
        }

        return this;
    }

    /**
     *
     * @param v
     * @param k
     * @returns {Validator}
     */
    isValidNumber(v, k) {
        const sym = Symbol(`${k} value is invalid number`);

        if (Number.isNaN(v)) {
            this.#errorsSet.add(sym);
            return this;
        }

        if (typeof v !== 'number') {
            this.#errorsSet.add(sym);
            return this;
        }

        return this;
    }

    /**
     *
     * @param v
     * @param k
     * @returns {Validator}
     */
    isValidBoolean(v, k) {
        const sym = Symbol(`${k} value is invalid boolean`);

        if (typeof v !== 'boolean') {
            this.#errorsSet.add(sym);
            return this;
        }

        return this;
    }

    /**
     *
     * @param v
     * @param k
     * @returns {Validator}
     */
    isValidNumberOrNull(v, k) {
        const sym = Symbol(`${k} value is invalid number`);

        if (Number.isNaN(v)) {
            this.#errorsSet.add(sym);
            return this;
        }

        const result = v === null || typeof v === 'number';
        if (!result) {
            this.#errorsSet.add(sym);
            return this;
        }

        return this;
    }

    /**
     *
     * @returns {null|string}
     */
    validate() {

        let result = null;
        if (this.#errorsSet.size > 0) {
            result = Array.from(this.#errorsSet, sym => sym.description).join('|');
        }
        this.#errorsSet.clear();

        return result
    }
}

module.exports = Validator;