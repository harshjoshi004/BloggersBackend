// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next()
    }

    return res.status(401).json({
        error: "Authentication required",
        message: "Please log in to access this resource",
    })  
}

// Middleware to check if user owns the resource
const isOwner = (Model) => {
    return async (req, res, next) => {
        try {
            const resource = await Model.findById(req.params.id)

            if (!resource) {
                return res.status(404).json({ error: "Resource not found" })
            }

            // Check if the current user is the owner
            if (resource.author.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    error: "Access denied",
                    message: "You can only modify your own resources",
                })
            }

            req.resource = resource // Attach resource to request for use in controller
            next()
        } catch (error) {
            res.status(500).json({
                error: "Server error",
                message: error.message,
            })
        }
    }
}

module.exports = {
    isAuthenticated,
    isOwner,
}
