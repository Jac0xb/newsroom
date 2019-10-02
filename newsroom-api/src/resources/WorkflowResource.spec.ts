import express from "express";
import request, { Response } from "supertest";
import { Connection, getRepository, Repository } from "typeorm";
import App from "../app";

import { DBConstants, NRRole, NRStage, NRUser, NRWorkflow, NRDocument } from "../entity";

// TODO:
//   - Test validators.
//   - Verify creator.
//   - Fix 413 for 1 workflow, 5 stages, 2 documents in each stage?

// Globals used by all tests.
let app: express.Express;
let conn: Connection;
let user: NRUser;
let wfRep: Repository<NRWorkflow>;
let stRep: Repository<NRStage>;
let dcRep: Repository<NRDocument>;
let usrRep: Repository<NRUser>;
let rlRep: Repository<NRRole>;

// Name prefixes used for test verification.
const WF_NAME = "TEST_WORKFLOW_";
const WF_DESC = "TEST_WF_DESC_";
const ST_NAME = "TEST_STAGE_";
const ST_DESC = "TEST_STAGE_DESC_";
const DC_NAME = "TEST_DOC_";
const DC_DESC = "TEST_DOC_DESC_";

beforeAll(async (done) => {
    // Configure without oauth, and no Google Document creation.
    app = await App.configure(false, false);

    // Can't have two active connections to the DB, so just use
    // the one made by the app.
    conn = App.getDBConnection();

    // DB connections for different objects.
    wfRep = getRepository(NRWorkflow);
    stRep = getRepository(NRStage);
    dcRep = getRepository(NRDocument);
    usrRep = getRepository(NRUser);
    rlRep = getRepository(NRRole);

    done();
});

beforeEach(async (done) => {
    // Clear the database, this also restarts sequences.
    await conn.synchronize(true);

    // Insert a user for fake oauth, note that this user
    // will always have ID 1.
    user = new NRUser();
    user.firstName = "Tom";
    user.lastName = "Cruise";
    user.userName = "tcruise";
    user.email = "connor.kuhn@utah.edu";
    await usrRep.save(user);

    done();
});

// TODO:
//   Test CREATE permissions valid and invalid.
//   Test permissions returned properly with workflow object.
describe("POST /workflows", () => {
    it("Test creating a workflow.", async () => {
        // Verify:
        //  - Response status is 200 OK for the created workflow.
        //  - Returned name and description is correct for
        //    the created workflow.

        // Create 1 workflow with READ permissions.
        await createWorkflowsVerifyResp(1, "READ", 200, 0, 0);
    });
});

// TODO:
//   Test permissions returned properly with workflow object.
describe("GET /workflows", () => {
    it("Test getting all workflows.", async () => {
        // Verify:
        //  - Response status is 200 OK for each created workflow.
        //  - Returned name and description is correct for
        //    each created workflow.
        //  - GET for all workflows returns a 200 OK.
        //  - We get all 'wfNum' created workflows back.
        //  - Each response matches the responses for the created workflows.
        //  - Each ID aligns correctly with the created workflows.
        const wfNum = 5;

        // Create 'wfNum' workflows with READ permissions.
        const ret = await createWorkflowsVerifyResp(wfNum, "READ", 200, 0, 0);
        const wfs: NRWorkflow[] = ret.get("wfs");
        const wfResps: NRWorkflow[] = ret.get("wfResps");
        const resps: Response[] = ret.get("resps");

        // Get all workflows.
        const resp = await request(app)
                            .get("/api/workflows")
                            .set("User-Id", `${user.id}`);
        expect(resp.status).toEqual(200);
        expect(resp.body.length).toEqual(wfNum);

        for (let i = 0; i < resp.body.length; i++) {
            await verifyWorkflowResp(resp.body[i], wfResps[i], resp, 200, true);
        }
    });
});

// TODO:
//   Test permissions returned properly with workflow object.
describe("GET /workflows/:wid", () => {
    it("Test getting a single workflow.", async () => {
        // Verify:
        //  - Response status is 200 OK for each created workflow.
        //  - Returned name and description is correct for
        //    each created workflow.
        //  - GET for each workflows returns a 200 OK.
        //  - The response matches the workflow we created.
        const wfNum = 5;

        // Create 'wfNum' workflows with READ permissions.
        const ret = await createWorkflowsVerifyResp(wfNum, "READ", 200, 0, 0);
        const wfs: NRWorkflow[] = ret.get("wfs");
        const wfResps: NRWorkflow[] = ret.get("wfResps");
        const resps: Response[] = ret.get("resps");

        // Get each specific workflow.
        for (let i = 0; i < wfs.length; i++) {
            const resp = await request(app)
                                .get(`/api/workflows/${wfResps[i].id}`)
                                .set("User-Id", `${user.id}`);

            await verifyWorkflowResp(resp.body, wfResps[i], resp, 200, true);
        }
    });
});

