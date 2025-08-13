const express = require("express");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const { validateRequest, schoolSchemas } = require("../middleware/validation");

const router = express.Router();

/**
 * @swagger
 * /api/schools:
 *   get:
 *     summary: Récupérer toutes les écoles
 *     tags: [Schools]
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
 *         name: city
 *         schema:
 *           type: string
 *         description: Filtrer par ville
 *     responses:
 *       200:
 *         description: Liste des écoles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 schools:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/School'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationResponse'
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 *   post:
 *     summary: Créer une nouvelle école
 *     tags: [Schools]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "École Primaire Victor Hugo"
 *               city:
 *                 type: string
 *                 example: "Marseille"
 *               zipCode:
 *                 type: string
 *                 example: "13001"
 *     responses:
 *       201:
 *         description: École créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: School created successfully
 *                 school:
 *                   $ref: '#/components/schemas/School'
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (admin/director uniquement)
 */

// Get all schools
router.get("/", authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, city } = req.query;
        const skip = (page - 1) * limit;

        const where = {};
        if (city) {
            where.city = { contains: city, mode: "insensitive" };
        }

        const schools = await req.prisma.school.findMany({
            where,
            skip: parseInt(skip),
            take: parseInt(limit),
            include: {
                _count: {
                    select: {
                        users: true,
                        classes: true,
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });

        const total = await req.prisma.school.count({ where });

        res.json({
            schools,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Get schools error:", error);
        res.status(500).json({
            error: "Failed to retrieve schools",
            message: error.message,
        });
    }
});

// Get school by ID
router.get("/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const school = await req.prisma.school.findUnique({
            where: { id },
            include: {
                users: {
                    include: {
                        personalInfo: true,
                        role: true,
                    },
                },
                classes: {
                    include: {
                        createdBy: {
                            include: {
                                personalInfo: true,
                            },
                        },
                        _count: {
                            select: { userClasses: true },
                        },
                    },
                },
            },
        });

        if (!school) {
            return res.status(404).json({
                error: "School not found",
                message: "School with this ID does not exist",
            });
        }

        res.json({ school });
    } catch (error) {
        console.error("Get school error:", error);
        res.status(500).json({
            error: "Failed to retrieve school",
            message: error.message,
        });
    }
});

// Create new school (admin/director only)
router.post(
    "/",
    authenticateToken,
    authorizeRoles("admin", "director"),
    validateRequest(schoolSchemas.create),
    async (req, res) => {
        try {
            const { name, city, zipCode } = req.body;

            const school = await req.prisma.school.create({
                data: {
                    name,
                    city,
                    zipCode,
                },
            });

            res.status(201).json({
                message: "School created successfully",
                school,
            });
        } catch (error) {
            console.error("Create school error:", error);
            res.status(500).json({
                error: "Failed to create school",
                message: error.message,
            });
        }
    }
);

// Update school (admin/director only)
router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("admin", "director"),
    validateRequest(schoolSchemas.update),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { name, city, zipCode } = req.body;

            // If user is director, check if they belong to this school
            if (req.user.role.name === "director" && req.user.schoolId !== id) {
                return res.status(403).json({
                    error: "Access denied",
                    message: "You can only update your own school",
                });
            }

            const updateData = {};
            if (name !== undefined) updateData.name = name;
            if (city !== undefined) updateData.city = city;
            if (zipCode !== undefined) updateData.zipCode = zipCode;

            const school = await req.prisma.school.update({
                where: { id },
                data: updateData,
            });

            res.json({
                message: "School updated successfully",
                school,
            });
        } catch (error) {
            console.error("Update school error:", error);
            res.status(500).json({
                error: "Failed to update school",
                message: error.message,
            });
        }
    }
);

// Delete school (admin only)
router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    async (req, res) => {
        try {
            const { id } = req.params;

            // Check if school has users or classes
            const usersCount = await req.prisma.user.count({
                where: { schoolId: id },
            });

            const classesCount = await req.prisma.class.count({
                where: { schoolId: id },
            });

            if (usersCount > 0 || classesCount > 0) {
                return res.status(400).json({
                    error: "Cannot delete school",
                    message:
                        "This school has users or classes and cannot be deleted",
                });
            }

            await req.prisma.school.delete({
                where: { id },
            });

            res.json({
                message: "School deleted successfully",
            });
        } catch (error) {
            console.error("Delete school error:", error);
            res.status(500).json({
                error: "Failed to delete school",
                message: error.message,
            });
        }
    }
);

module.exports = router;
