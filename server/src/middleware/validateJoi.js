// export const validate = (schema) => {
//   return (req, res, next) => {
//     const { error, value } = schema.validate(req.body, {
//       abortEarly: false,
//       allowUnknown: false,
//       stripUnknown: true,
//     });

//     if (error) {
//       return res.status(400).json({
//         success: false,
//         message: "Validation failed",
//         errors: error.details.map((detail) => ({
//           field: detail.path.join("."),
//           message: detail.message,
//         })),
//       });
//     }

//     req.body = value;
//     next();
//   };
// };

export const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const payload =
      source === "data"
        ? req.body?.data
        : source === "body"
          ? req.body
          : req.body?.data || req.body;

    console.log("req.body", req.body);
    console.log({ payload });

    const { error, value } = schema.validate(payload, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((detail) => ({
          field: detail.path.join("."),
          type: detail.type,
          message: detail.message,
        })),
      });
    }

    if (source === "data") {
      req.body.data = value;
    } else if (source === "body") {
      req.body = value;
    } else {
      if (req.body?.data) {
        req.body.data = value;
      } else {
        req.body = value;
      }
    }

    next();
  };
};
