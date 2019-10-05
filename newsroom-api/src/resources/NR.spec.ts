import express from "express";
import { Guid } from "guid-typescript";
import request, { Response } from "supertest";
import { Connection, getRepository, Repository } from "typeorm";

import App from "../app";
import { DBConstants, NRDocument, NRRole,
         NRStage, NRUser, NRWorkflow, NRWFUSPermission } from "../entity";
import e from "express";

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

    // Insert a user for fake oauth, note that this user will always have ID 1.
    user = new NRUser();
    user.firstName = "Tom";
    user.lastName = "Cruise";
    user.userName = "tcruise";
    user.email = "connor.kuhn@utah.edu";
    await usrRep.save(user);

    done();
});

// TODO:
//   Test CREATE permissions.
describe("POST /workflows", () => {
    it("Test creating a single workflow.", async () => {
        const wfNum = 1;
        const wfs = createWorkflowObject(wfNum, "READ");
        await requestWFGetResponse(wfs, 200);
    });

    it("Test creating 5 workflows with different permissions.", async () => {
        const wfNum = 5;
        const wfs = createWorkflowObject(wfNum, "RAND");
        await requestWFGetResponse(wfs, 200);
    });

    it("Test creating workflows when specifying no permissions.", async () => {
        const wfNum = 2;
        const wfs = createWorkflowObject(wfNum, null);
        await requestWFGetResponse(wfs, 200);
    });
});

describe("GET /workflows", () => {
    it("Test getting all workflows with no stages.", async () => {
        const wfNum = 5;

        const wfs = createWorkflowObject(wfNum, "RAND");
        const wfrs = await requestWFGetResponse(wfs, 200);

        const resp = await request(app)
                           .get("/api/workflows")
                           .set("User-Id", `${user.id}`);
        expect(resp.status).toEqual(200);
        expect(resp.body).toHaveLength(wfNum);

        for (let i = 0; i < resp.body.length; i++) {
            await verifyWFResp(wfrs[i], resp.body[i]);
        }
    });

    it("Test getting all workflows with stages.", async () => {
        const wfNum = 3;
        const stNum = 3;

        const wfs = createWorkflowObject(wfNum, "WRITE");
        const wfrs = await requestWFGetResponse(wfs, 200);

        // Add stages.
        for (let i = 0; i < wfNum; i++) {
            wfs[i] = await addStagesToWF(wfrs[i], stNum, 200, "RAND");
        }

        const resp = await request(app)
                           .get("/api/workflows")
                           .set("User-Id", `${user.id}`);
        expect(resp.status).toEqual(200);
        expect(resp.body.length).toEqual(wfNum);

        for (let i = 0; i < wfNum; i++) {
            await verifyWFResp(wfrs[i], resp.body[i]);

            expect(resp.body[i].stages).toBeUndefined();
        }
    });
});

describe("GET /workflows/:wid", () => {
    it("Test getting a single workflow with no stages.", async () => {
        const wfNum = 5;

        const wfs = createWorkflowObject(wfNum, "WRITE");
        const wfrs = await requestWFGetResponse(wfs, 200);

        for (let i = 0; i < wfrs.length; i++) {
            const resp = await request(app)
                               .get(`/api/workflows/${wfrs[i].id}`)
                               .set("User-Id", `${user.id}`);
            expect(resp.status).toEqual(200);

            await verifyWFResp(wfrs[i], resp.body);
        }
    });

    it("Test getting a single workflow with stages.", async () => {
        const wfNum = 3;
        const stNum = 3;

        const wfs = createWorkflowObject(wfNum, "WRITE");
        const wfrs = await requestWFGetResponse(wfs, 200);

        // Add stages.
        for (let i = 0; i < wfNum; i++) {
            wfs[i] = await addStagesToWF(wfrs[i], stNum, 200, "RAND");
        }

        for (let i = 0; i < wfs.length; i++) {
            const resp = await request(app)
                               .get(`/api/workflows/${wfrs[i].id}`)
                               .set("User-Id", `${user.id}`);
            expect(resp.status).toEqual(200);

            await verifyWFResp(wfrs[i], resp.body);

            const wf = resp.body;
            expect(wf.stages).not.toBeUndefined();
            
            // Ensure we get all of the right stages back with the right permissions.
            for (let j = 0; j < stNum; j++) {
                expect(wf.stages[j]).not.toBeUndefined();
                expect(wf.stages[j].id).toEqual(wfs[i].stages[j].id);
                expect(wf.stages[j].permission).not.toBeUndefined();
                expect(wf.stages[j].permission).toEqual(wfs[i].stages[j].permission);
            }
        }
    });
});

