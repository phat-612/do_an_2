const { body, validationResult } = require("express-validator");

// Middleware xử lý form
const formValidationMiddleware = [
  body("*")
    .trim() // Loại bỏ khoảng trắng thừa
    .escape(), // Encode các ký tự HTML đặc biệt

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = formValidationMiddleware;
