const express = require("express");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const { validateRequest, themeSchemas } = require("../middleware/validation");

const router = express.Router();

// Get all themes
router.get("/", authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, domain } = req.query;
        const skip = (page - 1) * limit;

        const where = {};
        if (domain) {
            where.domain = { name: { contains: domain, mode: "insensitive" } };
        }

        const themes = await req.prisma.theme.findMany({
            where,
            skip: parseInt(skip),
            take: parseInt(limit),
            include: {
                domain: true,
                _count: {
                    select: { activities: true },
                },
            },
            orderBy: {
                name: "asc",
            },
        });

        const total = await req.prisma.theme.count({ where });

        res.json({
            themes,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Get themes error:", error);
        res.status(500).json({
            error: "Failed to retrieve themes",
            message: error.message,
        });
    }
});

// Get theme by ID
router.get("/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const theme = await req.prisma.theme.findUnique({
            where: { id },
            include: {
                domain: true,
                activities: true,
            },
        });

        if (!theme) {
            return res.status(404).json({
                error: "Theme not found",
                message: "Theme with this ID does not exist",
            });
        }

        res.json({ theme });
    } catch (error) {
        console.error("Get theme error:", error);
        res.status(500).json({
            error: "Failed to retrieve theme",
            message: error.message,
        });
    }
});

// Create new theme (admin/teacher/director only)
router.post(
    "/",
    authenticateToken,
    authorizeRoles("admin", "teacher", "director"),
    validateRequest(themeSchemas.create),
    async (req, res) => {
        try {
            const { name, domainId } = req.body;

            const theme = await req.prisma.theme.create({
                data: {
                    name,
                    domainId,
                },
                include: {
                    domain: true,
                },
            });

            res.status(201).json({
                message: "Theme created successfully",
                theme,
            });
        } catch (error) {
            console.error("Create theme error:", error);
            res.status(500).json({
                error: "Failed to create theme",
                message: error.message,
            });
        }
    }
);

// Update theme (admin/teacher/director only)
router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("admin", "teacher", "director"),
    validateRequest(themeSchemas.update),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { name, domainId } = req.body;

            const updateData = {};
            if (name !== undefined) updateData.name = name;
            if (domainId !== undefined) updateData.domainId = domainId;

            const theme = await req.prisma.theme.update({
                where: { id },
                data: updateData,
                include: {
                    domain: true,
                },
            });

            res.json({
                message: "Theme updated successfully",
                theme,
            });
        } catch (error) {
            console.error("Update theme error:", error);
            res.status(500).json({
                error: "Failed to update theme",
                message: error.message,
            });
        }
    }
);

// Delete theme (admin only)
router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    async (req, res) => {
        try {
            const { id } = req.params;

            // Check if theme has activities
            const activitiesCount = await req.prisma.activity.count({
                where: { themeId: id },
            });

            if (activitiesCount > 0) {
                return res.status(400).json({
                    error: "Cannot delete theme",
                    message: "This theme has activities and cannot be deleted",
                });
            }

            await req.prisma.theme.delete({
                where: { id },
            });

            res.json({
                message: "Theme deleted successfully",
            });
        } catch (error) {
            console.error("Delete theme error:", error);
            res.status(500).json({
                error: "Failed to delete theme",
                message: error.message,
            });
        }
    }
);

module.exports = router;
