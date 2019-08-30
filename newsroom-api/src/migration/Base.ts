import { MigrationInterface, QueryRunner } from "typeorm";

import { NRType } from "../entity/NRType";


// Baseline migration to run that should be present in any database.
export class NRTypeBase1515769694450 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<any> {
        let typeRepository = queryRunner.manager.getRepository(NRType);

        // NRType 'type' table is static data.
        let workRow = typeRepository.create();
        workRow.key = NRType.WRKF_KEY;
        workRow.value = NRType.WRKF_VAL;
        typeRepository.save(workRow);

        let stgeRow = typeRepository.create();
        stgeRow.key = NRType.STGE_KEY;
        stgeRow.value = NRType.STGE_VAL;
        typeRepository.save(stgeRow);

        let docuRow = typeRepository.create();
        docuRow.key = NRType.DOCU_KEY;
        docuRow.value = NRType.DOCU_VAL;
        typeRepository.save(docuRow);

        let roleRow = typeRepository.create();
        roleRow.key = NRType.ROLE_KEY;
        roleRow.value = NRType.ROLE_VAL;
        typeRepository.save(roleRow);

        let userRow = typeRepository.create();
        userRow.key = NRType.USER_KEY;
        userRow.value = NRType.USER_VAL;
        typeRepository.save(userRow);
    }

    async down(queryRunner: QueryRunner): Promise<any> { 
        await queryRunner.query(`DELETE FROM type`);
    }
}