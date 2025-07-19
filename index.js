const express = require("express")
const mongoose = require("mongoose")
const session = require("express-session")
const MongoStore = require("connect-mongo")
const passport = require("passport")
const cors = require("cors")
require("dotenv").config()

// Import routes
const authRoutes = require("./routes/auth")
const postRoutes = require("./routes/posts")

// Import passport configuration
require("./middlewares/passport")

const app = express()
const PORT = process.env.PORT || 3000

// Connect to MongoDB
mongoose
    .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to DB"))
    .catch((err) => console.error("can't connect to DB:", err))

// CORS configuration for dev tunnel
app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "https://bmpkxv9f-5080.inc1.devtunnels.ms",
            // Add your dev tunnel URL here
        ],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    })
)

// Handle preflight requests
app.options("*", cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Session configuration
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URI,
            touchAfter: 24 * 3600, // lazy session update
        }),
        cookie: {
            secure: true,
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
            sameSite: "None", // Changed from 'strict' for cross-origin requests
        },
    })
)

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Add logging middleware to debug sessions
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`)
    console.log("Session ID:", req.sessionID)
    console.log("Session:", req.session)
    console.log("User:", req.user)
    console.log("Is Authenticated:", req.isAuthenticated())
    console.log("---")
    next()
})

// Routes
app.use("/auth", authRoutes)
app.use("/posts", postRoutes)

// Health check endpoint
app.get("/", (req, res) => {
    res.json({
        message: "Blog Platform API is running!",
        timestamp: new Date().toISOString(),
        session: req.sessionID,
        authenticated: req.isAuthenticated(),
    })
})

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({
        error: "Something went wrong!",
        message:
            process.env.NODE_ENV === "development"
                ? err.message
                : "Internal server error",
    })
})

// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({ error: "Route not found" })
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
