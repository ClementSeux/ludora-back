const express = require("express");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const { validateRequest, roleSchemas } = require("../middleware/validation");

const router = express.Router();

// Get all roles
router.get("/", authenticateToken, async (req, res) => {
    try {
        const roles = await req.prisma.role.findMany({
            include: {
                _count: {
                    select: { users: true },
                },
            },
            orderBy: {
                name: "asc",
            },
        });

        res.json({ roles });
    } catch (error) {
        console.error("Get roles error:", error);
        res.status(500).json({
            error: "Failed to retrieve roles",
            message: error.message,
        });
    }
});

// Get role by ID
router.get("/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const role = await req.prisma.role.findUnique({
            where: { id },
            include: {
                users: {
                    include: {
                        personalInfo: true,
                    },
                },
            },
        });

        if (!role) {
            return res.status(404).json({
                error: "Role not found",
                message: "Role with this ID does not exist",
            });
        }

        res.json({ role });
    } catch (error) {
        console.error("Get role error:", error);
        res.status(500).json({
            error: "Failed to retrieve role",
            message: error.message,
        });
    }
});

// Create new role (admin only)
router.post(
    "/",
    authenticateToken,
    authorizeRoles("admin"),
    validateRequest(roleSchemas.create),
    async (req, res) => {
        try {
            const { name } = req.body;

            const role = await req.prisma.role.create({
                data: { name },
            });

            res.status(201).json({
                message: "Role created successfully",
                role,
            });
        } catch (error) {
            console.error("Create role error:", error);
            res.status(500).json({
                error: "Failed to create role",
                message: error.message,
            });
        }
    }
);

// Update role (admin only)
router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    validateRequest(roleSchemas.update),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { name } = req.body;

            const role = await req.prisma.role.update({
                where: { id },
                data: { name },
            });

            res.json({
                message: "Role updated successfully",
                role,
            });
        } catch (error) {
            console.error("Update role error:", error);
            res.status(500).json({
                error: "Failed to update role",
                message: error.message,
            });
        }
    }
);

// Delete role (admin only)
router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    async (req, res) => {
        try {
            const { id } = req.params;

            // Check if role has users
            const usersCount = await req.prisma.user.count({
                where: { roleId: id },
            });

            if (usersCount > 0) {
                return res.status(400).json({
                    error: "Cannot delete role",
                    message:
                        "This role is assigned to users and cannot be deleted",
                });
            }

            await req.prisma.role.delete({
                where: { id },
            });

            res.json({
                message: "Role deleted successfully",
            });
        } catch (error) {
            console.error("Delete role error:", error);
            res.status(500).json({
                error: "Failed to delete role",
                message: error.message,
            });
        }
    }
);

module.exports = router;