// TODO:
//   Test permissions returned properly with workflow object.
//   Test updating a workflow when one doesn't have permissions.
describe("PUT /workflows/:wid", () => {
    it("Test updating a handful of workflows with permissions.", async () => {
        // Verify:
        //  - Response status is 200 OK for each created workflow.
        //  - Returned name and description is correct for
        //    each created workflow.
        //  - Updating each workflow works correctly.
        //  - Updating a workflow by ID only updates the given workflow,
        //    others remain the same.
        const wfNum = 5;

        // Create 'wfNum' workflows with WRITE permissions.
        const ret = await createWorkflowsVerifyResp(wfNum, "WRITE", 200, 0, 0);
        const wfs: NRWorkflow[] = ret.get("wfs");
        const wfResps: NRWorkflow[] = ret.get("wfResps");
        const resps: Response[] = ret.get("resps");

        // Update each specific workflow.
        for (let i = 0; i < wfResps.length; i++) {
            wfResps[i].name = `UPDATE_NAME_${i}`;
            wfResps[i].description = `UPDATE_DESC_${i}`;

            const resp = await request(app)
                                .put(`/api/workflows/${wfResps[i].id}`)
                                .send(wfResps[i])
                                .set("User-Id", `${user.id}`);

            await verifyWorkflowResp(resp.body, wfResps[i], resp, 200, true);

            // Verify only the right workflow changed in the DB.
            for (const wf of wfResps) {
                const wfdb = await wfRep.findOne({ where: { id: wf.id }});
                expect(wf.name).toEqual(wfdb.name);
                expect(wf.description).toEqual(wfdb.description);
            }
        }
    });

    it("Test updating a workflow without permissions.", async () => {
        // Verify:
        //  - Response status is 200 OK for each created workflow.
        //  - Returned name and description is correct for
        //    each created workflow.
        //  - We get a 403 due to lack of permissions to update the workflow.

        // Create 1 workflow with READ permissions.
        const ret = await createWorkflowsVerifyResp(1, "READ", 200, 0, 0);
        const wfs: NRWorkflow[] = ret.get("wfs");
        const wfResps: NRWorkflow[] = ret.get("wfResps");
        const resps: Response[] = ret.get("resps");

        wfResps[0].name = `UPDATE_NAME_${0}`;
        wfResps[0].description = `UPDATE_DESC_${0}`;

        const resp = await request(app)
                       .put(`/api/workflows/${wfResps[0].id}`)
                       .send(wfResps[0])
                       .set("User-Id", `${user.id}`);

        expect(resp.status).toEqual(403);
    });
});

// TODO:
//   Test workflow deletion when it's stages contain documents.
describe("DELETE /workflows/:wid", () => {
    it("Test deleting a workflow WITH permissions, no stages or documents.", async () => {
        // Verify:
        //  - Response status is 200 OK for each created workflow.
        //  - Returned name and description is correct for
        //    each created workflow.
        //  - The workflow is no longer present in the DB.
        const wfNum = 1;

        // Create 'wfNum' workflows with WRITE permissions.
        const ret = await createWorkflowsVerifyResp(wfNum, "WRITE", 200, 0, 0);
        const wfs: NRWorkflow[] = ret.get("wfs");
        const wfResps: NRWorkflow[] = ret.get("wfResps");
        const resps: Response[] = ret.get("resps");

        const resp = await request(app)
                            .delete(`/api/workflows/${wfResps[0].id}`)
                            .set("User-Id", `${user.id}`);
        expect(resp.status).toEqual(200);

        // Verify it no longer exists in the DB.
        const wfdb = await wfRep.findOne({ where: { id: wfResps[0].id }});
        expect(wfdb).toEqual(undefined);
    });

    it("Test deleting a workflow WITHOUT permissions, no stages or documents.", async () => {
        // Verify:
        //  - Response status is 200 OK for each created workflow.
        //  - Returned name and description is correct for
        //    each created workflow.
        //  - The workflow is still present in the DB.
        const wfNum = 1;

        // Create 'wfNum' workflows with READ permissions.
        const ret = await createWorkflowsVerifyResp(wfNum, "READ", 200, 0, 0);
        const wfs: NRWorkflow[] = ret.get("wfs");
        const wfResps: NRWorkflow[] = ret.get("wfResps");
        const resps: Response[] = ret.get("resps");

        const resp = await request(app)
                            .delete(`/api/workflows/${wfResps[0].id}`)
                            .set("User-Id", `${user.id}`);
        expect(resp.status).toEqual(403);

        // Verify it still exists in the DB.
        const wfdb = await wfRep.findOne({ where: { id: wfResps[0].id }});
        expect(wfdb.id).toEqual(wfResps[0].id);
    });

    it("Test deleting a workflow WITH permissions and stages, no documents.", async () => {
        // Verify:
        //  - Response status is 200 OK for each created workflow.
        //  - Returned name and description is correct for
        //    each created workflow.
        //  - The workflow is no longer present in the DB.
        //  - Each stage is no longer present in the DB.
        const wfNum = 1;

        // Create 'wfNum' workflows with WRITE permissions.
        const ret = await createWorkflowsVerifyResp(wfNum, "WRITE", 200, 5, 0);
        const wfs: NRWorkflow[] = ret.get("wfs");
        const wfResps: NRWorkflow[] = ret.get("wfResps");
        const resps: Response[] = ret.get("resps");

        const resp = await request(app)
                            .delete(`/api/workflows/${wfResps[0].id}`)
                            .set("User-Id", `${user.id}`);
        expect(resp.status).toEqual(200);

        // Verify it no longer exists in the DB.
        const wfdb = await wfRep.findOne({ where: { id: wfResps[0].id }});
        expect(wfdb).toEqual(undefined);

        // Verify that the stages no longer exist.
        for (let stage of wfResps[0].stages) {
            const stdb = await stRep.findOne({ where: { id: stage.id }});
            expect(stdb).toEqual(undefined);
        }
    });

    it("Test deleting a workflow WITH permissions, stages, and documents.", async () => {
        // Verify:
        //  - Response status is 200 OK for each created workflow.
        //  - Returned name and description is correct for
        //    each created workflow.
        //  - The workflow is no longer present in the DB.
        //  - Each stage is no longer present in the DB.
        //  - Each document is still present in the DB.
        const wfNum = 1;

        // Create 'wfNum' workflows with WRITE permissions.
        const ret = await createWorkflowsVerifyResp(wfNum, "WRITE", 200, 5, 1);
        const wfs: NRWorkflow[] = ret.get("wfs");
        const wfResps: NRWorkflow[] = ret.get("wfResps");
        const resps: Response[] = ret.get("resps");

        const resp = await request(app)
                            .delete(`/api/workflows/${wfResps[0].id}`)
                            .set("User-Id", `${user.id}`);
        expect(resp.status).toEqual(200);

        // Verify it no longer exists in the DB.
        const wfdb = await wfRep.findOne({ where: { id: wfResps[0].id }});
        expect(wfdb).toEqual(undefined);

        // Verify that the stages no longer exist.
        for (let stage of wfResps[0].stages) {
            const stdb = await stRep.findOne({ where: { id: stage.id }});
            expect(stdb).toEqual(undefined);

            // Verify that the documents do exist, and their relationships are NULL.
            for (let doc of stage.documents) {
                const dcdb = await dcRep.findOne({ where: { id: doc.id }});
                expect(dcdb.id).toEqual(doc.id);

                // TODO: Undefined because relationships aren't 'eager'.
                expect(dcdb.workflow).toEqual(undefined);
                expect(dcdb.stage).toEqual(undefined);
            }
        }
    });
});

