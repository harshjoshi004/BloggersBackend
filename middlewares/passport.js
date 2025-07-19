const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const User = require("../models/User")

// Local Strategy
passport.use(
    new LocalStrategy(
        {
            usernameField: "email", // Use email instead of username for login
            passwordField: "password",
        },
        async (email, password, done) => {
            try {
                // Find user by email
                const user = await User.findOne({ email: email.toLowerCase() })

                if (!user) {
                    return done(null, false, {
                        message: "Invalid email or password",
                    })
                }

                // Check password
                const isMatch = await user.comparePassword(password)

                if (!isMatch) {
                    return done(null, false, {
                        message: "Invalid email or password",
                    })
                }

                return done(null, user)
            } catch (error) {
                return done(error)
            }
        }
    )
)

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user._id)
})

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id).select("-password")
        done(null, user)
    } catch (error) {
        done(error)
    }
})
