const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting database seeding...");

    // Create roles
    console.log("Creating roles...");
    const roles = await Promise.all([
        prisma.role.upsert({
            where: { name: "admin" },
            update: {},
            create: { name: "admin" },
        }),
        prisma.role.upsert({
            where: { name: "director" },
            update: {},
            create: { name: "director" },
        }),
        prisma.role.upsert({
            where: { name: "teacher" },
            update: {},
            create: { name: "teacher" },
        }),
        prisma.role.upsert({
            where: { name: "parent" },
            update: {},
            create: { name: "parent" },
        }),
        prisma.role.upsert({
            where: { name: "child" },
            update: {},
            create: { name: "child" },
        }),
    ]);

    console.log(`✅ Created ${roles.length} roles`);

    // Create domains
    console.log("Creating domains...");
    const domains = await Promise.all([
        prisma.domain.upsert({
            where: { name: "Mathematics" },
            update: {},
            create: { name: "Mathematics" },
        }),
        prisma.domain.upsert({
            where: { name: "Sciences" },
            update: {},
            create: { name: "Sciences" },
        }),
        prisma.domain.upsert({
            where: { name: "Languages" },
            update: {},
            create: { name: "Languages" },
        }),
        prisma.domain.upsert({
            where: { name: "Arts" },
            update: {},
            create: { name: "Arts" },
        }),
        prisma.domain.upsert({
            where: { name: "Physical Education" },
            update: {},
            create: { name: "Physical Education" },
        }),
    ]);

    console.log(`✅ Created ${domains.length} domains`);

    // Create themes
    console.log("Creating themes...");
    const themes = await Promise.all([
        // Mathematics themes
        prisma.theme.upsert({
            where: { name: "Arithmetic" },
            update: {},
            create: { name: "Arithmetic", domainId: domains[0].id },
        }),
        prisma.theme.upsert({
            where: { name: "Geometry" },
            update: {},
            create: { name: "Geometry", domainId: domains[0].id },
        }),
        // Sciences themes
        prisma.theme.upsert({
            where: { name: "Biology" },
            update: {},
            create: { name: "Biology", domainId: domains[1].id },
        }),
        prisma.theme.upsert({
            where: { name: "Physics" },
            update: {},
            create: { name: "Physics", domainId: domains[1].id },
        }),
        // Languages themes
        prisma.theme.upsert({
            where: { name: "French" },
            update: {},
            create: { name: "French", domainId: domains[2].id },
        }),
        prisma.theme.upsert({
            where: { name: "English" },
            update: {},
            create: { name: "English", domainId: domains[2].id },
        }),
    ]);

    console.log(`✅ Created ${themes.length} themes`);

    // Create activities
    console.log("Creating activities...");
    const activities = await Promise.all([
        prisma.activity.upsert({
            where: { name: "Addition and Subtraction" },
            update: {},
            create: { name: "Addition and Subtraction", themeId: themes[0].id },
        }),
        prisma.activity.upsert({
            where: { name: "Multiplication Tables" },
            update: {},
            create: { name: "Multiplication Tables", themeId: themes[0].id },
        }),
        prisma.activity.upsert({
            where: { name: "Shapes and Angles" },
            update: {},
            create: { name: "Shapes and Angles", themeId: themes[1].id },
        }),
        prisma.activity.upsert({
            where: { name: "Animal Classification" },
            update: {},
            create: { name: "Animal Classification", themeId: themes[2].id },
        }),
        prisma.activity.upsert({
            where: { name: "Forces and Motion" },
            update: {},
            create: { name: "Forces and Motion", themeId: themes[3].id },
        }),
        prisma.activity.upsert({
            where: { name: "Reading Comprehension" },
            update: {},
            create: { name: "Reading Comprehension", themeId: themes[4].id },
        }),
    ]);

    console.log(`✅ Created ${activities.length} activities`);

    // Create schools
    console.log("Creating schools...");
    const schools = await Promise.all([
        prisma.school.upsert({
            where: { name: "École Primaire Saint-Marie" },
            update: {},
            create: {
                name: "École Primaire Saint-Marie",
                city: "Paris",
                zipCode: "75001",
            },
        }),
        prisma.school.upsert({
            where: { name: "École Élémentaire Jean Moulin" },
            update: {},
            create: {
                name: "École Élémentaire Jean Moulin",
                city: "Lyon",
                zipCode: "69001",
            },
        }),
    ]);

    console.log(`✅ Created ${schools.length} schools`);

    // Create admin user
    console.log("Creating admin user...");
    const hashedPassword = await bcrypt.hash("admin123", 12);
    const adminRole = roles.find((r) => r.name === "admin");

    const admin = await prisma.user.upsert({
        where: { id: "admin-user" },
        update: {},
        create: {
            id: "admin-user",
            password: hashedPassword,
            roleId: adminRole.id,
            personalInfo: {
                create: {
                    name: "Administrator",
                    firstName: "System",
                    email: "admin@ludora.com",
                    phone: "+33123456789",
                },
            },
        },
    });

    console.log(
        "✅ Created admin user (email: admin@ludora.com, password: admin123)"
    );

    // Create director user
    console.log("Creating director user...");
    const directorRole = roles.find((r) => r.name === "director");

    const director = await prisma.user.upsert({
        where: { id: "director-user" },
        update: {},
        create: {
            id: "director-user",
            password: await bcrypt.hash("director123", 12),
            roleId: directorRole.id,
            schoolId: schools[0].id,
            personalInfo: {
                create: {
                    name: "Dupont",
                    firstName: "Marie",
                    email: "director@ludora.com",
                    phone: "+33123456790",
                    city: "Paris",
                    zipCode: "75001",
                },
            },
        },
    });

    console.log(
        "✅ Created director user (email: director@ludora.com, password: director123)"
    );

    // Create teacher user
    console.log("Creating teacher user...");
    const teacherRole = roles.find((r) => r.name === "teacher");

    const teacher = await prisma.user.upsert({
        where: { id: "teacher-user" },
        update: {},
        create: {
            id: "teacher-user",
            password: await bcrypt.hash("teacher123", 12),
            roleId: teacherRole.id,
            schoolId: schools[0].id,
            personalInfo: {
                create: {
                    name: "Martin",
                    firstName: "Pierre",
                    email: "teacher@ludora.com",
                    phone: "+33123456791",
                    city: "Paris",
                    zipCode: "75001",
                },
            },
        },
    });

    console.log(
        "✅ Created teacher user (email: teacher@ludora.com, password: teacher123)"
    );

    // Create classes
    console.log("Creating classes...");
    const classes = await Promise.all([
        prisma.class.upsert({
            where: { name: "CP-A" },
            update: {},
            create: {
                name: "CP-A",
                createdByUserId: teacher.id,
                schoolId: schools[0].id,
            },
        }),
        prisma.class.upsert({
            where: { name: "CE1-B" },
            update: {},
            create: {
                name: "CE1-B",
                createdByUserId: teacher.id,
                schoolId: schools[0].id,
            },
        }),
    ]);

    console.log(`✅ Created ${classes.length} classes`);

    console.log("🎉 Database seeding completed successfully!");
    console.log("\n📧 Default users created:");
    console.log("Admin: admin@ludora.com (password: admin123)");
    console.log("Director: director@ludora.com (password: director123)");
    console.log("Teacher: teacher@ludora.com (password: teacher123)");
}

main()
    .catch((e) => {
        console.error("❌ Error during seeding:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
