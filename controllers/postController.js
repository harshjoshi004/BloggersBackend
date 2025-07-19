const Post = require("../models/Post")

class PostController {
    static async getUserPosts(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query
            const skip = (page - 1) * limit

            const posts = await Post.find({ author: req.user._id })
                .populate("author", "username email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number.parseInt(limit))

            const total = await Post.countDocuments({ author: req.user._id })

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
            res.status(500).json({
                error: "Failed to fetch posts",
                message: error.message,
            })
        }
    }
    static async getPostsByCategory(req, res) {
        try {
            const { category } = req.params
            const { page = 1, limit = 10 } = req.query
            const skip = (page - 1) * limit

            const posts = await Post.find({ category, published: true })
                .populate("author", "username email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number.parseInt(limit))

            const total = await Post.countDocuments({
                category,
                published: true,
            })

            res.json({
                posts,
                category,
                pagination: {
                    currentPage: Number.parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalPosts: total,
                    hasNext: page * limit < total,
                    hasPrev: page > 1,
                },
            })
        } catch (error) {
            res.status(500).json({
                error: "Failed to fetch posts",
                message: error.message,
            })
        }
    }

    static async togglePublished(req, res) {
        try {
            const post = await Post.findOne({
                _id: req.params.id,
                author: req.user._id,
            })

            if (!post) {
                return res.status(404).json({ error: "Post not found" })
            }

            post.published = !post.published
            await post.save()

            res.json({
                message: `Post ${
                    post.published ? "published" : "unpublished"
                } successfully`,
                post,
            })
        } catch (error) {
            res.status(500).json({
                error: "Failed to update post",
                message: error.message,
            })
        }
    }
}

module.exports = PostController