describe("PUT /workflows/:wid", () => {
    it("Test updating differnt workflows, all with permissions.", async () => {
        const wfNum = 3;

        const wfs = createWorkflowObject(wfNum, "WRITE");
        const wfrs = await requestWFGetResponse(wfs, 200);

        for (let i = 0; i < wfrs.length; i++) {
            wfrs[i].name = `UPDATE_NAME_${i}`;
            wfrs[i].description = `UPDATE_DESC_${i}`;

            const resp = await request(app)
                                .put(`/api/workflows/${wfrs[i].id}`)
                                .send(wfrs[i])
                                .set("User-Id", `${user.id}`);
            expect(resp.status).toEqual(200);
            await verifyWFResp(wfrs[i], resp.body);
        }
    });

    it("Test updating workflows without permissions.", async () => {
        const wfNum = 3;

        const wfs = createWorkflowObject(wfNum, "READ");
        const wfrs = await requestWFGetResponse(wfs, 200);

        for (let i = 0; i < wfrs.length; i++) {
            // Create a copy to ensure original doesn't change later.
            const wfrcp = { ...wfrs[i] };
            wfrcp.name = `UPDATE_NAME_${i}`;
            wfrcp.description = `UPDATE_DESC_${i}`;

            const resp = await request(app)
                                .put(`/api/workflows/${wfrcp.id}`)
                                .send(wfrcp)
                                .set("User-Id", `${user.id}`);
            expect(resp.status).toEqual(403);

            // Verify the original WF didn't change.
            await verifyWFResp(wfs[i], wfrs[i]);
        }
    });
});

// TODO:
//   Test workflow deletion when it's stages contain documents.
describe("DELETE /workflows/:wid", () => {
    it("Test deleting workflows WITH permissions, no stages or documents.", async () => {
        const wfNum = 3;

        const wfs = createWorkflowObject(wfNum, "WRITE");
        const wfrs = await requestWFGetResponse(wfs, 200);

        for (let i = 0; i < wfrs.length; i++) {
            const resp = await request(app)
                               .delete(`/api/workflows/${wfrs[i].id}`)
                               .set("User-Id", `${user.id}`);
            expect(resp.status).toEqual(200);

            const wfdb = await wfRep.findOne({ where: { id: wfrs[i].id }});
            expect(wfdb).toBeUndefined();
        }
    });

    it("Test deleting workflows WITHOUT permissions, no stages or documents.", async () => {
        const wfNum = 3;

        const wfs = createWorkflowObject(wfNum, "READ");
        const wfrs = await requestWFGetResponse(wfs, 200);

        for (let i = 0; i < wfrs.length; i++) {
            const resp = await request(app)
                               .delete(`/api/workflows/${wfrs[i].id}`)
                               .set("User-Id", `${user.id}`);
            expect(resp.status).toEqual(403);

            // Verify it didn't actually get deleted.
            const wfdb = await wfRep.findOne({ where: { id: wfrs[i].id }});
            expect(wfdb).not.toBeUndefined();
            await verifyWFResp(wfs[i], wfrs[i]);
        }
    });

    it("Test deleting workflows WITH permissions and stages, no documents.", async () => {
        const wfNum = 3;
        const stNum = 3;

        const wfs = createWorkflowObject(wfNum, "WRITE");
        const wfrs = await requestWFGetResponse(wfs, 200);

        // Add stages.
        for (let i = 0; i < wfNum; i++) {
            wfs[i] = await addStagesToWF(wfrs[i], stNum, 200, "RAND");
        }

        for (let i = 0; i < wfrs.length; i++) {
            const resp = await request(app)
                               .delete(`/api/workflows/${wfrs[i].id}`)
                               .set("User-Id", `${user.id}`);
            expect(resp.status).toEqual(200);

            const wfdb = await wfRep.findOne({ where: { id: wfrs[i].id }});
            expect(wfdb).toBeUndefined();

            // Verify that the stages no longer exist.
            for (let stage of wfrs[i].stages) {
                const stdb = await stRep.findOne({ where: { id: stage.id }});
                expect(stdb).toBeUndefined();
            }
        }
    });

    it("Test deleting workflows WITHOUT permissions or documents, but with stages.", async () => {
        const wfNum = 3;
        const stNum = 3;

        // Start with WRITE so we can add stages.
        const wfs = createWorkflowObject(wfNum, "WRITE");
        const wfrs = await requestWFGetResponse(wfs, 200);

        // Add stages.
        for (let i = 0; i < wfNum; i++) {
            wfs[i] = await addStagesToWF(wfrs[i], stNum, 200, "RAND");
        }

        for (let i = 0; i < wfrs.length; i++) {
            // Change permissions to READ for testing.
            await changeWFPerm(wfrs[i], "READ");
            
            const resp = await request(app)
                               .delete(`/api/workflows/${wfrs[i].id}`)
                               .set("User-Id", `${user.id}`);
            expect(resp.status).toEqual(403);

            const wfdb = await wfRep.findOne({ where: { id: wfrs[i].id }});
            expect(wfdb).not.toBeUndefined();
            await verifyWFResp(wfs[i], wfrs[i]);

            // Verify that the stages no longer exist.
            for (let stage of wfrs[i].stages) {
                const stdb = await stRep.findOne({ where: { id: stage.id }});
                expect(stdb).not.toBeUndefined();

                await verifyStageInWF(stage, wfrs[i]);
            }
        }
    });

    it("Test deleting a workflow WITH permissions, stages, and documents.", async () => {
        const wfNum = 3;
        const stNum = 3;
        const dcNum = 1;

        const wfs = createWorkflowObject(wfNum, "WRITE");
        const wfrs = await requestWFGetResponse(wfs, 200);

        // Add stages.
        for (let i = 0; i < wfNum; i++) {
            wfs[i] = await addStagesToWF(wfrs[i], stNum, 200, "WRITE");

            // Add documents to stages.
            for (let j = 0; j < stNum; j++) {
                await addDocsToStage(wfs[i].stages[j], dcNum, 200);
            }
        }

        for (let i = 0; i < wfrs.length; i++) {
            const resp = await request(app)
                               .delete(`/api/workflows/${wfrs[i].id}`)
                               .set("User-Id", `${user.id}`);
            expect(resp.status).toEqual(200);

            const wfdb = await wfRep.findOne({ where: { id: wfrs[i].id }});
            expect(wfdb).toBeUndefined();

            // Verify that the stages no longer exist.
            for (let stage of wfrs[i].stages) {
                const stdb = await stRep.findOne({ where: { id: stage.id }});
                expect(stdb).toBeUndefined();

                // Verify that the documents do exist, and their relationships are NULL.
                for (let doc of stage.documents) {
                    const dcdb = await dcRep.findOne({ where: { id: doc.id }});
                    expect(dcdb.id).toEqual(doc.id);

                    expect(dcdb.workflow).toBeUndefined();
                    expect(dcdb.stage).toBeUndefined();
                }
            }
        }
    });
});

