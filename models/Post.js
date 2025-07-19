const mongoose = require("mongoose")

const postSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
            maxlength: [200, "Title cannot exceed 200 characters"],
        },
        content: {
            type: String,
            required: [true, "Content is required"],
            minlength: [10, "Content must be at least 10 characters long"],
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            trim: true,
            enum: {
                values: [
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
                ],
                message: "Category must be one of the predefined options",
            },
        },
        tags: [
            {
                type: String,
                trim: true,
                maxlength: [30, "Each tag cannot exceed 30 characters"],
            },
        ],
        published: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
)

// Index for search functionality
postSchema.index({ title: "text", content: "text", tags: "text" })
postSchema.index({ category: 1 })
postSchema.index({ author: 1 })
postSchema.index({ createdAt: -1 })

module.exports = mongoose.model("Post", postSchema)
