import { MigrationInterface, QueryRunner } from "typeorm";
import { NRDocument, NRStage, NRUser, NRWorkflow } from "../entity";

export class MockData1566509183698 implements MigrationInterface {
    WORKFLOW_NAME = "Opinion Articles";
    DOCUMENT_NAME = "404 Ethics Not Found";

    public async up(queryRunner: QueryRunner): Promise<any> {
        let userRepository = queryRunner.manager.getRepository(NRUser);
        let documentRepository = queryRunner.manager.getRepository(NRDocument);
        let workflowRepository = queryRunner.manager.getRepository(NRWorkflow);
        let stageRepository = queryRunner.manager.getRepository(NRStage);

        let user = userRepository.create();
        user.userName = "tcruise";
        user.email = "connor.kuhn@utah.edu";
        user.firstName = "Tom";
        user.lastName = "Cruise";
        user = await userRepository.save(user);

        let workflow = workflowRepository.create();
        workflow.name = this.WORKFLOW_NAME;
        workflow.creator = user;
        workflow.description = "Management of opinion articles and similar.";

        await workflowRepository.save(workflow);

        let stage1 = stageRepository.create();
        stage1.name = "Draft";
        stage1.creator = user;
        stage1.description = "Rough draft composition stage.";
        stage1.sequenceId = 0;
        stage1.workflow = workflow;

        let stage2 = stageRepository.create();
        stage2.name = "Primary Edit";
        stage2.creator = user;
        stage2.description = "Primary edit by the copy desk";
        stage2.sequenceId = 1;
        stage2.workflow = workflow;

        let stage3 = stageRepository.create();
        stage3.name = "Final Edit";
        stage3.creator = user;
        stage3.description = "Final edit by the executive editor.";
        stage3.sequenceId = 2;
        stage3.workflow = workflow;

        await stageRepository.save([stage1, stage2, stage3]);

        let document = documentRepository.create();
        document.name = this.DOCUMENT_NAME;
        document.googleDocId = "1xVk90N6JoZxSCkzgFI4zRIdNCQVj_WRb3sxpV0cKj-8";
        document.creator = user;
        document.description = "An article on the ethics of the 404 page.";

        document.stage = stage1;
        document.workflow = workflow;

        await documentRepository.save(document);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
    }
}