describe("POST /workflows/:wid/stages", () => {
    it("Test appending a stage to an empty workflow.", async () => {
        const wfNum = 3;

        const wfs = createWorkflowObject(wfNum, "WRITE");
        const wfrs = await requestWFGetResponse(wfs, 200);

        for (let i = 0; i < wfNum; i++) {
            const st = new NRStage();
            st.name = Guid.create().toString();
            st.description = st.name + "_DESC";
            st.workflow = wfrs[i];

            let priv;
            if (i === 1) {
                priv = DBConstants.READ;                
            } else if (i === 2) {
                priv = DBConstants.WRITE;
            } else {
                priv === undefined;
            }

            st.permission = priv;

            const resp = await request(app)
                                .post(`/api/workflows/${wfrs[i].id}/stages`)
                                .send(st)
                                .set("User-Id", `${user.id}`);
            expect(resp).not.toBeUndefined();
            expect(resp.status).toEqual(200);
            
            const str = resp.body;
            if (priv === undefined) {
                expect(str.permission).toEqual(DBConstants.READ);
            } else {
                expect(str.permission).toEqual(priv);
            }

            // Verify stages in the DB.
            const stdb = await stRep.findOne({ where: { id: resp.body.id }});
            expect(stdb).not.toBeUndefined();
            expect(stdb.sequenceId).toEqual(1);
        }
    });

    it("Test appending stages to workflows with stages.", async () => {
        const wfNum = 2;
        const stNum = 2;

        const wfs = createWorkflowObject(wfNum, "WRITE");
        const wfrs = await requestWFGetResponse(wfs, 200);

        for (const wf of wfrs) {
            wf.stages = [];
            for (let i = 0; i < stNum; i++) {
                const st = new NRStage();
                st.name = Guid.create().toString();
                st.description = st.name + "_DESC";
                st.workflow = wf;

                let priv;
                if (i === 1) {
                    priv = DBConstants.READ;                
                } else if (i === 2) {
                    priv = DBConstants.WRITE;
                } else {
                    priv === undefined;
                }

                st.permission = priv;

                const resp = await request(app)
                                    .post(`/api/workflows/${wf.id}/stages`)
                                    .send(st)
                                    .set("User-Id", `${user.id}`);
                expect(resp).not.toBeUndefined();
                expect(resp.status).toEqual(200);

                const str = resp.body

                if (priv === undefined) {
                    expect(str.permission).toEqual(DBConstants.READ);
                } else {
                    expect(str.permission).toEqual(priv);
                }

                const stdb = await stRep.findOne({ where: { id: str.id }});
                expect(stdb).not.toBeUndefined();
                expect(stdb.sequenceId).toEqual(i + 1);

                wf.stages.push(await addDocsToStage(str, 1, 200));
            }
        }

        // Verify that documents stay in the right stages.
        for (const wf of wfrs) {
            for (const st of wf.stages) {
                for (const doc of st.documents) {
                    const dcdb = await dcRep.findOne({ where: { id: doc.id }});

                    const stageID = await dcRep.createQueryBuilder(DBConstants.DOCU_TABLE)
                                               .select(`${DBConstants.DOCU_TABLE}.stageId`, "val")
                                               .where(`${DBConstants.DOCU_TABLE}.id = :did`, {did: dcdb.id})
                                               .getRawOne();

                    expect(stageID.val).toEqual(doc.stage.id);
                }
            }
        }
    });

    it("Test appending stages with no permissions.", async () => {
        const wfNum = 2;

        const wfs = createWorkflowObject(wfNum, "READ");
        const wfrs = await requestWFGetResponse(wfs, 200);

        for (const wf of wfrs) {
            const st = new NRStage();
            st.name = Guid.create().toString();
            st.description = st.name + "_DESC";
            st.workflow = wf;

            const resp = await request(app)
                                .post(`/api/workflows/${wf.id}/stages`)
                                .send(st)
                                .set("User-Id", `${user.id}`);
            expect(resp).not.toBeUndefined();
            expect(resp.status).toEqual(403);
        }
    });
});

