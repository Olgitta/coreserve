'use strict';

module.exports = function idTransformPlugin(schema) {
    schema.set('toJSON', {
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    });

    schema.set('toObject', {
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    });
};