describe("POST /workflows/:wid/stages", () => {
    it("Test appending a stage to empty workflows.", async () => {
        // Verify:
        //  - Response status is 200 OK for each created workflow.
        //  - Returned name and description is correct for
        //    each created workflow.
        //  - Appending a stage to the workflow returns 200 OK.
        //  - The stage information is correct in the DB.
        const wfNum = 2;

        // Create 'wfNum' workflows with WRITE permissions.
        const ret = await createWorkflowsVerifyResp(wfNum, "WRITE", 200, 0, 0);
        const wfs: NRWorkflow[] = ret.get("wfs");
        const wfResps: NRWorkflow[] = ret.get("wfResps");
        const resps: Response[] = ret.get("resps");

        for (const wf of wfResps) {
            // Append a stage.
            const st = new NRStage();
            st.name = ST_NAME + '0';
            st.name = ST_DESC + '0';
            st.workflow = wf;

            const resp = await request(app)
                                .post(`/api/workflows/${wf.id}/stages`)
                                .send(st)
                                .set("User-Id", `${user.id}`);
            expect(resp.status).toEqual(200);

            // Verify stages in the DB.
            const stdb = await stRep.findOne({ where: { id: resp.body.id }});
            expect(stdb.sequenceId).toEqual(1);
        }
    });

    it("Test appending a stage to workflows that already have stages.", async () => {
        // Verify:
        //  - Response status is 200 OK for each created workflow.
        //  - Returned name and description is correct for
        //    each created workflow.
        //  - Appending a stage to the workflow returns 200 OK.
        //  - The stage information is correct in the DB.
        const wfNum = 2;
        const stNum = 2;
        const dcNum = 2;

        // Create 'wfNum' workflows with WRITE permissions.
        const ret = await createWorkflowsVerifyResp(wfNum, "WRITE", 200, stNum, dcNum);
        const wfs: NRWorkflow[] = ret.get("wfs");
        const wfResps: NRWorkflow[] = ret.get("wfResps");
        const resps: Response[] = ret.get("resps");

        for (const wf of wfResps) {
            // Append multiple stages.
            for (let i = 0; i < stNum; i++) {
                const st = new NRStage();
                st.name = ST_NAME + `${stNum + i + 1}`;
                st.name = ST_NAME + `${stNum + i + 1}`;
                st.workflow = wf;

                const resp = await request(app)
                                    .post(`/api/workflows/${wf.id}/stages`)
                                    .send(st)
                                    .set("User-Id", `${user.id}`);
                expect(resp.status).toEqual(200);

                // Track the stage we got as a response.
                wf.stages.push(resp.body);

                // Verify stages in the DB.
                const stdb = await stRep.findOne({ where: { id: resp.body.id }});
                expect(stdb.sequenceId).toEqual(stNum + i + 1);
            }
        }

        // Verify that documents stay in the right stages.
        for (const wf of wfResps) {
            for (const st of wf.stages) {
                if (st.documents === undefined) {
                    continue;
                }

                for (const doc of st.documents) {
                    const dcdb = await dcRep.findOne({ where: { id: doc.id }});

                    const stageID = await dcRep
                        .createQueryBuilder(DBConstants.DOCU_TABLE)
                        .select(`${DBConstants.DOCU_TABLE}.stageId`, "val")
                        .where(`${DBConstants.DOCU_TABLE}.id = :did`, {did: dcdb.id})
                        .getRawOne();

                    expect(stageID.val).toEqual(doc.stage.id);
                }
            }
        }
    });
});