// TODO:
describe("GET :wid/stages", () => {
    it("Test getting all stages for a specific workflow.", async () => {
        const wfNum = 5;
        const stNum = 5;

        const wfs = createWorkflowObject(wfNum, "WRITE");
        const wfrs = await requestWFGetResponse(wfs, 200);

        for (let i = 0; i < wfNum; i++) {
            wfrs[i] = await addStagesToWF(wfrs[i], stNum, 200, "RAND");
        }

        for (const wf of wfrs) {
            const resp = await request(app)
                               .get(`/api/workflows/${wf.id}/stages`)
                               .set("User-Id", `${user.id}`);
            expect(resp).not.toBeUndefined();
            expect(resp.status).toEqual(200);

            const strs = resp.body;

            for (let i = 0; i < strs.length; i++) {
                await verifyStageInWF(strs[i], wf);
                expect(strs[i].permission).toEqual(wf.stages[i].permission);
            }
        }
    });
});

// TODO:
//     Verify that everything still works even when moving stages.
describe("GET :wid/stages/:sid", () => {
    it("Test getting a specific stage from a workflow.", async () => {
        const wfNum = 5;
        const stNum = 5;

        const wfs = createWorkflowObject(wfNum, "WRITE");
        const wfrs = await requestWFGetResponse(wfs, 200);

        for (let i = 0; i < wfNum; i++) {
            wfrs[i] = await addStagesToWF(wfrs[i], stNum, 200, "RAND");
        }

        for (let i = 0; i < wfrs.length; i++) {
            const stages = wfrs[i].stages;

            for (let j = 0; j < stages.length; j++) {
                const resp = await request(app)
                                .get(`/api/workflows/${wfrs[i].id}/stages/${stages[j].id}`)
                                .set("User-Id", `${user.id}`);
                expect(resp).not.toBeUndefined();
                expect(resp.status).toEqual(200);

                const st = resp.body;
                await verifyStageInWF(st, wfrs[i]);
                expect(st.permission).toEqual(wfrs[i].stages[j].permission);
            }
        }
    });
});

