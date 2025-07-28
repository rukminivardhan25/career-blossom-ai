import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

export const validateSignup = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('fullName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Full name must be at least 2 characters long'),
  body('role')
    .isIn(['USER', 'ADMIN'])
    .withMessage('Role must be either USER or ADMIN'),
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

export const validateTestSubmission = [
  body('answers')
    .isArray()
    .withMessage('Answers must be an array'),
  body('answers.*')
    .isObject()
    .withMessage('Each answer must be an object'),
  handleValidationErrors
];

export const validateProfile = [
  body('fullName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Full name must be at least 2 characters long'),
  body('age')
    .optional()
    .isInt({ min: 16, max: 100 })
    .withMessage('Age must be between 16 and 100'),
  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  handleValidationErrors
];

export const validateCareerPath = [
  body('title')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Title must be at least 3 characters long'),
  body('description')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long'),
  body('requirements')
    .isArray()
    .withMessage('Requirements must be an array'),
  body('skills')
    .isArray()
    .withMessage('Skills must be an array'),
  handleValidationErrors
]; 