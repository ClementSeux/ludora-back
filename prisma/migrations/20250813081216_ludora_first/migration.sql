-- CreateTable
CREATE TABLE "User" (
    "id_user" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "create_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_role" TEXT NOT NULL,
    "parents_id" TEXT,
    "school" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "User_Personal_Info" (
    "id_user_info" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "image" TEXT,
    "city" TEXT,
    "zipCode" TEXT,
    "id_user" TEXT NOT NULL,

    CONSTRAINT "User_Personal_Info_pkey" PRIMARY KEY ("id_user_info")
);

-- CreateTable
CREATE TABLE "Role" (
    "id_role" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "create_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id_role")
);

-- CreateTable
CREATE TABLE "School" (
    "id_school" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "create_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "city" TEXT,
    "zipcode" TEXT,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id_school")
);

-- CreateTable
CREATE TABLE "Class" (
    "id_classe" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "create_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_user" TEXT NOT NULL,
    "schoolId" TEXT,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id_classe")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id_activity" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "theme" TEXT NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id_activity")
);

-- CreateTable
CREATE TABLE "Theme" (
    "id_theme" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,

    CONSTRAINT "Theme_pkey" PRIMARY KEY ("id_theme")
);

-- CreateTable
CREATE TABLE "Domain" (
    "id_domain" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id_domain")
);

-- CreateTable
CREATE TABLE "User_Class" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,

    CONSTRAINT "User_Class_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_Personal_Info_email_key" ON "User_Personal_Info"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_Personal_Info_id_user_key" ON "User_Personal_Info"("id_user");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Class_name_key" ON "Class"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_name_key" ON "Activity"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Theme_name_key" ON "Theme"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_name_key" ON "Domain"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_Class_user_id_class_id_key" ON "User_Class"("user_id", "class_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_id_role_fkey" FOREIGN KEY ("id_role") REFERENCES "Role"("id_role") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_parents_id_fkey" FOREIGN KEY ("parents_id") REFERENCES "User"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_school_fkey" FOREIGN KEY ("school") REFERENCES "School"("id_school") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Personal_Info" ADD CONSTRAINT "User_Personal_Info_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_created_by_user_fkey" FOREIGN KEY ("created_by_user") REFERENCES "User"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id_school") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_theme_fkey" FOREIGN KEY ("theme") REFERENCES "Theme"("id_theme") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Theme" ADD CONSTRAINT "Theme_domain_fkey" FOREIGN KEY ("domain") REFERENCES "Domain"("id_domain") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Class" ADD CONSTRAINT "User_Class_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Class" ADD CONSTRAINT "User_Class_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id_classe") ON DELETE CASCADE ON UPDATE CASCADE;