// TODO:
//     Verify that everything still works even when moving stages.
describe("POST :wid/stages/:pos", () => {
    it("Test adding a stage at a position to an empty workflow.", async () => {
        const wfNum = 1;

        const wfs = createWorkflowObject(wfNum, "WRITE");
        const wfrs = await requestWFGetResponse(wfs, 200);

        const wf = wfrs[0];
        const st = new NRStage();
        st.name = Guid.create().toString();
        st.description = st.name + "_DESC";
        st.workflow = wf;

        // The position to add at.
        const pos = 0;
        const resp = await request(app)
                              .post(`/api/workflows/${wf.id}/stages/${pos}`)
                              .send(st)
                              .set("User-Id", `${user.id}`);
        expect(resp).not.toBeUndefined();
        expect(resp.status).toEqual(200);

        const str = resp.body;
        await verifyStageInWF(str, wf);

        const stdb = await stRep.findOne({ where: { id: str.id }});
        expect(stdb.sequenceId).toEqual(pos + 1);
        expect(str.sequenceId).toEqual(pos + 1);
        expect(str.permission).toEqual(DBConstants.READ);
    });

    it("Test adding a stage in the middle of a workflow.", async () => {
        const wfNum = 2;
        const stNum = 3;

        const wfs = createWorkflowObject(wfNum, "WRITE");
        const wfrs = await requestWFGetResponse(wfs, 200);

        for (let i = 0; i < wfNum; i++) {
            await addStagesToWF(wfrs[i], stNum, 200, "RAND");
            wfs[i].id = wfrs[i].id;
        }

        // Add stage to the middle.
        for (let i = 0; i < wfNum; i++) {
            const st = new NRStage();
            st.name = Guid.create().toString();
            st.description = st.name + "_NEW";
            st.workflow = wfs[i];

            // The position to add at.
            const pos = 2;
            const resp = await request(app)
                            .post(`/api/workflows/${wfs[i].id}/stages/${pos}`)
                            .send(st)
                            .set("User-Id", `${user.id}`);
            expect(resp).not.toBeUndefined();
            expect(resp.status).toEqual(200);

            const str = resp.body;
            wfrs[i].stages.splice(pos - 1, 0, str);
            expect(str.permission).toEqual(DBConstants.READ);
            expect(str.sequenceId).toEqual(pos);
            await verifyStageInWF(str, wfrs[i]);

            const wfdb = await wfRep.findOne(wfrs[i].id, { relations: ['stages'] })
            expect(wfdb).not.toBeUndefined();
            expect(wfdb.stages).not.toBeUndefined();

            wfdb.stages.sort((a: NRStage, b: NRStage) => a.sequenceId - b.sequenceId);

            for (let j = 0; j < wfdb.stages.length; j++) {
                expect(wfrs[i].stages[j].id).toEqual(wfdb.stages[j].id);
                expect(wfrs[i].stages[j].name).toEqual(wfdb.stages[j].name);
                expect(wfrs[i].stages[j].description).toEqual(wfdb.stages[j].description);

                // Haven't updated local sequenceId values, mock that here.
                if (j < pos) {
                    expect(wfrs[i].stages[j].sequenceId).toEqual(wfdb.stages[j].sequenceId);
                } else {
                    expect(wfrs[i].stages[j].sequenceId + 1).toEqual(wfdb.stages[j].sequenceId);
                }
            }
        }
    });

    it("Test adding a stage to the beginning of a workflow.", async () => {
        const wfNum = 2;
        const stNum = 3;

        const wfs = createWorkflowObject(wfNum, "WRITE");
        const wfrs = await requestWFGetResponse(wfs, 200);

        for (let i = 0; i < wfNum; i++) {
            await addStagesToWF(wfrs[i], stNum, 200, "RAND");
            wfs[i].id = wfrs[i].id;
        }

        // Add stage to the middle.
        for (let i = 0; i < wfNum; i++) {
            const st = new NRStage();
            st.name = Guid.create().toString();
            st.description = st.name + "_NEW";
            st.workflow = wfs[i];

            // The position to add at.
            const pos = 0;
            const resp = await request(app)
                            .post(`/api/workflows/${wfs[i].id}/stages/${pos}`)
                            .send(st)
                            .set("User-Id", `${user.id}`);
            expect(resp).not.toBeUndefined();
            expect(resp.status).toEqual(200);

            const str = resp.body;
            wfrs[i].stages.splice(pos, 0, str);
            expect(str.permission).toEqual(DBConstants.READ);
            expect(str.sequenceId).toEqual(pos + 1);
            await verifyStageInWF(str, wfrs[i]);

            const wfdb = await wfRep.findOne(wfrs[i].id, { relations: ['stages'] })
            expect(wfdb).not.toBeUndefined();
            expect(wfdb.stages).not.toBeUndefined();

            wfdb.stages.sort((a: NRStage, b: NRStage) => a.sequenceId - b.sequenceId);

            for (let j = 0; j < wfdb.stages.length; j++) {
                expect(wfrs[i].stages[j].id).toEqual(wfdb.stages[j].id);
                expect(wfrs[i].stages[j].name).toEqual(wfdb.stages[j].name);
                expect(wfrs[i].stages[j].description).toEqual(wfdb.stages[j].description);
               
                // Haven't updated local sequenceId values, mock that here.
                if (j === pos) {
                    expect(wfrs[i].stages[j].sequenceId).toEqual(wfdb.stages[j].sequenceId);
                } else {
                    expect(wfrs[i].stages[j].sequenceId + 1).toEqual(wfdb.stages[j].sequenceId);
                }
            }
        }
    });

    it("Test adding a stage to the end of a workflow.", async () => {
        const wfNum = 2;
        const stNum = 3;

        const wfs = createWorkflowObject(wfNum, "WRITE");
        const wfrs = await requestWFGetResponse(wfs, 200);

        for (let i = 0; i < wfNum; i++) {
            await addStagesToWF(wfrs[i], stNum, 200, "RAND");
            wfs[i].id = wfrs[i].id;
        }

        // Add stage to the middle.
        for (let i = 0; i < wfNum; i++) {
            const st = new NRStage();
            st.name = Guid.create().toString();
            st.description = st.name + "_NEW";
            st.workflow = wfs[i];

            // The position to add at.
            const pos = stNum + 1;
            const resp = await request(app)
                            .post(`/api/workflows/${wfs[i].id}/stages/${pos}`)
                            .send(st)
                            .set("User-Id", `${user.id}`);
            expect(resp).not.toBeUndefined();
            expect(resp.status).toEqual(200);

            const str = resp.body;
            wfrs[i].stages.splice(pos, 0, str);
            expect(str.permission).toEqual(DBConstants.READ);
            expect(str.sequenceId).toEqual(pos);
            await verifyStageInWF(str, wfrs[i]);

            const wfdb = await wfRep.findOne(wfrs[i].id, { relations: ['stages'] })
            expect(wfdb).not.toBeUndefined();
            expect(wfdb.stages).not.toBeUndefined();

            wfdb.stages.sort((a: NRStage, b: NRStage) => a.sequenceId - b.sequenceId);

            for (let j = 0; j < wfdb.stages.length; j++) {
                expect(wfrs[i].stages[j].id).toEqual(wfdb.stages[j].id);
                expect(wfrs[i].stages[j].name).toEqual(wfdb.stages[j].name);
                expect(wfrs[i].stages[j].description).toEqual(wfdb.stages[j].description);
                expect(wfrs[i].stages[j].sequenceId).toEqual(wfdb.stages[j].sequenceId);
            }
        }
    });
});

