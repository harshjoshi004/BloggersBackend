const { body, query, validationResult } = require("express-validator")

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array())
        return res.status(400).json({
            error: "Validation failed",
            details: errors.array(),
        })
    }
    next()
}

// User registration validation - More lenient for testing
const validateUserRegistration = [
    body("username")
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage("Username must be between 3 and 30 characters")
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage(
            "Username can only contain letters, numbers, and underscores"
        ),

    body("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email address"),

    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
    // Removed complex password requirements for testing

    handleValidationErrors,
]

// User login validation
const validateUserLogin = [
    body("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email address"),

    body("password").notEmpty().withMessage("Password is required"),

    handleValidationErrors,
]

// Post creation/update validation
const validatePost = [
    body("title")
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage("Title must be between 1 and 200 characters"),

    body("content")
        .trim()
        .isLength({ min: 10 })
        .withMessage("Content must be at least 10 characters long"),

    body("category")
        .trim()
        .isIn([
            "Technology",
            "Lifestyle",
            "Travel",
            "Food",
            "Health",
            "Business",
            "Education",
            "Entertainment",
            "Sports",
            "Other",
        ])
        .withMessage("Please select a valid category"),

    body("tags")
        .optional()
        .isArray()
        .withMessage("Tags must be an array")
        .custom((tags) => {
            if (tags && tags.length > 10) {
                throw new Error("Maximum 10 tags allowed")
            }
            return true
        }),

    body("tags.*")
        .optional()
        .trim()
        .isLength({ max: 30 })
        .withMessage("Each tag must be 30 characters or less"),

    handleValidationErrors,
]

// Query validation for posts
const validatePostQuery = [
    query("q")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Search query must be 100 characters or less"),

    query("category")
        .optional()
        .trim()
        .isIn([
            "Technology",
            "Lifestyle",
            "Travel",
            "Food",
            "Health",
            "Business",
            "Education",
            "Entertainment",
            "Sports",
            "Other",
        ])
        .withMessage("Invalid category filter"),

    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer"),

    query("limit")
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage("Limit must be between 1 and 50"),

    handleValidationErrors,
]

module.exports = {
    validateUserRegistration,
    validateUserLogin,
    validatePost,
    validatePostQuery,
}
