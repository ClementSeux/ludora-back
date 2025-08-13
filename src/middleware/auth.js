const jwt = require("jsonwebtoken");

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            error: "Access denied",
            message: "No token provided",
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user with role information
        const user = await req.prisma.user.findUnique({
            where: { id: decoded.userId },
            include: {
                role: true,
                personalInfo: true,
            },
        });

        if (!user) {
            return res.status(401).json({
                error: "Access denied",
                message: "Invalid token",
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({
            error: "Access denied",
            message: "Invalid token",
        });
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: "Access denied",
                message: "User not authenticated",
            });
        }

        if (!roles.includes(req.user.role.name)) {
            return res.status(403).json({
                error: "Access denied",
                message: "Insufficient permissions",
            });
        }

        next();
    };
};

module.exports = {
    authenticateToken,
    authorizeRoles,
};
