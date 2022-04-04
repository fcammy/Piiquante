const Joi = require('joi');


// Signup validation
const signupValidation = (data) => {

    const schema = Joi.object().keys({

        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(30).required(),
    });
    return schema.validate(data);
};

// Login validation
const loginValidation = (data) => {

    const schema = Joi.object().keys({

        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(30).required(),
    });
    return schema.validate(data);
};

module.exports.signupValidation = signupValidation;
module.exports.loginValidation = loginValidation;