describe("DELETE :wid/stages/:sid", () => {
    it("Test deleting stages from a workflow.", async () => {
        const wfNum = 2;
        const stNum = 3;

        const wfs = createWorkflowObject(wfNum, "WRITE");
        const wfrs = await requestWFGetResponse(wfs, 200);

        for (let i = 0; i < wfNum; i++) {
            await addStagesToWF(wfrs[i], stNum, 200, "RAND");
            wfs[i].id = wfrs[i].id;
        }

        for (let i = 0; i < wfrs.length; i++) {
            const stages = wfrs[i].stages;

            for (let j = 0; j < stages.length; j++) {
                const delStage = stages[j];
                const resp = await request(app)
                                .delete(`/api/workflows/${wfrs[i].id}/stages/${delStage.id}`)
                                .set("User-Id", `${user.id}`);
                expect(resp).not.toBeUndefined();
                expect(resp.status).toEqual(200);

                const allStages = await stRep.find({ where: { workflow: wfrs[i] },
                                                     order: { 'sequenceId': 'ASC'} });
                expect(allStages.length).toEqual(stages.length - (j + 1));
                const stdb = await stRep.findOne({ where: { id: delStage.id }});
                expect(stdb).toBeUndefined();

                // Verify sequences of remaining stages.
                for (let k = 0; k < stages.length - (j + 1); k++) {
                    // 'stages[k]' is deleted from the DB, but still has the sequenceIds 
                    // we should have updated to in the DB.
                    expect(allStages[k].sequenceId).toEqual(k + 1);
                }
            }
        }
    });

    it("Test deleting stages from a workflow doesn't affect others.", async () => {
        const wfNum = 2;
        const stNum = 3;

        const wfs = createWorkflowObject(wfNum, "WRITE");
        const wfrs = await requestWFGetResponse(wfs, 200);

        for (let i = 0; i < wfNum; i++) {
            await addStagesToWF(wfrs[i], stNum, 200, "RAND");
            wfs[i].id = wfrs[i].id;
        }

        // Delete all stages from one workflow.
        let i = 0;
        let stages = wfrs[i].stages;
        for (let j = 0; j < stages.length; j++) {
            const delStage = stages[j];
            const resp = await request(app)
                            .delete(`/api/workflows/${wfrs[i].id}/stages/${delStage.id}`)
                            .set("User-Id", `${user.id}`);
            expect(resp).not.toBeUndefined();
            expect(resp.status).toEqual(200);

            const allStages = await stRep.find({ where: { workflow: wfrs[i] },
                                                    order: { 'sequenceId': 'ASC'} });
            expect(allStages.length).toEqual(stages.length - (j + 1));
            const stdb = await stRep.findOne({ where: { id: delStage.id }});
            expect(stdb).toBeUndefined();

            // Verify sequences of remaining stages.
            for (let k = 0; k < stages.length - (j + 1); k++) {
                // 'stages[k]' is deleted from the DB, but still has the sequenceIds 
                // we should have updated to in the DB.
                expect(allStages[k].sequenceId).toEqual(k + 1);
            }
        }

        // Verify all stages still present in the second workflow.
        i = 1;
        stages = wfrs[i].stages;
        const allStages = await stRep.find({ where: { workflow: wfrs[i] },
                                             order: { 'sequenceId': 'ASC'} });
        expect(allStages.length).toEqual(stages.length);

        for (let j = 0; j < stages.length; j++) {
            expect(allStages[j].sequenceId).toEqual(stages[j].sequenceId);
        }
    });

    it("Test deleting stage from workflow with only one stage.", async () => {
        const wfNum = 1;
        const stNum = 1;

        const wfs = createWorkflowObject(wfNum, "WRITE");
        const wfrs = await requestWFGetResponse(wfs, 200);

        for (let i = 0; i < wfNum; i++) {
            await addStagesToWF(wfrs[i], stNum, 200, "RAND");
            wfs[i].id = wfrs[i].id;
        }

        const resp = await request(app)
                           .delete(`/api/workflows/${wfrs[0].id}/stages/${wfrs[0].stages[0].id}`)
                           .set("User-Id", `${user.id}`);
        expect(resp).not.toBeUndefined();
        expect(resp.status).toEqual(200);

        const st = await stRep.find({ where: { workflow: wfrs[0] } });
        expect(st.length).toEqual(0);
    });

    it("Test deleting stages from the middle of a workflow.", async () => {
        const wfNum = 2;
        const stNum = 3;

        const wfs = createWorkflowObject(wfNum, "WRITE");
        const wfrs = await requestWFGetResponse(wfs, 200);

        for (let i = 0; i < wfNum; i++) {
            await addStagesToWF(wfrs[i], stNum, 200, "RAND");
            wfs[i].id = wfrs[i].id;
        }

        for (let i = 0; i < wfNum; i++) {
            let stages = wfrs[i].stages;
            const mid = Math.floor(stNum / 2)
            const delStage = stages[mid];

            const resp = await request(app)
                            .delete(`/api/workflows/${wfrs[i].id}/stages/${delStage.id}`)
                            .set("User-Id", `${user.id}`);
            expect(resp).not.toBeUndefined();
            expect(resp.status).toEqual(200);

            const allStages = await stRep.find({ where: { workflow: wfrs[i] },
                                                 order: { 'sequenceId': 'ASC'} });
            expect(allStages.length).toEqual(stages.length - 1);
            const stdb = await stRep.findOne({ where: { id: delStage.id }});
            expect(stdb).toBeUndefined();

            expect(allStages[0].sequenceId).toEqual(1);
            expect(allStages[1].sequenceId).toEqual(2);
        }
    });

    it("Test deleting stages from the end of a workflow.", async () => {
        const wfNum = 2;
        const stNum = 3;

        const wfs = createWorkflowObject(wfNum, "WRITE");
        const wfrs = await requestWFGetResponse(wfs, 200);

        for (let i = 0; i < wfNum; i++) {
            await addStagesToWF(wfrs[i], stNum, 200, "RAND");
            wfs[i].id = wfrs[i].id;
        }

        for (let i = 0; i < wfNum; i++) {
            let stages = wfrs[i].stages;
            const end = stNum - 1;
            const delStage = stages[end];

            const resp = await request(app)
                            .delete(`/api/workflows/${wfrs[i].id}/stages/${delStage.id}`)
                            .set("User-Id", `${user.id}`);
            expect(resp).not.toBeUndefined();
            expect(resp.status).toEqual(200);

            const allStages = await stRep.find({ where: { workflow: wfrs[i] },
                                                 order: { 'sequenceId': 'ASC'} });
            expect(allStages.length).toEqual(stages.length - 1);
            const stdb = await stRep.findOne({ where: { id: delStage.id }});
            expect(stdb).toBeUndefined();

            expect(allStages[0].sequenceId).toEqual(1);
            expect(allStages[1].sequenceId).toEqual(2);
        }
    });
});

