'use strict';

class ApiError extends Error {
    constructor(message, details) {
        super(message);
        this.details = details;
    }

    toJSON() {
        return {
            message: this.message,
            details: this.details,
        };
    }
}

class PaginationError extends Error {
    constructor(message, details) {
        super(message);
        this.details = details;
    }

    toJSON() {
        return {
            message: this.message,
            details: this.details,
        };
    }
}

class ValidationError extends TypeError {

    constructor(message, details) {
        super(message);
        this.details = details;
    }

    toJSON() {
        return {
            message: this.message,
            details: this.details,
        };
    }
}

module.exports.ApiError = ApiError;
module.exports.PaginationError = PaginationError;
module.exports.ValidationError = ValidationError;