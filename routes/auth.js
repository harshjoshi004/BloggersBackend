const express = require("express")
const passport = require("passport")
const User = require("../models/User")
const { isAuthenticated } = require("../middlewares/auth")
const {
    validateUserRegistration,
    validateUserLogin,
} = require("../middlewares/validation")

const router = express.Router()

// POST /auth/signup - Register a new user
router.post("/signup", validateUserRegistration, async (req, res) => {
    try {
        const { username, email, password } = req.body

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }],
        })

        if (existingUser) {
            return res.status(400).json({
                error: "User already exists",
                message:
                    existingUser.email === email
                        ? "Email already registered"
                        : "Username already taken",
            })
        }

        // Create new user
        const user = new User({ username, email, password })
        await user.save()

        // Log the user in automatically after registration
        req.login(user, (err) => {
            if (err) {
                return res
                    .status(500)
                    .json({ error: "Login failed after registration" })
            }

            res.status(201).json({
                message: "User registered successfully",
                user: user.toJSON(),
            })
        })
    } catch (error) {
        console.error("Signup error:", error)
        res.status(500).json({
            error: "Registration failed",
            message: error.message,
        })
    }
})

// POST /auth/login - Login user
router.post("/login", validateUserLogin, (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return res
                .status(500)
                .json({ error: "Authentication error", message: err.message })
        }

        if (!user) {
            return res.status(401).json({
                error: "Login failed",
                message: info.message || "Invalid credentials",
            })
        }

        req.login(user, (err) => {
            if (err) {
                return res
                    .status(500)
                    .json({ error: "Login failed", message: err.message })
            }

            res.json({
                message: "Login successful",
                user: user.toJSON(),
            })
        })
    })(req, res, next)
})

// GET /auth/logout - Logout user
router.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            return res
                .status(500)
                .json({ error: "Logout failed", message: err.message })
        }

        req.session.destroy((err) => {
            if (err) {
                return res
                    .status(500)
                    .json({ error: "Session destruction failed" })
            }

            res.clearCookie("connect.sid") // Clear session cookie
            res.json({ message: "Logout successful" })
        })
    })
})

// GET /auth/me - Get current user
router.get("/me", isAuthenticated, (req, res) => {
    res.json({
        user: req.user.toJSON(),
    })
})

module.exports = router
