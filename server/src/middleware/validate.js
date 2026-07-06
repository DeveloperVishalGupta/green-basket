import { validationResult } from "express-validator";

export const validate = (req, res, next) => {
  try {
    console.log("req.body:", req.body);

    const reqData = req.body?.data ? JSON.parse(req.body.data) : req.body;

    req.body = reqData; // replace stringified data with parsed object
    console.log("req.body, reqData:", req.body, reqData);
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
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON data",
      error: error.message,
    });
  }
};