// TODO:
describe("GET :wid/stages", () => {
    it("Test getting all stages for a specific workflow.", async () => {
        // Verify:
        //  - Response status is 200 OK for each created workflow.
        //  - Returned name and description is correct for
        //    each created workflow.
        //  - The response shows each the correct stages for different workflow.
        const wfNum = 5;

        // Create 'wfNum' workflows with WRITE permissions.
        const ret = await createWorkflowsVerifyResp(wfNum, "WRITE", 200, 3, 0);
        const wfs: NRWorkflow[] = ret.get("wfs");
        const wfResps: NRWorkflow[] = ret.get("wfResps");
        const resps: Response[] = ret.get("resps");

        // Get each specific workflow.
        for (let i = 0; i < wfs.length; i++) {
            const resp = await request(app)
                                .get(`/api/workflows/${wfResps[i].id}/stages`)
                                .set("User-Id", `${user.id}`);
            
            expect(resp.status).toEqual(200);
            const stages = resp.body;

            for (let j = 0; j < stages.length; j++) {
                expect(stages[j].id).toEqual(wfResps[i].stages[j].id)
            }
        }
    });
});

// TODO:
//     Verify that everything still works even when moving stages.
describe("GET :wid/stages/:sid", () => {
    it("Test getting a specific stage from a workflow.", async () => {
        // Verify:
        //  - Response status is 200 OK for each created workflow.
        //  - Returned name and description is correct for
        //    each created workflow.
        //  - The response has the correct stage for each stage in different workflows.
        const wfNum = 5;

        // Create 'wfNum' workflows with WRITE permissions.
        const ret = await createWorkflowsVerifyResp(wfNum, "WRITE", 200, 3, 0);
        const wfs: NRWorkflow[] = ret.get("wfs");
        const wfResps: NRWorkflow[] = ret.get("wfResps");
        const resps: Response[] = ret.get("resps");

        // Get each specific workflow.
        for (let i = 0; i < wfs.length; i++) {
            const stages = wfResps[i].stages;

            for (let j = 0; j < stages.length; j++) {
                const resp = await request(app)
                                .get(`/api/workflows/${wfResps[i].id}/stages/${stages[j].id}`)
                                .set("User-Id", `${user.id}`);
                expect(resp.status).toEqual(200);
                const stage = resp.body;
                
                expect(stage.id).toEqual(stages[j].id)
            }
        }
    });
});

