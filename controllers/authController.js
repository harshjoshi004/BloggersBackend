const User = require("../models/User")

class AuthController {
    static async register(req, res) {
        try {
            const { username, email, password } = req.body
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
            const user = new User({ username, email, password })
            await user.save()
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
            res.status(500).json({
                error: "Registration failed",
                message: error.message,
            })
        }
    }

    static async getProfile(req, res) {
        try {
            const user = await User.findById(req.user._id).select("-password")
            res.json({ user })
        } catch (error) {
            res.status(500).json({
                error: "Failed to fetch profile",
                message: error.message,
            })
        }
    }

    static async updateProfile(req, res) {
        try {
            const { username, email } = req.body

            const updatedUser = await User.findByIdAndUpdate(
                req.user._id,
                { username, email },
                { new: true, runValidators: true }
            ).select("-password")

            res.json({
                message: "Profile updated successfully",
                user: updatedUser,
            })
        } catch (error) {
            if (error.code === 11000) {
                return res.status(400).json({
                    error: "Username or email already exists",
                })
            }
            res.status(500).json({
                error: "Failed to update profile",
                message: error.message,
            })
        }
    }
}

module.exports = AuthController
