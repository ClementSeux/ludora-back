const express = require("express");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const {
    validateRequest,
    activitySchemas,
} = require("../middleware/validation");

const router = express.Router();

// Get all activities
router.get("/", authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, theme } = req.query;
        const skip = (page - 1) * limit;

        const where = {};
        if (theme) {
            where.theme = { name: { contains: theme, mode: "insensitive" } };
        }

        const activities = await req.prisma.activity.findMany({
            where,
            skip: parseInt(skip),
            take: parseInt(limit),
            include: {
                theme: {
                    include: {
                        domain: true,
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });

        const total = await req.prisma.activity.count({ where });

        res.json({
            activities,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Get activities error:", error);
        res.status(500).json({
            error: "Failed to retrieve activities",
            message: error.message,
        });
    }
});

// Get activity by ID
router.get("/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const activity = await req.prisma.activity.findUnique({
            where: { id },
            include: {
                theme: {
                    include: {
                        domain: true,
                    },
                },
            },
        });

        if (!activity) {
            return res.status(404).json({
                error: "Activity not found",
                message: "Activity with this ID does not exist",
            });
        }

        res.json({ activity });
    } catch (error) {
        console.error("Get activity error:", error);
        res.status(500).json({
            error: "Failed to retrieve activity",
            message: error.message,
        });
    }
});

// Create new activity (admin/teacher/director only)
router.post(
    "/",
    authenticateToken,
    authorizeRoles("admin", "teacher", "director"),
    validateRequest(activitySchemas.create),
    async (req, res) => {
        try {
            const { name, themeId } = req.body;

            const activity = await req.prisma.activity.create({
                data: {
                    name,
                    themeId,
                },
                include: {
                    theme: {
                        include: {
                            domain: true,
                        },
                    },
                },
            });

            res.status(201).json({
                message: "Activity created successfully",
                activity,
            });
        } catch (error) {
            console.error("Create activity error:", error);
            res.status(500).json({
                error: "Failed to create activity",
                message: error.message,
            });
        }
    }
);

// Update activity (admin/teacher/director only)
router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("admin", "teacher", "director"),
    validateRequest(activitySchemas.update),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { name, themeId } = req.body;

            const updateData = {};
            if (name !== undefined) updateData.name = name;
            if (themeId !== undefined) updateData.themeId = themeId;

            const activity = await req.prisma.activity.update({
                where: { id },
                data: updateData,
                include: {
                    theme: {
                        include: {
                            domain: true,
                        },
                    },
                },
            });

            res.json({
                message: "Activity updated successfully",
                activity,
            });
        } catch (error) {
            console.error("Update activity error:", error);
            res.status(500).json({
                error: "Failed to update activity",
                message: error.message,
            });
        }
    }
);

// Delete activity (admin only)
router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    async (req, res) => {
        try {
            const { id } = req.params;

            await req.prisma.activity.delete({
                where: { id },
            });

            res.json({
                message: "Activity deleted successfully",
            });
        } catch (error) {
            console.error("Delete activity error:", error);
            res.status(500).json({
                error: "Failed to delete activity",
                message: error.message,
            });
        }
    }
);

module.exports = router;