// TODO:
//     Verify that everything still works even when moving stages.
describe("POST :wid/stages/:pos", () => {
    it("Test adding a stage at a position to an empty workflow.", async () => {
        // Verify:
        //  - Response status is 200 OK for each created workflow.
        //  - Returned name and description is correct for
        //    each created workflow.
        //  - The stage sequence is correct in the response, and in theDB.
        const wfNum = 1;
        const stNum = 0;

        // Create 'wfNum' workflows with WRITE permissions.
        const ret = await createWorkflowsVerifyResp(wfNum, "WRITE", 200, stNum, 0);
        const wfs: NRWorkflow[] = ret.get("wfs");
        const wfResps: NRWorkflow[] = ret.get("wfResps");
        const resps: Response[] = ret.get("resps");

        // Add the stage.
        const wf = wfResps[0];
        const st = new NRStage();
        st.name = ST_NAME + `${stNum}`;
        st.name = ST_NAME + `${stNum}`;
        st.workflow = wf;

        // The position to add at.
        const pos = 0;

        // Make/verify the request.
        const resp = await request(app)
                              .post(`/api/workflows/${wf.id}/stages/${pos}`)
                              .send(st)
                              .set("User-Id", `${user.id}`);
        expect(resp.status).toEqual(200);

        // Verify presence in the DB.
        const stage = resp.body;
        const stdb = await stRep.findOne({ where: { id: stage.id }});
        const wfID  = await stRep
                        .createQueryBuilder(DBConstants.STGE_TABLE)
                        .select(`${DBConstants.STGE_TABLE}.workflowId`, "val")
                        .where(`${DBConstants.STGE_TABLE}.id = :sid`, {sid: stdb.id})
                        .getRawOne()

        expect(wfID.val).toEqual(wf.id)
        expect(stdb.id).toEqual(stage.id);
        expect(stdb.sequenceId).toEqual(pos);
    });

    it("Test adding a stage in the middle of a workflow.", async () => {
        // Verify:
        //  - Response status is 200 OK for each created workflow.
        //  - Returned name and description is correct for
        //    each created workflow.
        const wfNum = 2;
        const stNum = 3;

        // Create 'wfNum' workflows with WRITE permissions.
        const ret = await createWorkflowsVerifyResp(wfNum, "WRITE", 200, stNum, 0);
        const wfs: NRWorkflow[] = ret.get("wfs");
        const wfResps: NRWorkflow[] = ret.get("wfResps");
        const resps: Response[] = ret.get("resps");

        // Add the stage.
        const wf = wfResps[0];
        const st = new NRStage();
        st.name = ST_NAME + `${stNum + 1}`;
        st.name = ST_NAME + `${stNum + 1}`;
        st.workflow = wf;

        // The position to add at.
        const pos = 2;

        // Make/verify the request.
        const resp = await request(app)
                              .post(`/api/workflows/${wf.id}/stages/${pos}`)
                              .send(st)
                              .set("User-Id", `${user.id}`);
        expect(resp.status).toEqual(200);

        // Verify presence in the DB.
        const stage = resp.body;
        const stdb = await stRep.findOne({ where: { id: stage.id }});
        const wfID  = await stRep
                        .createQueryBuilder(DBConstants.STGE_TABLE)
                        .select(`${DBConstants.STGE_TABLE}.workflowId`, "val")
                        .where(`${DBConstants.STGE_TABLE}.id = :sid`, {sid: stdb.id})
                        .getRawOne()

        expect(wfID.val).toEqual(wf.id)
        expect(stdb.id).toEqual(stage.id);
        expect(stdb.sequenceId).toEqual(pos);
    });

    it("Test adding a stage to the beginning of a workflow.", async () => {
        // Verify:
        //  - Response status is 200 OK for each created workflow.
        //  - Returned name and description is correct for
        //    each created workflow.
        const wfNum = 2;
        const stNum = 3;

        // Create 'wfNum' workflows with WRITE permissions.
        const ret = await createWorkflowsVerifyResp(wfNum, "WRITE", 200, stNum, 0);
        const wfs: NRWorkflow[] = ret.get("wfs");
        const wfResps: NRWorkflow[] = ret.get("wfResps");
        const resps: Response[] = ret.get("resps");

        // Add the stage.
        const wf = wfResps[0];
        const st = new NRStage();
        st.name = ST_NAME + `${stNum + 1}`;
        st.name = ST_NAME + `${stNum + 1}`;
        st.workflow = wf;

        // The position to add at.
        const pos = 0;

        // Make/verify the request.
        const resp = await request(app)
                              .post(`/api/workflows/${wf.id}/stages/${pos}`)
                              .send(st)
                              .set("User-Id", `${user.id}`);
        expect(resp.status).toEqual(200);

        // Verify presence in the DB.
        const stage = resp.body;
        const stdb = await stRep.findOne({ where: { id: stage.id }});
        const wfID  = await stRep
                        .createQueryBuilder(DBConstants.STGE_TABLE)
                        .select(`${DBConstants.STGE_TABLE}.workflowId`, "val")
                        .where(`${DBConstants.STGE_TABLE}.id = :sid`, {sid: stdb.id})
                        .getRawOne()

        expect(wfID.val).toEqual(wf.id)
        expect(stdb.id).toEqual(stage.id);
        expect(stdb.sequenceId).toEqual(pos);
    });

    it("Test adding a stage to the end of a workflow.", async () => {
        // Verify:
        //  - Response status is 200 OK for each created workflow.
        //  - Returned name and description is correct for
        //    each created workflow.
        const wfNum = 2;
        const stNum = 3;

        // Create 'wfNum' workflows with WRITE permissions.
        const ret = await createWorkflowsVerifyResp(wfNum, "WRITE", 200, stNum, 0);
        const wfs: NRWorkflow[] = ret.get("wfs");
        const wfResps: NRWorkflow[] = ret.get("wfResps");
        const resps: Response[] = ret.get("resps");

        // Add the stage.
        const wf = wfResps[0];
        const st = new NRStage();
        st.name = ST_NAME + `${stNum + 1}`;
        st.name = ST_NAME + `${stNum + 1}`;
        st.workflow = wf;

        // The position to add at.
        const pos = stNum + 1;

        // Make/verify the request.
        const resp = await request(app)
                              .post(`/api/workflows/${wf.id}/stages/${pos}`)
                              .send(st)
                              .set("User-Id", `${user.id}`);
        expect(resp.status).toEqual(200);

        // Verify presence in the DB.
        const stage = resp.body;
        const stdb = await stRep.findOne({ where: { id: stage.id }});
        const wfID  = await stRep
                        .createQueryBuilder(DBConstants.STGE_TABLE)
                        .select(`${DBConstants.STGE_TABLE}.workflowId`, "val")
                        .where(`${DBConstants.STGE_TABLE}.id = :sid`, {sid: stdb.id})
                        .getRawOne()

        expect(wfID.val).toEqual(wf.id)
        expect(stdb.id).toEqual(stage.id);
        expect(stdb.sequenceId).toEqual(pos);
    });
});

