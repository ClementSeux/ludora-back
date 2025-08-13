const Joi = require("joi");

const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: "Validation Error",
                message: error.details[0].message,
            });
        }
        next();
    };
};

// User validation schemas
const userSchemas = {
    create: Joi.object({
        password: Joi.string().min(6).required(),
        roleId: Joi.string().required(),
        parentId: Joi.string().optional(),
        schoolId: Joi.string().optional(),
        personalInfo: Joi.object({
            name: Joi.string().required(),
            firstName: Joi.string().required(),
            email: Joi.string().email().required(),
            phone: Joi.string().optional(),
            image: Joi.string().optional(),
            city: Joi.string().optional(),
            zipCode: Joi.string().optional(),
        }).required(),
    }),
    update: Joi.object({
        password: Joi.string().min(6).optional(),
        roleId: Joi.string().optional(),
        parentId: Joi.string().optional(),
        schoolId: Joi.string().optional(),
        personalInfo: Joi.object({
            name: Joi.string().optional(),
            firstName: Joi.string().optional(),
            email: Joi.string().email().optional(),
            phone: Joi.string().optional(),
            image: Joi.string().optional(),
            city: Joi.string().optional(),
            zipCode: Joi.string().optional(),
        }).optional(),
    }),
};

// Role validation schemas
const roleSchemas = {
    create: Joi.object({
        name: Joi.string().required(),
    }),
    update: Joi.object({
        name: Joi.string().optional(),
    }),
};

// School validation schemas
const schoolSchemas = {
    create: Joi.object({
        name: Joi.string().required(),
        city: Joi.string().optional(),
        zipCode: Joi.string().optional(),
    }),
    update: Joi.object({
        name: Joi.string().optional(),
        city: Joi.string().optional(),
        zipCode: Joi.string().optional(),
    }),
};

// Class validation schemas
const classSchemas = {
    create: Joi.object({
        name: Joi.string().required(),
        schoolId: Joi.string().optional(),
    }),
    update: Joi.object({
        name: Joi.string().optional(),
        schoolId: Joi.string().optional(),
    }),
};

// Activity validation schemas
const activitySchemas = {
    create: Joi.object({
        name: Joi.string().required(),
        themeId: Joi.string().required(),
    }),
    update: Joi.object({
        name: Joi.string().optional(),
        themeId: Joi.string().optional(),
    }),
};

// Theme validation schemas
const themeSchemas = {
    create: Joi.object({
        name: Joi.string().required(),
        domainId: Joi.string().optional(),
    }),
    update: Joi.object({
        name: Joi.string().optional(),
        domainId: Joi.string().optional(),
    }),
};

// Domain validation schemas
const domainSchemas = {
    create: Joi.object({
        name: Joi.string().required(),
    }),
    update: Joi.object({
        name: Joi.string().optional(),
    }),
};

// Auth validation schemas
const authSchemas = {
    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    }),
    register: userSchemas.create,
};

module.exports = {
    validateRequest,
    userSchemas,
    roleSchemas,
    schoolSchemas,
    classSchemas,
    activitySchemas,
    themeSchemas,
    domainSchemas,
    authSchemas,
};
