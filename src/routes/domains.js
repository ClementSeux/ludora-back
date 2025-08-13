const express = require("express");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const { validateRequest, domainSchemas } = require("../middleware/validation");

const router = express.Router();

// Get all domains
router.get("/", authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const domains = await req.prisma.domain.findMany({
            skip: parseInt(skip),
            take: parseInt(limit),
            include: {
                _count: {
                    select: { themes: true },
                },
            },
            orderBy: {
                name: "asc",
            },
        });

        const total = await req.prisma.domain.count();

        res.json({
            domains,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Get domains error:", error);
        res.status(500).json({
            error: "Failed to retrieve domains",
            message: error.message,
        });
    }
});

// Get domain by ID
router.get("/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const domain = await req.prisma.domain.findUnique({
            where: { id },
            include: {
                themes: {
                    include: {
                        _count: {
                            select: { activities: true },
                        },
                    },
                },
            },
        });

        if (!domain) {
            return res.status(404).json({
                error: "Domain not found",
                message: "Domain with this ID does not exist",
            });
        }

        res.json({ domain });
    } catch (error) {
        console.error("Get domain error:", error);
        res.status(500).json({
            error: "Failed to retrieve domain",
            message: error.message,
        });
    }
});

// Create new domain (admin/teacher/director only)
router.post(
    "/",
    authenticateToken,
    authorizeRoles("admin", "teacher", "director"),
    validateRequest(domainSchemas.create),
    async (req, res) => {
        try {
            const { name } = req.body;

            const domain = await req.prisma.domain.create({
                data: { name },
            });

            res.status(201).json({
                message: "Domain created successfully",
                domain,
            });
        } catch (error) {
            console.error("Create domain error:", error);
            res.status(500).json({
                error: "Failed to create domain",
                message: error.message,
            });
        }
    }
);

// Update domain (admin/teacher/director only)
router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("admin", "teacher", "director"),
    validateRequest(domainSchemas.update),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { name } = req.body;

            const domain = await req.prisma.domain.update({
                where: { id },
                data: { name },
            });

            res.json({
                message: "Domain updated successfully",
                domain,
            });
        } catch (error) {
            console.error("Update domain error:", error);
            res.status(500).json({
                error: "Failed to update domain",
                message: error.message,
            });
        }
    }
);

// Delete domain (admin only)
router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    async (req, res) => {
        try {
            const { id } = req.params;

            // Check if domain has themes
            const themesCount = await req.prisma.theme.count({
                where: { domainId: id },
            });

            if (themesCount > 0) {
                return res.status(400).json({
                    error: "Cannot delete domain",
                    message: "This domain has themes and cannot be deleted",
                });
            }

            await req.prisma.domain.delete({
                where: { id },
            });

            res.json({
                message: "Domain deleted successfully",
            });
        } catch (error) {
            console.error("Delete domain error:", error);
            res.status(500).json({
                error: "Failed to delete domain",
                message: error.message,
            });
        }
    }
);

module.exports = router;
