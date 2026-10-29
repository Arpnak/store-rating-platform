const { validationResult } = require("express-validator");

/**
 * Runs after express-validator chains.
 * If there are errors it replies with 422 and a tidy list; otherwise next().
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));
    return res.status(422).json({ message: "Validation failed.", errors: formatted });
  }
  next();
};

module.exports = { handleValidationErrors };
