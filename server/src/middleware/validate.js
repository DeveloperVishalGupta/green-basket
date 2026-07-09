import { validationResult } from "express-validator";

/**
 * Express-validator middleware — used in routes that chain body() validators.
 * Call as: [...body() validators, validate]
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: extractedErrors,
    });
  }

  next();
};

/**
 * Joi schema middleware factory — used in routes that validate with a Joi schema.
 * Call as: validateSchema(schema)
 */
export const validateSchema = (schema) => {
  return (req, res, next) => {
    try {
      // Parse multipart/form-data JSON if needed
      if (req.body?.data) {
        req.body = JSON.parse(req.body.data);
      }

      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        allowUnknown: false,
        stripUnknown: true,
      });

      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.details.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }

      req.body = value;
      next();
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data",
        error: err.message,
      });
    }
  };
};
