const express = require("express")
const Post = require("../models/Post")
const { isAuthenticated, isOwner } = require("../middlewares/auth")
const { validatePost, validatePostQuery } = require("../middlewares/validation")

const router = express.Router()

// GET /posts - Get all posts with optional search and filtering
router.get("/", validatePostQuery, async (req, res) => {
    try {
        const { q, category, page = 1, limit = 10 } = req.query
        const skip = (page - 1) * limit

        // Build query object
        const query = { published: true }

        // Add search functionality
        if (q) {
            query.$text = { $search: q }
        }

        // Add category filter
        if (category) {
            query.category = category
        }

        // Execute query with pagination
        const posts = await Post.find(query)
            .populate("author", "username email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number.parseInt(limit))

        // Get total count for pagination
        const total = await Post.countDocuments(query)

        res.json({
            posts,
            pagination: {
                currentPage: Number.parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalPosts: total,
                hasNext: page * limit < total,
                hasPrev: page > 1,
            },
        })
    } catch (error) {
        console.error("Get posts error:", error)
        res.status(500).json({
            error: "Failed to fetch posts",
            message: error.message,
        })
    }
})

// GET /posts/:id - Get single post
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate(
            "author",
            "username email"
        )

        if (!post) {
            return res.status(404).json({ error: "Post not found" })
        }

        res.json({ post })
    } catch (error) {
        console.error("Get post error:", error)
        if (error.name === "CastError") {
            return res.status(400).json({ error: "Invalid post ID" })
        }
        res.status(500).json({
            error: "Failed to fetch post",
            message: error.message,
        })
    }
})

// POST /posts - Create new post (authenticated users only)
router.post("/", isAuthenticated, validatePost, async (req, res) => {
    try {
        const { title, content, category, tags } = req.body

        const post = new Post({
            title,
            content,
            category,
            tags: tags || [],
            author: req.user._id,
        })

        await post.save()
        await post.populate("author", "username email")

        res.status(201).json({
            message: "Post created successfully",
            post,
        })
    } catch (error) {
        console.error("Create post error:", error)
        res.status(500).json({
            error: "Failed to create post",
            message: error.message,
        })
    }
})

// PUT /posts/:id - Update post (owner only)
router.put(
    "/:id",
    isAuthenticated,
    isOwner(Post),
    validatePost,
    async (req, res) => {
        try {
            const { title, content, category, tags } = req.body

            // Update the post (req.resource is set by isOwner middleware)
            const updatedPost = await Post.findByIdAndUpdate(
                req.params.id,
                {
                    title,
                    content,
                    category,
                    tags: tags || [],
                },
                { new: true, runValidators: true }
            ).populate("author", "username email")

            res.json({
                message: "Post updated successfully",
                post: updatedPost,
            })
        } catch (error) {
            console.error("Update post error:", error)
            res.status(500).json({
                error: "Failed to update post",
                message: error.message,
            })
        }
    }
)

// DELETE /posts/:id - Delete post (owner only)
router.delete("/:id", isAuthenticated, isOwner(Post), async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id)

        res.json({
            message: "Post deleted successfully",
        })
    } catch (error) {
        console.error("Delete post error:", error)
        res.status(500).json({
            error: "Failed to delete post",
            message: error.message,
        })
    }
})

module.exports = router