// TODO:
describe("PUT /:wid/stages/:sid", () => {
    it("Test updating stages in different workflows.", async () => {
        const wfNum = 3;
        const stNum = 3;

        const wfs = createWorkflowObject(wfNum, "WRITE");
        const wfrs = await requestWFGetResponse(wfs, 200);

        for (let i = 0; i < wfNum; i++) {
            await addStagesToWF(wfrs[i], stNum, 200, "RAND");
            wfs[i].id = wfrs[i].id;
        }

        for (let i = 0; i < wfNum; i++) {
            for (let j = 0; j < stNum; j++) {
                const st = wfrs[i].stages[j];
                st.name = st.name + '_NEW'
                st.description = st.name + '_DESC';

                const resp = await request(app)
                                   .put(`/api/workflows/${wfrs[i].id}/stages/${st.id}`)
                                   .send(st)
                                   .set("User-Id", `${user.id}`);
                expect(resp).not.toBeUndefined();
                expect(resp.status).toEqual(200);

                const str = resp.body;
                await verifyStageInWF(str, wfrs[i]);
                expect(str.name).toEqual(st.name);
                expect(str.description).toEqual(st.description);
            }
       }
    });

    it("Test updating stages without permissions.", async () => {
        const wfNum = 3;
        const stNum = 3;

        const wfs = createWorkflowObject(wfNum, "WRITE");
        const wfrs = await requestWFGetResponse(wfs, 200);

        for (let i = 0; i < wfNum; i++) {
            await addStagesToWF(wfrs[i], stNum, 200, "RAND");
            wfs[i].id = wfrs[i].id;
        }


        for (let i = 0; i < wfNum; i++) {
            await changeWFPerm(wfrs[i], "READ");

            for (let j = 0; j < stNum; j++) {
                const st = wfrs[i].stages[j];
                const stcp = { ...st };
                stcp.name = st.name + '_NEW'
                stcp.description = st.name + '_DESC';
                
                const resp = await request(app)
                                   .put(`/api/workflows/${wfrs[i].id}/stages/${st.id}`)
                                   .send(stcp)
                                   .set("User-Id", `${user.id}`);
                expect(resp).not.toBeUndefined();
                expect(resp.status).toEqual(403);

                // Confirm no changes in DB.
                const stdb = await stRep.findOne(st.id);
                expect(stdb.name).toEqual(st.name);
                expect(stdb.description).toEqual(st.description);
            }
       }
    });
});

// DONE.
function createWorkflowObject(num: number, priv: string) {
    const wfs: NRWorkflow[] = [];

    for (let i = 0; i < num; i++) {
        const wf = new NRWorkflow();
        wf.name = Guid.create().toString();
        wf.description = wf.name + "_DESC";

        if (priv === "RAND") {
            wf.permission = i % 2;
        } else if (priv !== null) {
            wf.permission = (priv === "WRITE") ? 1 : 0;
        }

        wfs.push(wf);
    }

    return wfs;
}

// DONE.
async function requestWFGetResponse(wfs: NRWorkflow[], status: number) {
    const wfResps: NRWorkflow[] = [];

    for (const wf of wfs) {
        const resp = await request(app)
                           .post("/api/workflows")
                           .send(wf)
                           .set("User-Id", `${user.id}`);
        expect(resp.status).toEqual(status);

        if (status === 200) {
            await verifyWFResp(wf, resp.body);
        }

        wfResps.push(resp.body);
    }

    return wfResps;
}

// DONE.
async function verifyWFResp(wf: NRWorkflow, wfr: NRWorkflow) {
    const wfdb = await wfRep.findOneOrFail({ where: { id: wfr.id }});

    expect(wfr.name).not.toBeUndefined();
    expect(wf.name).toEqual(wfr.name);
    expect(wf.name).toEqual(wfdb.name);

    expect(wfr.description).not.toBeUndefined();
    expect(wf.description).toEqual(wfr.description);
    expect(wf.description).toEqual(wfdb.description);

    if (wf.permission === undefined) {
        expect(wfr.permission).toEqual(DBConstants.READ);
    } else {
        expect(wfr.permission).not.toBeUndefined();
        expect(wf.permission).toEqual(wfr.permission);
    }

    if (wf.id !== undefined) {
        expect(wfr.id).not.toBeUndefined();
        expect(wf.id).toEqual(wfr.id);
        expect(wfr.id).toEqual(wfdb.id);
    }
}

// DONE.
async function addStagesToWF(wf: NRWorkflow, numStages: number, status: number, perm: string) {
    if (wf.stages === undefined) {
        wf.stages = [];
    }

    for (let i = 0; i < numStages; i++) {
        const st = new NRStage();
        st.name = Guid.create().toString();
        st.description = st.name + "_DESC";

        if (perm === "RAND") {
            st.permission = i % 2;
        } else if (perm !== null) {
            st.permission = (perm === "WRITE") ? 1 : 0;
        }

        const resp = await request(app)
                           .post(`/api/workflows/${wf.id}/stages`)
                           .send(st)
                           .set("User-Id", `${user.id}`);
        expect(resp.status).toEqual(status);

        if (status === 200) {
            const str = resp.body;
            const stdb = await stRep.findOne({ where: { id: str.id }});
            expect(str.name).toEqual(st.name);
            expect(str.name).toEqual(stdb.name);
            expect(str.description).toEqual(st.description);
            expect(str.description).toEqual(stdb.description);
            expect(str.sequenceId).toEqual(i + 1);

            await verifyStageInWF(str, wf);
        }

        wf.stages.push(resp.body);
    }

    return wf;
}

