const express = require("express")
const mongoose = require("mongoose")
const session = require("express-session")
const MongoStore = require("connect-mongo")
const passport = require("passport")
const cors = require("cors")
require("dotenv").config()
const authRoutes = require("./routes/auth")
const postRoutes = require("./routes/posts")
require("./middlewares/passport")

const app = express()
const PORT = process.env.PORT || 3000

mongoose
    .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to DB"))
    .catch((err) => console.error("Can't connect to DB:", err))

// -----------------
// CORS middleware
// -----------------
app.use(
    cors({
        origin: true, 
        credentials: true, 
    })
)

app.options(
    "*",
    cors({
        origin: true,
        credentials: true,
    })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(
    session({
        secret: process.env.SESSION_SECRET, 
        resave: false, 
        saveUninitialized: false, 
        store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URI,
            touchAfter: 24 * 3600, 
        }),
        cookie: {
            secure: true, 
            httpOnly: true, 
            maxAge: 1000 * 60 * 60 * 24 * 7, 
            sameSite: "none", 
        },
    })
)

app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`)
    console.log("Session ID:", req.sessionID)
    console.log("Session:", req.session)
    console.log("User:", req.user)
    console.log("Is Authenticated:", req.isAuthenticated())
    console.log("---")
    next()
})

app.use("/auth", authRoutes)
app.use("/posts", postRoutes)

app.get("/", (req, res) => {
    res.json({
        message: "Blog Platform API is running!",
        timestamp: new Date().toISOString(),
        session: req.sessionID,
        authenticated: req.isAuthenticated(),
    })
})

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

app.use("*", (req, res) => {
    res.status(404).json({ error: "Route not found" })
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
