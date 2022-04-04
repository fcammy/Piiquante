const Joi = require('joi');


const validateSauce = (data) => {

    const schema = Joi.object().keys({

        name: Joi.string().required(),
        manufacturer: Joi.string().max(20).required(),
        description: Joi.string().max(50).required(),
        mainPepper: Joi.string().required(),
        heat: Joi.number().required(),

    });
    return schema.validate(data);
}

module.exports.validateSauce = validateSauce;