// TODO:
describe("DELETE :wid/stages/:sid", () => {
    it("Test deleting stages from a workflow.", async () => {
        // Verify:
        //  - Response status is 200 OK for each created workflow.
        //  - Returned name and description is correct for
        //    each created workflow.
        const wfNum = 2;
        const stNum = 3;

        // Create 'wfNum' workflows with WRITE permissions.
        const ret = await createWorkflowsVerifyResp(wfNum, "WRITE", 200, stNum, 0);
        const wfs: NRWorkflow[] = ret.get("wfs");
        const wfResps: NRWorkflow[] = ret.get("wfResps");
        const resps: Response[] = ret.get("resps");

        // Get each specific workflow.
        for (let i = 0; i < wfResps.length; i++) {
            const stages = wfResps[i].stages;

            for (let j = 0; j < stages.length; j++) {
                const delStage = stages[j];
                const resp = await request(app)
                                .delete(`/api/workflows/${wfResps[i].id}/stages/${delStage.id}`)
                                .set("User-Id", `${user.id}`);
                expect(resp.status).toEqual(200);

                // Verify the DB.
                const allStages = await stRep
                                    .createQueryBuilder(DBConstants.STGE_TABLE)
                                    .where("stage.workflowId = :id", {id: wfResps[i].id})
                                    .getMany();

                // Count should go down, account for zero indexing.
                expect(allStages.length).toEqual(stages.length - (j + 1));
                const stdb = await stRep.findOne({ where: { id: delStage.id }});
                expect(stdb).toEqual(undefined);
            }
        }
    });

    it("Test deleting stage from the beginning of a workflow.", async () => {
        // Verify:
        //  - Response status is 200 OK for each created workflow.
        //  - Returned name and description is correct for
        //    each created workflow.
        const wfNum = 2;
        const stNum = 3;

        // Create 'wfNum' workflows with WRITE permissions.
        const ret = await createWorkflowsVerifyResp(wfNum, "WRITE", 200, stNum, 0);
        const wfs: NRWorkflow[] = ret.get("wfs");
        const wfResps: NRWorkflow[] = ret.get("wfResps");
        const resps: Response[] = ret.get("resps");

        // Get each specific workflow.
        for (let i = 0; i < wfResps.length; i++) {
            const stages = wfResps[i].stages;
            const delStage = stages[0];
            const resp = await request(app)
                            .delete(`/api/workflows/${wfResps[i].id}/stages/${delStage.id}`)
                            .set("User-Id", `${user.id}`);
            expect(resp.status).toEqual(200);

            // Verify the DB.
            const allStages = await stRep
                                .createQueryBuilder(DBConstants.STGE_TABLE)
                                .where("stage.workflowId = :id", {id: wfResps[i].id})
                                .getMany();

            // Count should go down, account for zero indexing.
            expect(allStages.length).toEqual(stages.length - 1);
            const stdb = await stRep.findOne({ where: { id: delStage.id }});
            expect(stdb).toEqual(undefined);
        }
    });

    it("Test deleting stage from the middle of a workflow.", async () => {
        // Verify:
        //  - Response status is 200 OK for each created workflow.
        //  - Returned name and description is correct for
        //    each created workflow.
        const wfNum = 2;
        const stNum = 3;

        // Create 'wfNum' workflows with WRITE permissions.
        const ret = await createWorkflowsVerifyResp(wfNum, "WRITE", 200, stNum, 0);
        const wfs: NRWorkflow[] = ret.get("wfs");
        const wfResps: NRWorkflow[] = ret.get("wfResps");
        const resps: Response[] = ret.get("resps");

        // Get each specific workflow.
        for (let i = 0; i < wfResps.length; i++) {
            const stages = wfResps[i].stages;
            const delStage = stages[1];
            const resp = await request(app)
                            .delete(`/api/workflows/${wfResps[i].id}/stages/${delStage.id}`)
                            .set("User-Id", `${user.id}`);
            expect(resp.status).toEqual(200);

            // Verify the DB.
            const allStages = await stRep
                                .createQueryBuilder(DBConstants.STGE_TABLE)
                                .where("stage.workflowId = :id", {id: wfResps[i].id})
                                .getMany();

            // Count should go down, account for zero indexing.
            expect(allStages.length).toEqual(stages.length - 1);
            const stdb = await stRep.findOne({ where: { id: delStage.id }});
            expect(stdb).toEqual(undefined);
        }
    });

    it("Test deleting stage from the end of a workflow.", async () => {
        // Verify:
        //  - Response status is 200 OK for each created workflow.
        //  - Returned name and description is correct for
        //    each created workflow.
        const wfNum = 2;
        const stNum = 3;

        // Create 'wfNum' workflows with WRITE permissions.
        const ret = await createWorkflowsVerifyResp(wfNum, "WRITE", 200, stNum, 0);
        const wfs: NRWorkflow[] = ret.get("wfs");
        const wfResps: NRWorkflow[] = ret.get("wfResps");
        const resps: Response[] = ret.get("resps");

        // Get each specific workflow.
        for (let i = 0; i < wfResps.length; i++) {
            const stages = wfResps[i].stages;
            const delStage = stages[stNum - 1];
            const resp = await request(app)
                            .delete(`/api/workflows/${wfResps[i].id}/stages/${delStage.id}`)
                            .set("User-Id", `${user.id}`);
            expect(resp.status).toEqual(200);

            // Verify the DB.
            const allStages = await stRep
                                .createQueryBuilder(DBConstants.STGE_TABLE)
                                .where("stage.workflowId = :id", {id: wfResps[i].id})
                                .getMany();

            // Count should go down, account for zero indexing.
            expect(allStages.length).toEqual(stages.length - 1);
            const stdb = await stRep.findOne({ where: { id: delStage.id }});
            expect(stdb).toEqual(undefined);
        }
    });
});

