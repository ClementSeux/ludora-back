const express = require("express");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const { validateRequest, classSchemas } = require("../middleware/validation");

const router = express.Router();

// Get all classes
router.get("/", authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, school } = req.query;
        const skip = (page - 1) * limit;

        const where = {};
        if (school) {
            where.school = { name: { contains: school, mode: "insensitive" } };
        }

        // If user is not admin, only show classes they have access to
        if (req.user.role.name === "teacher") {
            where.createdByUserId = req.user.id;
        } else if (req.user.role.name === "director" && req.user.schoolId) {
            where.schoolId = req.user.schoolId;
        }

        const classes = await req.prisma.class.findMany({
            where,
            skip: parseInt(skip),
            take: parseInt(limit),
            include: {
                createdBy: {
                    include: {
                        personalInfo: true,
                    },
                },
                school: true,
                _count: {
                    select: { userClasses: true },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        const total = await req.prisma.class.count({ where });

        res.json({
            classes,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Get classes error:", error);
        res.status(500).json({
            error: "Failed to retrieve classes",
            message: error.message,
        });
    }
});

// Get class by ID
router.get("/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const classData = await req.prisma.class.findUnique({
            where: { id },
            include: {
                createdBy: {
                    include: {
                        personalInfo: true,
                    },
                },
                school: true,
                userClasses: {
                    include: {
                        user: {
                            include: {
                                personalInfo: true,
                                role: true,
                            },
                        },
                    },
                },
            },
        });

        if (!classData) {
            return res.status(404).json({
                error: "Class not found",
                message: "Class with this ID does not exist",
            });
        }

        // Check access permissions
        const hasAccess =
            req.user.role.name === "admin" ||
            classData.createdByUserId === req.user.id ||
            (req.user.role.name === "director" &&
                classData.schoolId === req.user.schoolId) ||
            classData.userClasses.some((uc) => uc.userId === req.user.id);

        if (!hasAccess) {
            return res.status(403).json({
                error: "Access denied",
                message: "You do not have access to this class",
            });
        }

        res.json({ class: classData });
    } catch (error) {
        console.error("Get class error:", error);
        res.status(500).json({
            error: "Failed to retrieve class",
            message: error.message,
        });
    }
});

// Create new class (admin/teacher/director only)
router.post(
    "/",
    authenticateToken,
    authorizeRoles("admin", "teacher", "director"),
    validateRequest(classSchemas.create),
    async (req, res) => {
        try {
            const { name, schoolId } = req.body;

            // If user is director, they can only create classes in their school
            if (
                req.user.role.name === "director" &&
                schoolId !== req.user.schoolId
            ) {
                return res.status(403).json({
                    error: "Access denied",
                    message: "You can only create classes in your own school",
                });
            }

            const classData = await req.prisma.class.create({
                data: {
                    name,
                    createdByUserId: req.user.id,
                    schoolId: schoolId || req.user.schoolId,
                },
                include: {
                    createdBy: {
                        include: {
                            personalInfo: true,
                        },
                    },
                    school: true,
                },
            });

            res.status(201).json({
                message: "Class created successfully",
                class: classData,
            });
        } catch (error) {
            console.error("Create class error:", error);
            res.status(500).json({
                error: "Failed to create class",
                message: error.message,
            });
        }
    }
);

// Update class
router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("admin", "teacher", "director"),
    validateRequest(classSchemas.update),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { name, schoolId } = req.body;

            // Get the class to check permissions
            const existingClass = await req.prisma.class.findUnique({
                where: { id },
            });

            if (!existingClass) {
                return res.status(404).json({
                    error: "Class not found",
                    message: "Class with this ID does not exist",
                });
            }

            // Check if user can update this class
            const canUpdate =
                req.user.role.name === "admin" ||
                existingClass.createdByUserId === req.user.id ||
                (req.user.role.name === "director" &&
                    existingClass.schoolId === req.user.schoolId);

            if (!canUpdate) {
                return res.status(403).json({
                    error: "Access denied",
                    message: "You do not have permission to update this class",
                });
            }

            const updateData = {};
            if (name !== undefined) updateData.name = name;
            if (schoolId !== undefined) updateData.schoolId = schoolId;

            const classData = await req.prisma.class.update({
                where: { id },
                data: updateData,
                include: {
                    createdBy: {
                        include: {
                            personalInfo: true,
                        },
                    },
                    school: true,
                },
            });

            res.json({
                message: "Class updated successfully",
                class: classData,
            });
        } catch (error) {
            console.error("Update class error:", error);
            res.status(500).json({
                error: "Failed to update class",
                message: error.message,
            });
        }
    }
);

// Delete class
router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("admin", "teacher", "director"),
    async (req, res) => {
        try {
            const { id } = req.params;

            // Get the class to check permissions
            const existingClass = await req.prisma.class.findUnique({
                where: { id },
            });

            if (!existingClass) {
                return res.status(404).json({
                    error: "Class not found",
                    message: "Class with this ID does not exist",
                });
            }

            // Check if user can delete this class
            const canDelete =
                req.user.role.name === "admin" ||
                existingClass.createdByUserId === req.user.id ||
                (req.user.role.name === "director" &&
                    existingClass.schoolId === req.user.schoolId);

            if (!canDelete) {
                return res.status(403).json({
                    error: "Access denied",
                    message: "You do not have permission to delete this class",
                });
            }

            await req.prisma.class.delete({
                where: { id },
            });

            res.json({
                message: "Class deleted successfully",
            });
        } catch (error) {
            console.error("Delete class error:", error);
            res.status(500).json({
                error: "Failed to delete class",
                message: error.message,
            });
        }
    }
);

// Get students in class
router.get("/:id/students", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if class exists and user has access
        const classData = await req.prisma.class.findUnique({
            where: { id },
            include: {
                userClasses: {
                    include: {
                        user: {
                            include: {
                                personalInfo: true,
                                role: true,
                            },
                        },
                    },
                },
            },
        });

        if (!classData) {
            return res.status(404).json({
                error: "Class not found",
                message: "Class with this ID does not exist",
            });
        }

        // Check access permissions
        const hasAccess =
            req.user.role.name === "admin" ||
            classData.createdByUserId === req.user.id ||
            (req.user.role.name === "director" &&
                classData.schoolId === req.user.schoolId);

        if (!hasAccess) {
            return res.status(403).json({
                error: "Access denied",
                message: "You do not have access to this class",
            });
        }

        const students = classData.userClasses.map((uc) => ({
            ...uc.user,
            password: undefined, // Remove password from response
        }));

        res.json({ students });
    } catch (error) {
        console.error("Get class students error:", error);
        res.status(500).json({
            error: "Failed to retrieve class students",
            message: error.message,
        });
    }
});

module.exports = router;
