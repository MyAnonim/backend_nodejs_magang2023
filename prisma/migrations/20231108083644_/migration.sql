-- CreateTable
CREATE TABLE `Users` (
    `id` INTEGER NOT NULL,
    `username` VARCHAR(50) NOT NULL,
    `password` VARCHAR(10) NOT NULL,
    `token` VARCHAR(255) NULL,
    `nama` VARCHAR(100) NOT NULL,
    `jabatan` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `Users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Dblocker` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nomor_seri` VARCHAR(60) NOT NULL,
    `area_name` VARCHAR(100) NOT NULL,
    `ip_addr` VARCHAR(15) NOT NULL,
    `latitude` VARCHAR(191) NOT NULL,
    `longitude` VARCHAR(191) NOT NULL,
    `createdAt` DATE NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `users_id` INTEGER NOT NULL,
    `nama_user` VARCHAR(100) NOT NULL,
    `dblocker_id` INTEGER NOT NULL,
    `area_name` VARCHAR(100) NOT NULL,
    `rc_state` ENUM('on', 'off', 'disabled') NOT NULL DEFAULT 'disabled',
    `gps_state` ENUM('on', 'off', 'disabled') NOT NULL DEFAULT 'disabled',
    `temp` DECIMAL(65, 30) NULL,

    INDEX `Log_timestamp_idx`(`timestamp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Log` ADD CONSTRAINT `Log_users_id_fkey` FOREIGN KEY (`users_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Log` ADD CONSTRAINT `Log_dblocker_id_fkey` FOREIGN KEY (`dblocker_id`) REFERENCES `Dblocker`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