// TODO:
//   This request asks for 'wid' but doesn't use it????????
describe("PUT /:wid/stages/:sid", () => {
    it("Test updating stages in different workflows.", async () => {
        // Verify:
        //  - Response status is 200 OK for each created workflow.
        //  - Returned name and description is correct for
        //    each created workflow.
        const wfNum = 3;
        const stNum = 3;

        // Create 'wfNum' workflows with WRITE permissions.
        const ret = await createWorkflowsVerifyResp(wfNum, "WRITE", 200, stNum, 0);
        const wfs: NRWorkflow[] = ret.get("wfs");
        const wfResps: NRWorkflow[] = ret.get("wfResps");
        const resps: Response[] = ret.get("resps");

        // Get each specific workflow.
        for (let i = 0; i < wfs.length; i++) {
            const stages = wfResps[i].stages;

            for (let j = 0; j < stages.length; j++) {
                const stage = stages[j];
                stage.name = `UPDATED_NAME_${j}`;
                stage.description = `UPDATED_DESC_${j}`;

                const resp = await request(app)
                                .put(`/api/workflows/${wfResps[i].id}/stages/${stage.id}`)
                                .send(stage)
                                .set("User-Id", `${user.id}`);
                expect(resp.status).toEqual(200);
                const sr = resp.body;
                expect(sr.id).toEqual(stage.id);
                expect(sr.name).toEqual(stage.name);
                expect(sr.description).toEqual(stage.description);

                const stdb = await stRep.findOne({ where: { id: stage.id }});
                expect(stdb.id).toEqual(stage.id);
                expect(stdb.name).toEqual(stage.name);
                expect(stdb.description).toEqual(stage.description);

                const wf = wfResps[i];
                const wfID  = await stRep
                        .createQueryBuilder(DBConstants.STGE_TABLE)
                        .select(`${DBConstants.STGE_TABLE}.workflowId`, "val")
                        .where(`${DBConstants.STGE_TABLE}.id = :sid`, {sid: stdb.id})
                        .getRawOne()

                expect(wfID.val).toEqual(wf.id)
            }
        }
    });
});

/**
 * Create 'num' number of workflows with 'perm' permissions, verify that each
 * POST has 'status' response.
 *
 * num: The number of workflows to create.
 * perm: The permissions to give on each workflow.
 * status: The status to verify for each response.
 * user: The user to give the permissions to.
 * stages: The number of stages each workflow should have.
 * docs: The number of documents each stage should have.
 * return: A Map<string, object> with keys:
 *      'wfs': The NRWorkflow objects created to send.
 *      'wfResps': The NRWorkflow objects returned from the POST.
 *      'resps': The raw Response to each POST.
 */