// DONE.
async function verifyStageInWF(st: NRStage, wf: NRWorkflow) {
    const stwfid  = await stRep.createQueryBuilder(DBConstants.STGE_TABLE)
                               .select(`${DBConstants.STGE_TABLE}.workflowId`, "val")
                               .where(`${DBConstants.STGE_TABLE}.id = :sid`, {sid: st.id})
                               .getRawOne();
    expect(stwfid.val).toEqual(wf.id);

    // Not necessary, but doesn't hurt.
    const wfdb = await wfRep.findOne({ where: { id: stwfid.val }});
    const wfstgs = await stRep.createQueryBuilder(DBConstants.STGE_TABLE)
                              .where("stage.workflowId = :id", {id: wfdb.id})
                              .getMany();

    let present = false;
    for (const stge of wfstgs) {
        if (stge.id === st.id) {
            present = true;
            break;
        }
    }
    expect(present).toEqual(true);
}

// DONE.
async function changeWFPerm(wf: NRWorkflow, perm: string) {
    const priv = (perm === "WRITE") ? DBConstants.WRITE : DBConstants.READ;

    const resp = await request(app)
                       .put(`/api/users/${user.id}/perm/${wf.id}/${priv}`)
                       .set("User-Id", `${user.id}`);
    
    expect(resp.status).toEqual(200);
    expect(resp.body.access).toEqual(priv);
}

// DONE.
async function changeSTPerm(st: NRStage, perm: string) {
    const priv = (perm === "WRITE") ? 1 : 0;

    const resp = await request(app)
                       .put(`/api/users/${user.id}/perm/${st.id}/${priv}`)
                       .set("User-Id", `${user.id}`);
    
    expect(resp.status).toEqual(200);
    expect(resp.body.access).toEqual(priv);
}


async function addDocsToStage(st: NRStage, numDoc: number, status: number) {
    if (st.documents === undefined) {
        st.documents = [];
    }

    for (let i = 0; i < numDoc; i++) {
        const dc = new NRDocument();
        dc.name = Guid.create().toString();
        dc.description = dc.name + "_DESC";

        // Get stages workflow first.
        const stwf = await stRep.findOne(st.id, { relations: ['workflow']})
        const wfdb = stwf.workflow;
        dc.workflow = wfdb;
        dc.stage = st;

        const resp = await request(app)
                           .post(`/api/documents/`)
                           .send(dc)
                           .set("User-Id", `${user.id}`);
        expect(resp.status).toEqual(status);

        if (status === 200) {
            const dcr = resp.body;
            expect(dcr.name).toEqual(dc.name);
            expect(dcr.description).toEqual(dc.description);

            await verifyDocInStage(dcr, st);
        }
    }

    return st;
}

async function verifyDocInStage(dc: NRDocument, st: NRStage) {
    // Verify it is in the right stage.
    const dcstid  = await dcRep.createQueryBuilder(DBConstants.DOCU_TABLE)
                               .select(`${DBConstants.DOCU_TABLE}.stageId`, "val")
                               .where(`${DBConstants.DOCU_TABLE}.id = :did`, {did: dc.id})
                               .getRawOne();
    expect(dcstid.val).not.toBeUndefined();
    expect(dcstid.val).toEqual(st.id);
}

/**
 *
 */
async function createGroup(status: number) {
    const role = new NRRole();
    role.name = Guid.create().toString();

    const resp = await request(app)
                       .post(`/api/roles`)
                       .send(role)
                       .set("User-Id", `${user.id}`);
    expect(resp.status).toEqual(status);

    return resp.body;
}

/**
 *
 */
async function addUserToGroup(groupName: string, currUser: NRUser, status: number) {
    let role: NRRole;

    // See if the group exists, or create it.
    try {
        role = await rlRep.findOneOrFail({ where: { name: groupName }});
    } catch (err) {
        role = await createGroup(200);
    }

    // Add the user to the group.
    const resp = await request(app)
                        .put(`/api/users/${currUser.id}/role/${role.id}`)
                        .set("User-Id", `${currUser.id}`);
    expect(resp.status).toEqual(status);

    if (status === 200) {
        await verifyUserInGroup(resp.body, role);
    }

    return role;
}

/**
 *
 */
async function verifyUserInGroup(usr: NRUser, group: NRRole) {
    const rldb = await rlRep.find({
        relations: ["users"],
        where: { id: group.id },
    });

    // TODO: Test this query?
    expect(false).toEqual(true);
}

/**
 *
 */
async function setWFPermForGroup(role: NRRole, wf: NRWorkflow, perm: string, status: number) {
    // See if the group exists, or create it.
    try {
        role = await rlRep.findOneOrFail({ where: { name: role.name }});
    } catch (err) {
        role = await createGroup(200);
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
