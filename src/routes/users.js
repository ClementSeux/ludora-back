const express = require("express");
const bcrypt = require("bcryptjs");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const { validateRequest, userSchemas } = require("../middleware/validation");

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Récupérer tous les utilisateurs (admin uniquement)
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filtrer par rôle
 *       - in: query
 *         name: school
 *         schema:
 *           type: string
 *         description: Filtrer par école
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationResponse'
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur serveur
 */

// Get all users (admin only)
router.get(
    "/",
    authenticateToken,
    authorizeRoles("admin"),
    async (req, res) => {
        try {
            const { page = 1, limit = 10, role, school } = req.query;
            const skip = (page - 1) * limit;

            const where = {};
            if (role) {
                where.role = { name: role };
            }
            if (school) {
                where.school = {
                    name: { contains: school, mode: "insensitive" },
                };
            }

            const users = await req.prisma.user.findMany({
                where,
                skip: parseInt(skip),
                take: parseInt(limit),
                include: {
                    role: true,
                    personalInfo: true,
                    school: true,
                    parent: {
                        include: {
                            personalInfo: true,
                        },
                    },
                    children: {
                        include: {
                            personalInfo: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            });

            const total = await req.prisma.user.count({ where });

            // Remove passwords from response
            const usersWithoutPasswords = users.map((user) => {
                const { password, ...userWithoutPassword } = user;
                return userWithoutPassword;
            });

            res.json({
                users: usersWithoutPasswords,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit),
                },
            });
        } catch (error) {
            console.error("Get users error:", error);
            res.status(500).json({
                error: "Failed to retrieve users",
                message: error.message,
            });
        }
    }
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Récupérer un utilisateur par ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Données de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */

// Get user by ID
router.get("/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Users can only view their own profile unless they're admin
        if (req.user.id !== id && req.user.role.name !== "admin") {
            return res.status(403).json({
                error: "Access denied",
                message: "You can only view your own profile",
            });
        }

        const user = await req.prisma.user.findUnique({
            where: { id },
            include: {
                role: true,
                personalInfo: true,
                school: true,
                parent: {
                    include: {
                        personalInfo: true,
                    },
                },
                children: {
                    include: {
                        personalInfo: true,
                    },
                },
                createdClasses: true,
                userClasses: {
                    include: {
                        class: true,
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({
                error: "User not found",
                message: "User with this ID does not exist",
            });
        }

        // Remove password from response
        const { password, ...userWithoutPassword } = user;

        res.json({ user: userWithoutPassword });
    } catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({
            error: "Failed to retrieve user",
            message: error.message,
        });
    }
});

// Create new user (admin only)
router.post(
    "/",
    authenticateToken,
    authorizeRoles("admin"),
    validateRequest(userSchemas.create),
    async (req, res) => {
        try {
            const { password, roleId, parentId, schoolId, personalInfo } =
                req.body;

            // Check if user with this email already exists
            const existingUser = await req.prisma.userPersonalInfo.findUnique({
                where: { email: personalInfo.email },
            });

            if (existingUser) {
                return res.status(400).json({
                    error: "User already exists",
                    message: "A user with this email already exists",
                });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 12);

            // Create user with personal info
            const user = await req.prisma.user.create({
                data: {
                    password: hashedPassword,
                    roleId,
                    parentId,
                    schoolId,
                    personalInfo: {
                        create: personalInfo,
                    },
                },
                include: {
                    role: true,
                    personalInfo: true,
                    school: true,
                },
            });

            // Remove password from response
            const { password: _, ...userWithoutPassword } = user;

            res.status(201).json({
                message: "User created successfully",
                user: userWithoutPassword,
            });
        } catch (error) {
            console.error("Create user error:", error);
            res.status(500).json({
                error: "Failed to create user",
                message: error.message,
            });
        }
    }
);

// Update user
router.put(
    "/:id",
    authenticateToken,
    validateRequest(userSchemas.update),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { password, roleId, parentId, schoolId, personalInfo } =
                req.body;

            // Users can only update their own profile unless they're admin
            if (req.user.id !== id && req.user.role.name !== "admin") {
                return res.status(403).json({
                    error: "Access denied",
                    message: "You can only update your own profile",
                });
            }

            // Non-admin users cannot change their role
            if (req.user.role.name !== "admin" && roleId) {
                return res.status(403).json({
                    error: "Access denied",
                    message: "You cannot change your role",
                });
            }

            const updateData = {
                ...(roleId && { roleId }),
                ...(parentId && { parentId }),
                ...(schoolId && { schoolId }),
            };

            // Hash password if provided
            if (password) {
                updateData.password = await bcrypt.hash(password, 12);
            }

            // Update user
            const user = await req.prisma.user.update({
                where: { id },
                data: {
                    ...updateData,
                    ...(personalInfo && {
                        personalInfo: {
                            update: personalInfo,
                        },
                    }),
                },
                include: {
                    role: true,
                    personalInfo: true,
                    school: true,
                },
            });

            // Remove password from response
            const { password: _, ...userWithoutPassword } = user;

            res.json({
                message: "User updated successfully",
                user: userWithoutPassword,
            });
        } catch (error) {
            console.error("Update user error:", error);
            res.status(500).json({
                error: "Failed to update user",
                message: error.message,
            });
        }
    }
);

// Delete user (admin only)
router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    async (req, res) => {
        try {
            const { id } = req.params;

            await req.prisma.user.delete({
                where: { id },
            });

            res.json({
                message: "User deleted successfully",
            });
        } catch (error) {
            console.error("Delete user error:", error);
            res.status(500).json({
                error: "Failed to delete user",
                message: error.message,
            });
        }
    }
);

// Add user to class
router.post(
    "/:userId/classes/:classId",
    authenticateToken,
    authorizeRoles("admin", "teacher", "director"),
    async (req, res) => {
        try {
            const { userId, classId } = req.params;

            const userClass = await req.prisma.userClass.create({
                data: {
                    userId,
                    classId,
                },
                include: {
                    user: {
                        include: {
                            personalInfo: true,
                        },
                    },
                    class: true,
                },
            });

            res.status(201).json({
                message: "User added to class successfully",
                userClass,
            });
        } catch (error) {
            console.error("Add user to class error:", error);
            res.status(500).json({
                error: "Failed to add user to class",
                message: error.message,
            });
        }
    }
);

// Remove user from class
router.delete(
    "/:userId/classes/:classId",
    authenticateToken,
    authorizeRoles("admin", "teacher", "director"),
    async (req, res) => {
        try {
            const { userId, classId } = req.params;

            await req.prisma.userClass.delete({
                where: {
                    userId_classId: {
                        userId,
                        classId,
                    },
                },
            });

            res.json({
                message: "User removed from class successfully",
            });
        } catch (error) {
            console.error("Remove user from class error:", error);
            res.status(500).json({
                error: "Failed to remove user from class",
                message: error.message,
            });
        }
    }
);

module.exports = router;