async function createWorkflowsVerifyResp(num: number, perm: string, status: number, 
                                         stages: number, docs: number) {
    const wfs: NRWorkflow[] = [];
    const wfResps: NRWorkflow[] = [];
    const resps: Response[] = [];

    // Create 'num' number of workflows.
    for (let i = 0; i < num; i++) {
        const wf = new NRWorkflow();
        wf.name = WF_NAME + `${i}`;
        wf.description = WF_DESC + `${i}`;
        wfs.push(wf);

        const resp = await request(app)
                            .post("/api/workflows")
                            .send(wf)
                            .set("User-Id", `${user.id}`);

        await verifyWorkflowResp(wf, resp.body, resp, status, false);
        resps.push(resp);
        wfResps.push(resp.body);

        // Create a group to formulate permissions.
        const res = await addUserToGroup("TEST_GROUP_0", user, 200);
        const role: NRRole = res.get("role");

        // Add 'perm' permissions between the group and workflow.
        await setWFPermForGroup(role, resp.body, perm, 200);
    }

    // Create 'stages' number of stages for each workflow. 
    for (let i = 0; i < num; i++) {
        wfResps[i].stages = [];
        for (let j = 0; j < stages; j++) {
            let st = new NRStage();
            st.name = ST_NAME + `${wfResps[i].name}_${j}`;
            st.description = ST_DESC + `${wfResps[i].name}_${j}`;

            const resp = await request(app)
                                .post(`/api/workflows/${wfResps[i].id}/stages`)
                                .send(st)
                                .set("User-Id", `${user.id}`);
            expect(resp.status).toEqual(200);
            st = resp.body;
            st.documents = [];

            // Create 'docs' number of documents for each stage.
            for (let k = 0; k < docs; k++) {
                const dc = new NRDocument();
                dc.name = DC_NAME + `${k}`;
                dc.description = DC_DESC + `${k}`;
                dc.workflow = wfResps[i];
                dc.stage = st;

                const dresp = await request(app)
                                      .post(`/api/documents/`)
                                      .send(dc)
                                      .set("User-Id", `${user.id}`);
                expect(dresp.status).toEqual(200);

                st.documents.push(dresp.body);
            }

            // Update what is returned so it has stages.
            wfResps[i].stages.push(st);
        }
    }

    const ret = new Map<string, any>();
    ret.set("wfs", wfs);
    ret.set("wfResps", wfResps);
    ret.set("resps", resps);

    return ret;
}

/**
 * Create a group and add the given user to it.
 *
 * If the group already exists, the user will simply be added to the group.
 * If the user doesn't exist, it will be created.
 *
 * groupName: The name for the group to create.
 * user: The user to add to the created group.
 * status: The status that adding the user to the group is
 *         expected to return.
 */
async function addUserToGroup(groupName: string, currUser: NRUser, status: number) {
    let role: NRRole;
    let dbUser: NRUser;

    // See if the group exists, or create it.
    try {
        role = await rlRep.findOneOrFail({ where: { name: groupName }});
    } catch (err) {
        role = new NRRole();
        role.name = groupName;

        role = await rlRep.save(role);
    }

    // See if the user exists, or create it.
    try {
        dbUser = await usrRep.findOneOrFail({ where: { name: currUser.userName }});
    } catch (err) {
        dbUser = await usrRep.save(currUser);
    }

    // Add the user to the group.
    const resp = await request(app)
                        .put(`/api/users/${dbUser.id}/role/${role.id}`)
                        .set("User-Id", `${currUser.id}`);
    expect(resp.status).toEqual(status);

    const ret = new Map<string, any>();
    ret.set("user", dbUser);
    ret.set("role", role);

    return ret;
}

/**
 * Set the permissions for a group and a workflow.
 *
 * If the group doesn't exist, it will be created.
 * The workflow must exist already.
 *
 * role: The role to give the permissions to.
 * wf: The workflow to set the permissions on.
 * perm: The permission to give.
 * status: The status that adding the user to the group is
 *         expected to return.
 */
async function setWFPermForGroup(role: NRRole, wf: NRWorkflow, perm: string, status: number) {
    // See if the group exists, or create it.
    try {
        role = await rlRep.findOneOrFail({ where: { name: role.name }});
    } catch (err) {
        role = new NRRole();
        role.name = role.name;

        role = await rlRep.save(role);
    }

    // WRITE = 1, READ = 0.
    const resPerm = (perm === "WRITE") ? 1 : 0;

    // Add the user to the group.
    const resp = await request(app)
                        .put(`/api/roles/${role.id}/workflow/${wf.id}`)
                        .send({access: resPerm})
                        .set("User-Id", `${user.id}`);
    expect(resp.status).toEqual(status);
}

/**
 * Validate different aspects of workflows and responses based
 * on passed parameters.
 *
 * wf1: The first workflow to be used in the comparison.
 * wf2: The second workflow to be used in the comparison, this
 *      workflow is queried from the DB so this has to be the one
 *      given in the response.
 * resp: The raw Response object.
 * status: The status expected on above, or null if validation should be skipped.
 * ids: Whether or not to verify IDs between wf1 and wf2.
 */
async function verifyWorkflowResp(wf1: NRWorkflow,
                                  wf2: NRWorkflow,
                                  resp: Response,
                                  status: number,
                                  ids: boolean) {
    if (status !== null) {
        // Verify the response status.
        expect(resp.status).toEqual(status);
    }

    // Verify the response.
    expect(wf1.name).toEqual(wf2.name);
    expect(wf1.description).toEqual(wf2.description);

    // Verify the DB.
    const wfdb = await wfRep.findOne({ where: { id: wf2.id }});
    expect(wf1.name).toEqual(wfdb.name);
    expect(wf2.name).toEqual(wfdb.name);
    expect(wf1.description).toEqual(wfdb.description);
    expect(wf2.description).toEqual(wfdb.description);

    if (ids) {
        expect(wf1.id).toEqual(wf2.id);
    }
}
