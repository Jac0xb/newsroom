import {MigrationInterface, QueryRunner} from "typeorm";

export class baseline1554776864690 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("CREATE TABLE `stage` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(256) NOT NULL, `creator` varchar(256) NULL, `workflowId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `workflow` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(256) NOT NULL, `creator` varchar(256) NULL, `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, `lastUpdated` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, UNIQUE INDEX `IDX_8ec5afd3566bb368910c59f441` (`name`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `document` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(256) NOT NULL, `workflowId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `stage` ADD CONSTRAINT `FK_e18a9821b299eb1b2f102d8ae30` FOREIGN KEY (`workflowId`) REFERENCES `workflow`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `document` ADD CONSTRAINT `FK_f0270894fffab34fa2ee331ff8e` FOREIGN KEY (`workflowId`) REFERENCES `workflow`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `document` DROP FOREIGN KEY `FK_f0270894fffab34fa2ee331ff8e`");
        await queryRunner.query("ALTER TABLE `stage` DROP FOREIGN KEY `FK_e18a9821b299eb1b2f102d8ae30`");
        await queryRunner.query("DROP TABLE `document`");
        await queryRunner.query("DROP INDEX `IDX_8ec5afd3566bb368910c59f441` ON `workflow`");
        await queryRunner.query("DROP TABLE `workflow`");
        await queryRunner.query("DROP TABLE `stage`");
    }

}
