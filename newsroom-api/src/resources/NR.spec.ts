import express from "express";
import { Guid } from "guid-typescript";
import request from "supertest";
import { Connection, getRepository, Repository } from "typeorm";

import App from "../app";
import { DBConstants, NRDocument, NRRole,
         NRStage, NRSTPermission, NRSTUSPermission, NRUser,
         NRWFPermission, NRWFUSPermission, NRWorkflow } from "../entity";
import { PermissionService } from "../services/PermissionService";

// TODO:
//   - Test validators.
//   - Verify creator, test CREATE permissions.
//   - Fix 413 for 1 workflow, 5 stages, 2 documents in each stage?

let app: express.Express;
let conn: Connection;

let usr: NRUser;
let usrRep: Repository<NRUser>;
let usrSeq: number;

let wfRep: Repository<NRWorkflow>;
let wfSeq: number;
let wfPRep: Repository<NRWFPermission>;
let wfPSeq: number;
let wfUSRep: Repository<NRWFUSPermission>;
let wfUSSeq: number;

let stRep: Repository<NRStage>;
let stSeq: number;
let stPRep: Repository<NRSTPermission>;
let stPSeq: number;
let stUSRep: Repository<NRSTUSPermission>;
let stUSSeq: number;

let dcRep: Repository<NRDocument>;
let dcSeq: number;

let rlRep: Repository<NRRole>;
let rlSeq: number;

let permServ: PermissionService;

beforeAll(async (done) => {
    // Configure without oauth, and no actual Google Document creation.
    app = await App.configure(false, false);

    // Can't have two active connections, steal from app.
    conn = App.getDBConnection();

    usrRep = getRepository(NRUser);

    wfRep = getRepository(NRWorkflow);
    wfPRep = getRepository(NRWFPermission);
    wfUSRep = getRepository(NRWFUSPermission);

    stRep = getRepository(NRStage);
    stPRep = getRepository(NRSTPermission);
    stUSRep = getRepository(NRSTUSPermission);

    dcRep = getRepository(NRDocument);

    rlRep = getRepository(NRRole);

    permServ = App.getPermService();

    done();
});

beforeEach(async (done) => {
    // Clear the database, this also restarts sequences.
    await conn.synchronize(true);

    // Database cleared, sequences restart at 1.
    usrSeq = 1;

    wfSeq = 1;
    wfPSeq = 1;
    wfUSSeq = 1;

    stSeq = 1;
    stPSeq = 1;
    stUSSeq = 1;

    dcSeq = 1;

    rlSeq = 1;

    // Insert a user for fake oauth, note that this user will always have ID 1.
    usr = new NRUser();
    usr.id = usrSeq;
    usrSeq++;
    usr.firstName = "Tom";
    usr.lastName = "Cruise";
    usr.userName = "tcruise";
    usr.email = "connor.kuhn@utah.edu";
    await usrRep.save(usr);

    done();
});

// ----------------------------------------------------------------------------------
// |                                 WORKFLOW TESTS                                 |
// ----------------------------------------------------------------------------------

describe("POST /api/workflows", () => {
    it("Test creating a single workflow.", async () => {
        // Verification already done once request is returned.
        await reqWFGetResp("RAND", 200);
    });

    it("Test creating 5 workflows with different permissions.", async () => {
        const wfNum = 5;

        // Verification already done once request is returned.
        await reqWFSGetResps(wfNum, "RAND", 200);
    });

    it("Test creating workflows when specifying no permissions.", async () => {
        const wfNum = 2;

        // Verification already done once request is returned.
        await reqWFSGetResps(wfNum, null, 200);
    });
});

describe("GET /api/workflows", () => {
    it("Test getting all workflows when none have stages.", async () => {
        const wfNum = 5;

        const wfs = await reqWFSGetResps(wfNum, "RAND", 200);
        const resp = await request(app)
                           .get("/api/workflows")
                           .set("User-Id", `${usr.id}`);

        expect(resp).not.toBeUndefined();
        expect(resp.status).toEqual(200);

        const wfrs = resp.body;
        expect(wfrs).toHaveLength(wfNum);

        // Shouldn't return stages, this is for dashboard view.
        await verifyWFResps(wfs, wfrs, false);
        await verifyWFSDB(wfs);
        await verifyWFSDB(wfrs);
    });

    it("Test getting all workflows with stages.", async () => {
        const wfNum = 3;
        const stNum = 3;

        let wfs = await reqWFSGetResps(wfNum, "WRITE", 200);

        // Don't verify stage documents, we haven't created any.
        // Returned stage permissions should match passed permissions on creation.
        wfs = await addStagesToWFS(wfs, stNum, 200, "RAND", "RAND", false, "ST");

        const resp = await request(app)
                           .get("/api/workflows")
                           .set("User-Id", `${usr.id}`);

        expect(resp).not.toBeUndefined();
        expect(resp.status).toEqual(200);

        const wfrs = resp.body;
        expect(wfrs).toHaveLength(wfNum);

        // Shouldn't return stages, this is for dashboard view.
        await verifyWFResps(wfs, wfrs, false);
        await verifyWFSDB(wfs);
        await verifyWFSDB(wfrs);

        // No stages are returned, but we still expect them to be correct in the DB.
        // Use the original WF.
        await verifyWFSSTSDB(wfs);
    });
});

describe("GET /api/workflows/:wid", () => {
    it("Test getting workflows with no stages.", async () => {
        const wfNum = 5;

        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);

        for (const wf of wfs) {
            const resp = await request(app)
                               .get(`/api/workflows/${wf.id}`)
                               .set("User-Id", `${usr.id}`);

            expect(resp).not.toBeUndefined();
            expect(resp.status).toEqual(200);

            const wfr: NRWorkflow = resp.body;

            // Stages comes back and empty array.
            expect(wfr.stages).toHaveLength(0);
            await verifyWFResp(wf, wfr, true);
            await verifyWFDB(wf);
        }
    });

    it("Test getting workflows with stages and write permissions.", async () => {
        const wfNum = 5;
        const stNum = 3;

        let wfs = await reqWFSGetResps(wfNum, "WRITE", 200);

        // Don't verify stage documents, we haven't created any.
        // Returned stage permissions should match passed permissions on creation.
        wfs = await addStagesToWFS(wfs, stNum, 200, "READ", "RAND", false, "ST");
        const wfsn = changeSTPermMatchWFS(wfs);

        for (let i = 0; i < wfNum; i++) {
            const wf = wfs[i];

            const resp = await request(app)
                               .get(`/api/workflows/${wf.id}`)
                               .set("User-Id", `${usr.id}`);

            expect(resp).not.toBeUndefined();
            expect(resp.status).toEqual(200);

            // We do get stages as a response here.
            const wfr: NRWorkflow = resp.body;
            await verifyWFResp(wf, wfr, true);

            // Can't verify the response against the database because returned permissions
            // are different.
            await verifyWFDB(wfsn[i]);

            // DB stages should match response stages.
            expect(wfr.stages).toHaveLength(stNum);
            await verifySTSDB(wfsn[i].stages, wfsn[i]);

            // No documents yet, and we expect stage permissions to match the workflow permissions.
            await verifySTResps(wf.stages, wfr.stages, wf, false, "WF");
        }
    });
});

describe("PUT /workflows/:wid", () => {
    it("Test updating workflows with permissions.", async () => {
        const wfNum = 3;

        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);

        for (let i = 0; i < wfs.length; i++) {
            wfs[i].name = `UPDATE_NAME_${i}`;
            wfs[i].description = `UPDATE_DESC_${i}`;

            const resp = await request(app)
                                .put(`/api/workflows/${wfs[i].id}`)
                                .send(wfs[i])
                                .set("User-Id", `${usr.id}`);

            expect(resp).not.toBeUndefined();
            expect(resp.status).toEqual(200);

            const wfr: NRWorkflow = resp.body;

            // Shouldn't return stages from this endpoint.
            await verifyWFResp(wfs[i], wfr, false);
            await verifyWFDB(wfs[i]);
        }
    });

    it("Test updating workflows doesn't affect stages.", async () => {
        const wfNum = 3;
        const stNum = 5;

        let wfs = await reqWFSGetResps(wfNum, "WRITE", 200);

        // Don't verify stage documents, we haven't created any.
        wfs = await addStagesToWFS(wfs, stNum, 200, "RAND", "RAND", false, "ST");

        for (let i = 0; i < wfs.length; i++) {
            wfs[i].name = `UPDATE_NAME_${i}`;
            wfs[i].description = `UPDATE_DESC_${i}`;

            const resp = await request(app)
                                .put(`/api/workflows/${wfs[i].id}`)
                                .send(wfs[i])
                                .set("User-Id", `${usr.id}`);

            expect(resp).not.toBeUndefined();
            expect(resp.status).toEqual(200);

            const wfr: NRWorkflow = resp.body;

            // Shouldn't return stages from this endpoint.
            await verifyWFResp(wfs[i], wfr, false);
            await verifyWFDB(wfs[i]);

            // No stage permissions returned for this endpoint.
            await verifySTSDB(wfs[i].stages, wfs[i]);
        }
    });

    it("Test updating workflows without permissions.", async () => {
        const wfNum = 10;

        const wfs = await reqWFSGetResps(wfNum, "READ", 200);

        // Change the permissions for one of them.
        wfs[1] = await changeWFPerm(wfs[1], "WRITE");

        for (let i = 0; i < wfs.length; i++) {
            // Create a copy to ensure original doesn't change later.
            const wfrcp = JSON.parse(JSON.stringify(wfs[i]));
            wfrcp.name = `UPDATE_NAME_${i}`;
            wfrcp.description = `UPDATE_DESC_${i}`;

            const resp = await request(app)
                               .put(`/api/workflows/${wfrcp.id}`)
                               .send(wfrcp)
                               .set("User-Id", `${usr.id}`);

            expect(resp).not.toBeUndefined();

            if (i !== 1) {
                expect(resp.status).toEqual(403);

                // Verify the original WF didn't change.
                // Pass the same argument twice as function checks DB.
                await verifyWFResp(wfs[i], wfs[i], false);
                await verifyWFDB(wfs[i]);
            } else {
                expect(resp.status).toEqual(200);

                const wfr: NRWorkflow = resp.body;
                await verifyWFResp(wfrcp, wfr, false);
                await verifyWFDB(wfrcp);
            }
        }
    });
});

describe("DELETE /workflows/:wid", () => {
    it("Test deleting workflows no relationships.", async () => {
        const wfNum = 10;

        const wfs = await reqWFSGetResps(wfNum, "RAND", 200);

        // Make sure at least one of them is READ.
        wfs[0] = await changeWFPerm(wfs[0], "READ");

        // Make sure at least one of them is WRITE.
        wfs[1] = await changeWFPerm(wfs[1], "READ");

        for (let i = 0; i < wfs.length; i++) {
            const resp = await request(app)
                               .delete(`/api/workflows/${wfs[i].id}`)
                               .set("User-Id", `${usr.id}`);
            expect(resp).not.toBeUndefined();

            const wfdb = await wfRep.findOne({ where: { id: wfs[i].id }});
            if ((i === 0) || (wfs[i].permission === DBConstants.READ)) {
                expect(resp.status).toEqual(403);

                expect(wfdb).toBeUndefined();
            } else {
                expect(wfdb).not.toBeUndefined();
            }
        }
    });

    // it("Test deleting workflows with permissions and no relationships.", async () => {
    //     const wfNum = 3;

    //     const wfs = createWF(wfNum, "READ");
    //     const wfrs = await reqWFGetResp(wfs, 200);

    //     for (let i = 0; i < wfrs.length; i++) {
    //         const resp = await request(app)
    //                            .delete(`/api/workflows/${wfrs[i].id}`)
    //                            .set("User-Id", `${user.id}`);
    //         expect(resp.status).toEqual(403);

    //         // Verify it didn't actually get deleted.
    //         const wfdb = await wfRep.findOne({ where: { id: wfrs[i].id }});
    //         expect(wfdb).not.toBeUndefined();
    //         await verifyWFResp(wfs[i], wfrs[i]);
    //     }
    // });

    // it("Test deleting workflows WITH permissions and stages, no documents.", async () => {
    //     const wfNum = 3;
    //     const stNum = 3;

    //     const wfs = createWF(wfNum, "WRITE");
    //     const wfrs = await reqWFGetResp(wfs, 200);

    //     for (let i = 0; i < wfNum; i++) {
    //         wfs[i] = await addStagesToWF(wfrs[i], stNum, 200, "RAND");
    //     }

    //     for (let i = 0; i < wfrs.length; i++) {
    //         const resp = await request(app)
    //                            .delete(`/api/workflows/${wfrs[i].id}`)
    //                            .set("User-Id", `${user.id}`);
    //         expect(resp.status).toEqual(200);

    //         const wfdb = await wfRep.findOne({ where: { id: wfrs[i].id }});
    //         expect(wfdb).toBeUndefined();

    //         // Verify that the stages no longer exist.
    //         for (let stage of wfrs[i].stages) {
    //             const stdb = await stRep.findOne({ where: { id: stage.id }});
    //             expect(stdb).toBeUndefined();
    //         }
    //     }
    // });

    // it("Test deleting workflows WITHOUT permissions or documents, but with stages.", async () => {
    //     const wfNum = 3;
    //     const stNum = 3;

    //     // Start with WRITE so we can add stages.
    //     const wfs = createWF(wfNum, "WRITE");
    //     const wfrs = await reqWFGetResp(wfs, 200);

    //     // Add stages.
    //     for (let i = 0; i < wfNum; i++) {
    //         wfs[i] = await addStagesToWF(wfrs[i], stNum, 200, "RAND");
    //     }

    //     for (let i = 0; i < wfrs.length; i++) {
    //         // Change permissions to READ for testing.
    //         await changeWFPerm(wfrs[i], "READ");

    //         const resp = await request(app)
    //                            .delete(`/api/workflows/${wfrs[i].id}`)
    //                            .set("User-Id", `${user.id}`);
    //         expect(resp.status).toEqual(403);

    //         const wfdb = await wfRep.findOne({ where: { id: wfrs[i].id }});
    //         expect(wfdb).not.toBeUndefined();
    //         await verifyWFResp(wfs[i], wfrs[i]);

    //         // Verify that the stages no longer exist.
    //         for (let stage of wfrs[i].stages) {
    //             const stdb = await stRep.findOne({ where: { id: stage.id }});
    //             expect(stdb).not.toBeUndefined();

    //             await verifySTInWF(stage, wfrs[i]);
    //         }
    //     }
    // });

    // it("Test deleting a workflow WITH permissions, stages, and documents.", async () => {
    //     const wfNum = 3;
    //     const stNum = 3;
    //     const dcNum = 1;

    //     const wfs = createWF(wfNum, "WRITE");
    //     const wfrs = await reqWFGetResp(wfs, 200);

    //     for (let i = 0; i < wfNum; i++) {
    //         wfs[i] = await addStagesToWF(wfrs[i], stNum, 200, "WRITE");

    //         for (let j = 0; j < stNum; j++) {
    //             await addDocsToStage(wfs[i].stages[j], dcNum, 200);
    //         }
    //     }

    //     for (let i = 0; i < wfrs.length; i++) {
    //         const resp = await request(app)
    //                            .delete(`/api/workflows/${wfrs[i].id}`)
    //                            .set("User-Id", `${user.id}`);
    //         expect(resp.status).toEqual(200);

    //         const wfdb = await wfRep.findOne({ where: { id: wfrs[i].id }});
    //         expect(wfdb).toBeUndefined();

    //         // Verify that the stages no longer exist.
    //         for (let stage of wfrs[i].stages) {
    //             const stdb = await stRep.findOne({ where: { id: stage.id }});
    //             expect(stdb).toBeUndefined();

    //             // Verify that the documents do exist, and their relationships are NULL.
    //             for (let doc of stage.documents) {
    //                 const dcdb = await dcRep.findOne({ where: { id: doc.id }});
    //                 expect(dcdb.id).toEqual(doc.id);

    //                 expect(dcdb.workflow).toBeUndefined();
    //                 expect(dcdb.stage).toBeUndefined();
    //             }
    //         }
    //     }
    // });
});

// describe("POST /workflows/:wid/stages", () => {
//     it("Test appending a stage to an empty workflow.", async () => {
//         const wfNum = 3;

//         const wfs = createWFObject(wfNum, "WRITE");
//         const wfrs = await requestWFGetResponse(wfs, 200);

//         for (let i = 0; i < wfNum; i++) {
//             const st = new NRStage();
//             st.name = Guid.create().toString();
//             st.description = st.name + "_DESC";
//             st.workflow = wfrs[i];

//             let priv;
//             if (i === 1) {
//                 priv = DBConstants.READ;
//             } else if (i === 2) {
//                 priv = DBConstants.WRITE;
//             } else {
//                 priv === undefined;
//             }

//             st.permission = priv;

//             const resp = await request(app)
//                                 .post(`/api/workflows/${wfrs[i].id}/stages`)
//                                 .send(st)
//                                 .set("User-Id", `${user.id}`);
//             expect(resp).not.toBeUndefined();
//             expect(resp.status).toEqual(200);

//             const str = resp.body;
//             if (priv === undefined) {
//                 expect(str.permission).toEqual(DBConstants.READ);
//             } else {
//                 expect(str.permission).toEqual(priv);
//             }

//             // Verify stages in the DB.
//             const stdb = await stRep.findOne({ where: { id: resp.body.id }});
//             expect(stdb).not.toBeUndefined();
//             expect(stdb.sequenceId).toEqual(1);
//         }
//     });

//     it("Test appending stages to workflows with stages.", async () => {
//         const wfNum = 4;
//         const stNum = 3;

//         const wfs = createWFObject(wfNum, "WRITE");
//         const wfrs = await requestWFGetResponse(wfs, 200);

//         for (const wf of wfrs) {
//             wf.stages = [];
//             for (let i = 0; i < stNum; i++) {
//                 const st = new NRStage();
//                 st.name = Guid.create().toString();
//                 st.description = st.name + "_DESC";
//                 st.workflow = wf;

//                 let priv;
//                 if (i === 1) {
//                     priv = DBConstants.READ;
//                 } else if (i === 2) {
//                     priv = DBConstants.WRITE;
//                 } else {
//                     priv === undefined;
//                 }

//                 st.permission = priv;

//                 const resp = await request(app)
//                                     .post(`/api/workflows/${wf.id}/stages`)
//                                     .send(st)
//                                     .set("User-Id", `${user.id}`);
//                 expect(resp).not.toBeUndefined();
//                 expect(resp.status).toEqual(200);

//                 const str = resp.body

//                 if (priv === undefined) {
//                     expect(str.permission).toEqual(DBConstants.READ);
//                 } else {
//                     expect(str.permission).toEqual(priv);
//                 }

//                 const stdb = await stRep.findOne({ where: { id: str.id }});
//                 expect(stdb).not.toBeUndefined();
//                 expect(stdb.sequenceId).toEqual(i + 1);

//                 if ((priv === DBConstants.READ) || (priv === undefined)) {
//                     // Stages with READ permissions we don't be able to add to.
//                     await addDocsToStage(str, 1, 403)
//                 } else {
//                     wf.stages.push(await addDocsToStage(str, 1, 200));
//                 }
//             }
//         }

//         // Verify that documents stay in the right stages.
//         for (const wf of wfrs) {
//             for (const st of wf.stages) {
//                 for (const doc of st.documents) {
//                     const dcdb = await dcRep.findOne({ where: { id: doc.id }});

//                     const stageID = await dcRep.createQueryBuilder(DBConstants.DOCU_TABLE)
//                                                .select(`${DBConstants.DOCU_TABLE}.stageId`, "val")
//                                                .where(`${DBConstants.DOCU_TABLE}.id = :did`, {did: dcdb.id})
//                                                .getRawOne();

//                     expect(stageID.val).toEqual(doc.stage.id);
//                 }
//             }
//         }
//     });

//     it("Test appending stages with no permissions.", async () => {
//         const wfNum = 2;

//         const wfs = createWFObject(wfNum, "READ");
//         const wfrs = await requestWFGetResponse(wfs, 200);

//         for (const wf of wfrs) {
//             const st = new NRStage();
//             st.name = Guid.create().toString();
//             st.description = st.name + "_DESC";
//             st.workflow = wf;

//             const resp = await request(app)
//                                 .post(`/api/workflows/${wf.id}/stages`)
//                                 .send(st)
//                                 .set("User-Id", `${user.id}`);
//             expect(resp).not.toBeUndefined();
//             expect(resp.status).toEqual(403);
//         }
//     });
// });

// describe("GET :wid/stages", () => {
//     it("Test getting all stages for a specific workflow.", async () => {
//         const wfNum = 5;
//         const stNum = 5;

//         const wfs = createWFObject(wfNum, "WRITE");
//         const wfrs = await requestWFGetResponse(wfs, 200);

//         for (let i = 0; i < wfNum; i++) {
//             wfrs[i] = await addStagesToWF(wfrs[i], stNum, 200, "RAND");
//         }

//         for (const wf of wfrs) {
//             const resp = await request(app)
//                                .get(`/api/workflows/${wf.id}/stages`)
//                                .set("User-Id", `${user.id}`);
//             expect(resp).not.toBeUndefined();
//             expect(resp.status).toEqual(200);

//             const strs = resp.body;

//             for (let i = 0; i < strs.length; i++) {
//                 await verifyStageInWF(strs[i], wf);
//                 expect(strs[i].permission).toEqual(wf.stages[i].permission);
//             }
//         }
//     });
// });

// // TODO:
// //     - Verify that everything still works even when moving stages.
// describe("GET :wid/stages/:sid", () => {
//     it("Test getting a specific stage from a workflow.", async () => {
//         const wfNum = 5;
//         const stNum = 5;

//         const wfs = createWFObject(wfNum, "WRITE");
//         const wfrs = await requestWFGetResponse(wfs, 200);

//         for (let i = 0; i < wfNum; i++) {
//             wfrs[i] = await addStagesToWF(wfrs[i], stNum, 200, "RAND");
//         }

//         for (let i = 0; i < wfrs.length; i++) {
//             const stages = wfrs[i].stages;

//             for (let j = 0; j < stages.length; j++) {
//                 const resp = await request(app)
//                                 .get(`/api/workflows/${wfrs[i].id}/stages/${stages[j].id}`)
//                                 .set("User-Id", `${user.id}`);
//                 expect(resp).not.toBeUndefined();
//                 expect(resp.status).toEqual(200);

//                 const st = resp.body;
//                 await verifyStageInWF(st, wfrs[i]);
//                 expect(st.permission).toEqual(wfrs[i].stages[j].permission);
//             }
//         }
//     });
// });

// // TODO:
// //     Verify that everything still works even when moving stages.
// describe("POST :wid/stages/:pos", () => {
//     it("Test adding a stage at a position to an empty workflow.", async () => {
//         const wfNum = 1;

//         const wfs = createWFObject(wfNum, "WRITE");
//         const wfrs = await requestWFGetResponse(wfs, 200);

//         const wf = wfrs[0];
//         const st = new NRStage();
//         st.name = Guid.create().toString();
//         st.description = st.name + "_DESC";
//         st.workflow = wf;

//         // The position to add at, sequence will not be zero-indexed.
//         const pos = 0;
//         const resp = await request(app)
//                               .post(`/api/workflows/${wf.id}/stages/${pos}`)
//                               .send(st)
//                               .set("User-Id", `${user.id}`);
//         expect(resp).not.toBeUndefined();
//         expect(resp.status).toEqual(200);

//         const str = resp.body;
//         await verifyStageInWF(str, wf);

//         const stdb = await stRep.findOne({ where: { id: str.id }});
//         expect(stdb.sequenceId).toEqual(pos + 1);
//         expect(str.sequenceId).toEqual(pos + 1);
//         expect(str.permission).toEqual(DBConstants.READ);
//     });

//     it("Test adding a stage in the middle of a workflow.", async () => {
//         const wfNum = 2;
//         const stNum = 3;

//         const wfs = createWFObject(wfNum, "WRITE");
//         const wfrs = await requestWFGetResponse(wfs, 200);

//         for (let i = 0; i < wfNum; i++) {
//             await addStagesToWF(wfrs[i], stNum, 200, "RAND");
//             wfs[i].id = wfrs[i].id;
//         }

//         // Add stage to the middle.
//         for (let i = 0; i < wfNum; i++) {
//             const st = new NRStage();
//             st.name = Guid.create().toString();
//             st.description = st.name + "_NEW";
//             st.workflow = wfs[i];

//             // The position to add at, sequence will not be zero-indexed.
//             const pos = 2;
//             const resp = await request(app)
//                             .post(`/api/workflows/${wfs[i].id}/stages/${pos}`)
//                             .send(st)
//                             .set("User-Id", `${user.id}`);
//             expect(resp).not.toBeUndefined();
//             expect(resp.status).toEqual(200);

//             const str = resp.body;
//             wfrs[i].stages.splice(pos - 1, 0, str);
//             expect(str.permission).toEqual(DBConstants.READ);
//             expect(str.sequenceId).toEqual(pos);
//             await verifyStageInWF(str, wfrs[i]);

//             const wfdb = await wfRep.findOne(wfrs[i].id, { relations: ['stages'] })
//             expect(wfdb).not.toBeUndefined();
//             expect(wfdb.stages).not.toBeUndefined();

//             wfdb.stages.sort((a: NRStage, b: NRStage) => a.sequenceId - b.sequenceId);

//             for (let j = 0; j < wfdb.stages.length; j++) {
//                 expect(wfrs[i].stages[j].id).toEqual(wfdb.stages[j].id);
//                 expect(wfrs[i].stages[j].name).toEqual(wfdb.stages[j].name);
//                 expect(wfrs[i].stages[j].description).toEqual(wfdb.stages[j].description);

//                 // Haven't updated local sequenceId values, mock that here.
//                 if (j < pos) {
//                     expect(wfrs[i].stages[j].sequenceId).toEqual(wfdb.stages[j].sequenceId);
//                 } else {
//                     expect(wfrs[i].stages[j].sequenceId + 1).toEqual(wfdb.stages[j].sequenceId);
//                 }
//             }
//         }
//     });

//     it("Test adding a stage to the beginning of a workflow.", async () => {
//         const wfNum = 2;
//         const stNum = 3;

//         const wfs = createWFObject(wfNum, "WRITE");
//         const wfrs = await requestWFGetResponse(wfs, 200);

//         for (let i = 0; i < wfNum; i++) {
//             await addStagesToWF(wfrs[i], stNum, 200, "RAND");
//             wfs[i].id = wfrs[i].id;
//         }

//         // Add stage to the middle.
//         for (let i = 0; i < wfNum; i++) {
//             const st = new NRStage();
//             st.name = Guid.create().toString();
//             st.description = st.name + "_NEW";
//             st.workflow = wfs[i];

//             // The position to add at, sequence will not be zero-indexed.
//             const pos = 0;
//             const resp = await request(app)
//                             .post(`/api/workflows/${wfs[i].id}/stages/${pos}`)
//                             .send(st)
//                             .set("User-Id", `${user.id}`);
//             expect(resp).not.toBeUndefined();
//             expect(resp.status).toEqual(200);

//             const str = resp.body;
//             wfrs[i].stages.splice(pos, 0, str);
//             expect(str.permission).toEqual(DBConstants.READ);
//             expect(str.sequenceId).toEqual(pos + 1);
//             await verifyStageInWF(str, wfrs[i]);

//             const wfdb = await wfRep.findOne(wfrs[i].id, { relations: ['stages'] })
//             expect(wfdb).not.toBeUndefined();
//             expect(wfdb.stages).not.toBeUndefined();

//             wfdb.stages.sort((a: NRStage, b: NRStage) => a.sequenceId - b.sequenceId);

//             for (let j = 0; j < wfdb.stages.length; j++) {
//                 expect(wfrs[i].stages[j].id).toEqual(wfdb.stages[j].id);
//                 expect(wfrs[i].stages[j].name).toEqual(wfdb.stages[j].name);
//                 expect(wfrs[i].stages[j].description).toEqual(wfdb.stages[j].description);

//                 // Haven't updated local sequenceId values, mock that here.
//                 if (j === pos) {
//                     expect(wfrs[i].stages[j].sequenceId).toEqual(wfdb.stages[j].sequenceId);
//                 } else {
//                     expect(wfrs[i].stages[j].sequenceId + 1).toEqual(wfdb.stages[j].sequenceId);
//                 }
//             }
//         }
//     });

//     it("Test adding a stage to the end of a workflow.", async () => {
//         const wfNum = 2;
//         const stNum = 3;

//         const wfs = createWFObject(wfNum, "WRITE");
//         const wfrs = await requestWFGetResponse(wfs, 200);

//         for (let i = 0; i < wfNum; i++) {
//             await addStagesToWF(wfrs[i], stNum, 200, "RAND");
//             wfs[i].id = wfrs[i].id;
//         }

//         // Add stage to the middle.
//         for (let i = 0; i < wfNum; i++) {
//             const st = new NRStage();
//             st.name = Guid.create().toString();
//             st.description = st.name + "_NEW";
//             st.workflow = wfs[i];

//             // The position to add at, sequence will not be zero-indexed.
//             const pos = stNum + 1;
//             const resp = await request(app)
//                             .post(`/api/workflows/${wfs[i].id}/stages/${pos}`)
//                             .send(st)
//                             .set("User-Id", `${user.id}`);
//             expect(resp).not.toBeUndefined();
//             expect(resp.status).toEqual(200);

//             const str = resp.body;
//             wfrs[i].stages.splice(pos, 0, str);
//             expect(str.permission).toEqual(DBConstants.READ);
//             expect(str.sequenceId).toEqual(pos);
//             await verifyStageInWF(str, wfrs[i]);

//             const wfdb = await wfRep.findOne(wfrs[i].id, { relations: ['stages'] })
//             expect(wfdb).not.toBeUndefined();
//             expect(wfdb.stages).not.toBeUndefined();

//             wfdb.stages.sort((a: NRStage, b: NRStage) => a.sequenceId - b.sequenceId);

//             for (let j = 0; j < wfdb.stages.length; j++) {
//                 expect(wfrs[i].stages[j].id).toEqual(wfdb.stages[j].id);
//                 expect(wfrs[i].stages[j].name).toEqual(wfdb.stages[j].name);
//                 expect(wfrs[i].stages[j].description).toEqual(wfdb.stages[j].description);
//                 expect(wfrs[i].stages[j].sequenceId).toEqual(wfdb.stages[j].sequenceId);
//             }
//         }
//     });
// });

// describe("DELETE :wid/stages/:sid", () => {
//     it("Test deleting stages from a workflow.", async () => {
//         const wfNum = 2;
//         const stNum = 3;

//         const wfs = createWFObject(wfNum, "WRITE");
//         const wfrs = await requestWFGetResponse(wfs, 200);

//         for (let i = 0; i < wfNum; i++) {
//             await addStagesToWF(wfrs[i], stNum, 200, "RAND");
//             wfs[i].id = wfrs[i].id;
//         }

//         for (let i = 0; i < wfrs.length; i++) {
//             const stages = wfrs[i].stages;

//             for (let j = 0; j < stages.length; j++) {
//                 const delStage = stages[j];
//                 const resp = await request(app)
//                                 .delete(`/api/workflows/${wfrs[i].id}/stages/${delStage.id}`)
//                                 .set("User-Id", `${user.id}`);
//                 expect(resp).not.toBeUndefined();
//                 expect(resp.status).toEqual(200);

//                 const allStages = await stRep.find({ where: { workflow: wfrs[i] },
//                                                      order: { 'sequenceId': 'ASC'} });
//                 expect(allStages.length).toEqual(stages.length - (j + 1));
//                 const stdb = await stRep.findOne({ where: { id: delStage.id }});
//                 expect(stdb).toBeUndefined();

//                 // Verify sequences of remaining stages.
//                 for (let k = 0; k < stages.length - (j + 1); k++) {
//                     // 'stages[k]' is deleted from the DB, but still has the sequenceIds
//                     // we should have updated to in the DB.
//                     expect(allStages[k].sequenceId).toEqual(k + 1);
//                 }
//             }
//         }
//     });

//     it("Test deleting stages from a workflow doesn't affect others.", async () => {
//         const wfNum = 2;
//         const stNum = 3;

//         const wfs = createWFObject(wfNum, "WRITE");
//         const wfrs = await requestWFGetResponse(wfs, 200);

//         for (let i = 0; i < wfNum; i++) {
//             await addStagesToWF(wfrs[i], stNum, 200, "RAND");
//             wfs[i].id = wfrs[i].id;
//         }

//         // Delete all stages from one workflow.
//         let i = 0;
//         let stages = wfrs[i].stages;
//         for (let j = 0; j < stages.length; j++) {
//             const delStage = stages[j];
//             const resp = await request(app)
//                             .delete(`/api/workflows/${wfrs[i].id}/stages/${delStage.id}`)
//                             .set("User-Id", `${user.id}`);
//             expect(resp).not.toBeUndefined();
//             expect(resp.status).toEqual(200);

//             const allStages = await stRep.find({ where: { workflow: wfrs[i] },
//                                                     order: { 'sequenceId': 'ASC'} });
//             expect(allStages.length).toEqual(stages.length - (j + 1));
//             const stdb = await stRep.findOne({ where: { id: delStage.id }});
//             expect(stdb).toBeUndefined();

//             // Verify sequences of remaining stages.
//             for (let k = 0; k < stages.length - (j + 1); k++) {
//                 // 'stages[k]' is deleted from the DB, but still has the sequenceIds
//                 // we should have updated to in the DB.
//                 expect(allStages[k].sequenceId).toEqual(k + 1);
//             }
//         }

//         // Verify all stages still present in the second workflow.
//         i = 1;
//         stages = wfrs[i].stages;
//         const allStages = await stRep.find({ where: { workflow: wfrs[i] },
//                                              order: { 'sequenceId': 'ASC'} });
//         expect(allStages.length).toEqual(stages.length);

//         for (let j = 0; j < stages.length; j++) {
//             expect(allStages[j].sequenceId).toEqual(stages[j].sequenceId);
//         }
//     });

//     it("Test deleting stage from workflow with only one stage.", async () => {
//         const wfNum = 1;
//         const stNum = 1;

//         const wfs = createWFObject(wfNum, "WRITE");
//         const wfrs = await requestWFGetResponse(wfs, 200);

//         for (let i = 0; i < wfNum; i++) {
//             await addStagesToWF(wfrs[i], stNum, 200, "RAND");
//             wfs[i].id = wfrs[i].id;
//         }

//         const resp = await request(app)
//                            .delete(`/api/workflows/${wfrs[0].id}/stages/${wfrs[0].stages[0].id}`)
//                            .set("User-Id", `${user.id}`);
//         expect(resp).not.toBeUndefined();
//         expect(resp.status).toEqual(200);

//         const st = await stRep.find({ where: { workflow: wfrs[0] } });
//         expect(st.length).toEqual(0);
//     });

//     it("Test deleting stages from the middle of a workflow.", async () => {
//         const wfNum = 2;
//         const stNum = 3;

//         const wfs = createWFObject(wfNum, "WRITE");
//         const wfrs = await requestWFGetResponse(wfs, 200);

//         for (let i = 0; i < wfNum; i++) {
//             await addStagesToWF(wfrs[i], stNum, 200, "RAND");
//             wfs[i].id = wfrs[i].id;
//         }

//         for (let i = 0; i < wfNum; i++) {
//             let stages = wfrs[i].stages;
//             const mid = Math.floor(stNum / 2)
//             const delStage = stages[mid];

//             const resp = await request(app)
//                             .delete(`/api/workflows/${wfrs[i].id}/stages/${delStage.id}`)
//                             .set("User-Id", `${user.id}`);
//             expect(resp).not.toBeUndefined();
//             expect(resp.status).toEqual(200);

//             const allStages = await stRep.find({ where: { workflow: wfrs[i] },
//                                                  order: { 'sequenceId': 'ASC'} });
//             expect(allStages.length).toEqual(stages.length - 1);
//             const stdb = await stRep.findOne({ where: { id: delStage.id }});
//             expect(stdb).toBeUndefined();

//             expect(allStages[0].sequenceId).toEqual(1);
//             expect(allStages[1].sequenceId).toEqual(2);
//         }
//     });

//     it("Test deleting stages from the end of a workflow.", async () => {
//         const wfNum = 2;
//         const stNum = 3;

//         const wfs = createWFObject(wfNum, "WRITE");
//         const wfrs = await requestWFGetResponse(wfs, 200);

//         for (let i = 0; i < wfNum; i++) {
//             await addStagesToWF(wfrs[i], stNum, 200, "RAND");
//             wfs[i].id = wfrs[i].id;
//         }

//         for (let i = 0; i < wfNum; i++) {
//             let stages = wfrs[i].stages;
//             const end = stNum - 1;
//             const delStage = stages[end];

//             const resp = await request(app)
//                             .delete(`/api/workflows/${wfrs[i].id}/stages/${delStage.id}`)
//                             .set("User-Id", `${user.id}`);
//             expect(resp).not.toBeUndefined();
//             expect(resp.status).toEqual(200);

//             const allStages = await stRep.find({ where: { workflow: wfrs[i] },
//                                                  order: { 'sequenceId': 'ASC'} });
//             expect(allStages.length).toEqual(stages.length - 1);
//             const stdb = await stRep.findOne({ where: { id: delStage.id }});
//             expect(stdb).toBeUndefined();

//             expect(allStages[0].sequenceId).toEqual(1);
//             expect(allStages[1].sequenceId).toEqual(2);
//         }
//     });
// });

// describe("PUT /:wid/stages/:sid", () => {
//     it("Test updating stages in different workflows.", async () => {
//         const wfNum = 3;
//         const stNum = 3;

//         const wfs = createWFObject(wfNum, "WRITE");
//         const wfrs = await requestWFGetResponse(wfs, 200);

//         for (let i = 0; i < wfNum; i++) {
//             await addStagesToWF(wfrs[i], stNum, 200, "RAND");
//             wfs[i].id = wfrs[i].id;
//         }

//         for (let i = 0; i < wfNum; i++) {
//             for (let j = 0; j < stNum; j++) {
//                 const st = wfrs[i].stages[j];
//                 st.name = st.name + '_NEW'
//                 st.description = st.name + '_DESC';

//                 const resp = await request(app)
//                                    .put(`/api/workflows/${wfrs[i].id}/stages/${st.id}`)
//                                    .send(st)
//                                    .set("User-Id", `${user.id}`);
//                 expect(resp).not.toBeUndefined();
//                 expect(resp.status).toEqual(200);

//                 const str = resp.body;
//                 await verifyStageInWF(str, wfrs[i]);
//                 expect(str.name).toEqual(st.name);
//                 expect(str.description).toEqual(st.description);
//             }
//        }
//     });

//     it("Test updating stages without permissions.", async () => {
//         const wfNum = 3;
//         const stNum = 3;

//         const wfs = createWFObject(wfNum, "WRITE");
//         const wfrs = await requestWFGetResponse(wfs, 200);

//         for (let i = 0; i < wfNum; i++) {
//             await addStagesToWF(wfrs[i], stNum, 200, "RAND");
//             wfs[i].id = wfrs[i].id;
//         }

//         for (let i = 0; i < wfNum; i++) {
//             await changeWFPerm(wfrs[i], "READ");

//             for (let j = 0; j < stNum; j++) {
//                 const st = wfrs[i].stages[j];
//                 const stcp = { ...st };
//                 stcp.name = st.name + '_NEW'
//                 stcp.description = st.name + '_DESC';

//                 const resp = await request(app)
//                                    .put(`/api/workflows/${wfrs[i].id}/stages/${st.id}`)
//                                    .send(stcp)
//                                    .set("User-Id", `${user.id}`);
//                 expect(resp).not.toBeUndefined();
//                 expect(resp.status).toEqual(403);

//                 // Confirm no changes in DB.
//                 const stdb = await stRep.findOne(st.id);
//                 expect(stdb.name).toEqual(st.name);
//                 expect(stdb.description).toEqual(st.description);
//             }
//        }
//     });
// });

// // ----------------------------------------------------------------------------------
// // |                                 DOCUMENT TESTS                                 |
// // ----------------------------------------------------------------------------------

// describe("POST /api/documents", () => {
//     it("Test getting all documents.", async () => {
//         const wfNum = 2;
//         const stNum = 3;
//         const dcNum = 1;

//         const wfs = createWFObject(wfNum, "WRITE");
//         const wfrs = await requestWFGetResponse(wfs, 200);

//         // Add a document to each stage, and verify it is in the right stage.
//         for (let i = 0; i < wfNum; i++) {
//             wfs[i] = await addStagesToWF(wfrs[i], stNum, 200, "WRITE");

//             for (let j = 0; j < stNum; j++) {
//                 await addDocsToStage(wfs[i].stages[j], dcNum, 200);
//             }
//         }
//     });

//     it("Test creating documents in stages with different permissions.", async () => {
//         const wfNum = 2;

//         const wfs = createWFObject(wfNum, "WRITE");
//         const wfrs = await requestWFGetResponse(wfs, 200);

//         for (let i = 0; i < wfNum; i++) {
//             wfs[i] = await addStagesToWF(wfrs[i], 1, 200, "READ");
//             wfs[i] = await addStagesToWF(wfrs[i], 1, 200, "WRITE");

//             await addDocsToStage(wfs[i].stages[0], 1, 403);
//             await addDocsToStage(wfs[i].stages[1], 1, 200);
//         }
//     });

//     it("Test creating a document in a workflow with no stages.", async () => {
//         const wfNum = 1;

//         const wfs = createWFObject(wfNum, "WRITE");
//         const wfrs = await requestWFGetResponse(wfs, 200);

//         const dc = new NRDocument();
//         dc.name = Guid.create().toString();
//         dc.description = dc.name + "_DESC";
//         dc.workflow = wfrs[0];

//         const resp = await request(app)
//                            .post(`/api/documents/`)
//                            .send(dc)
//                            .set("User-Id", `${user.id}`);
//         expect(resp.status).toEqual(400);
//     });

//     it("Test passing no stage defaults to putting document in first stage.", async () => {
//         const wfNum = 2;
//         const stNum = 3;

//         const wfs = createWFObject(wfNum, "WRITE");
//         const wfrs = await requestWFGetResponse(wfs, 200);

//         // Add a document to each stage, and verify it is in the right stage.
//         for (let i = 0; i < wfNum; i++) {
//             wfs[i] = await addStagesToWF(wfrs[i], stNum, 200, "WRITE");
//         }

//         const dc = new NRDocument();
//         dc.name = Guid.create().toString();
//         dc.description = dc.name + "_DESC";
//         dc.workflow = wfrs[1];

//         const resp = await request(app)
//                            .post(`/api/documents/`)
//                            .send(dc)
//                            .set("User-Id", `${user.id}`);
//         expect(resp.status).toEqual(200)
//         expect(resp.body.stage.id).toEqual(wfrs[1].stages[0].id)
//     });
// });

// describe("GET /api/documents", () => {
//     it("Test creating a single document.", async () => {
//         const wfNum = 2;
//         const stNum = 3;
//         const dcNum = 1;

//         const wfs = createWFObject(wfNum, "WRITE");
//         const wfrs = await requestWFGetResponse(wfs, 200);

//         // Add a document to each stage, and verify it is in the right stage.
//         for (let i = 0; i < wfNum; i++) {
//             wfs[i] = await addStagesToWF(wfrs[i], stNum, 200, "WRITE");

//             for (let j = 0; j < stNum; j++) {
//                 await addDocsToStage(wfs[i].stages[j], dcNum, 200);
//             }
//         }

//         const expDocNum = wfNum * stNum * dcNum;

//         const resp = await request(app)
//                            .get("/api/documents")
//                            .set("User-Id", `${user.id}`);
//         expect(resp).not.toBeUndefined();
//         expect(resp.status).toEqual(200);

//         const allDocs = resp.body;
//         expect(allDocs.length).toEqual(expDocNum);
//     });
// });

// describe("GET /api/documents/user", () => {
//     it("Test getting all documents with WRITE permissions for logged in user.", async () => {
//         const wfNum = 6;
//         const stNum = 3;
//         const dcNum = 1;

//         const wfs = createWFObject(wfNum, "WRITE");
//         const wfrs = await requestWFGetResponse(wfs, 200);

//         let grp1 = await createGroup(200);
//         let grp2 = await createGroup(200);
//         let grp3 = await createGroup(200);
//         let grp4 = await createGroup(200);
//         grp1 = await addUserToGroup(grp1.name, user, 200);
//         grp2 = await addUserToGroup(grp2.name, user, 200);
//         grp3 = await addUserToGroup(grp3.name, user, 200);
//         grp4 = await addUserToGroup(grp4.name, user, 200);

//         // Baseline data.
//         for (let i = 0; i < wfNum; i++) {
//             wfs[i] = await addStagesToWF(wfrs[i], stNum, 200, "WRITE");

//             for (let j = 0; j < stNum; j++) {
//                 await addDocsToStage(wfs[i].stages[j], dcNum, 200);
//             }
//         }

//         // Clear created permissions from baseline data creation.
//         await clearAllPermissions();

//         let expDocs: NRDocument[] = [];
//         // 'grp1' has READ permissions on first workflow.
//         await setWFPermForGroup(grp1, wfrs[0], "READ", 200);

//         // 'grp4' has WRITE permissions on the first two stages of the first workflow.
//         await setSTPermForGroup(grp4, wfrs[0].stages[0], "WRITE", 200);
//         await setSTPermForGroup(grp4, wfrs[0].stages[1], "WRITE", 200);
//         expDocs = expDocs.concat(wfs[0].stages[0].documents);
//         expDocs = expDocs.concat(wfs[0].stages[1].documents);

//         // 'grp2' has WRITE permissions on second workflow.
//         await setWFPermForGroup(grp2, wfrs[1], "WRITE", 200);
//         // for (const st of wfs[1].stages) {
//         //     expDocs = expDocs.concat(st.documents);
//         // }

//         // 'grp3' has WRITE permissions on third workflow.
//         await setWFPermForGroup(grp3, wfrs[2], "WRITE", 200);
//         // for (const st of wfs[2].stages) {
//         //     expDocs = expDocs.concat(st.documents);
//         // }

//         // 'user' has READ permissions on fourth workflow.
//         await changeWFPerm(wfrs[3], "READ");

//         // 'user' has WRITE permissions on fifth workflow.
//         await changeWFPerm(wfrs[4], "WRITE");
//         // for (const st of wfs[4].stages) {
//         //     expDocs = expDocs.concat(st.documents);
//         // }

//         // 'user' has mixed permissions for stages in sixth workflow.
//         // Workflow itself needs to be READ.
//         await changeWFPerm(wfrs[5], "READ");
//         for (let j = 0; j < stNum; j++) {
//             if (j % 2 === 0) {
//                 wfs[5].stages[j] = await changeSTPerm(wfs[5].stages[j], "READ");
//             } else {
//                 await changeSTPerm(wfs[5].stages[j], "WRITE");
//                 expDocs = expDocs.concat(wfs[5].stages[j].documents);
//             }
//         }

//         const resp = await request(app)
//                            .get("/api/documents/user")
//                            .set("User-Id", `${user.id}`);
//         expect(resp).not.toBeUndefined();
//         expect(resp.status).toEqual(200);

//         const allDocs = resp.body;
//         expect(allDocs.length).toEqual(expDocs.length);

//         // Sort by ID for easy comparisons.
//         allDocs.sort((a: NRDocument, b: NRDocument) => a.id - b.id);
//         expDocs.sort((a: NRDocument, b: NRDocument) => a.id - b.id);

//         // Verify we got the right documents back.
//         for (let i = 0; i < expDocs.length; i++) {
//             expect(allDocs[i].id).toEqual(expDocs[i].id)
//         }
//     });
// });

// ----------------------------------------------------------------------------------
// |                                  HELPER FUNCTIONS                              |
// ----------------------------------------------------------------------------------

// DONE.
function createWF(priv: string) {
    const wf = new NRWorkflow();
    wf.id = wfSeq;
    wfSeq++;

    wf.name = "WF_" + Guid.create().toString();
    wf.description = wf.name + "_DESC";

    if (priv === "RAND") {
        // Either 1 or 0.
        wf.permission = Math.round(Math.random());
    } else if (priv !== null) {
        wf.permission = (priv === "WRITE") ? 1 : 0;
    }

    return wf;
}

// DONE.
async function reqWFGetResp(priv: string, status: number) {
    const wf = createWF(priv);

    const resp = await request(app)
                       .post("/api/workflows")
                       .send(wf)
                       .set("User-Id", `${usr.id}`);

    expect(resp).not.toBeUndefined();
    expect(resp.status).toEqual(status);

    if (status === 200) {
        // Won't have stages yet.
        await verifyWFResp(wf, resp.body, false);

        await verifyWFDB(wf);
    }

    return resp.body;
}

// DONE.
async function reqWFSGetResps(num: number, priv: string, status: number) {
    const wfrs: NRWorkflow[] = [];

    for (let i = 0; i < num; i++) {
        wfrs.push(await reqWFGetResp(priv, status));
    }

    return wfrs;
}

// DONE.
async function addStageToWF(wf: NRWorkflow, status: number, perm: string,
                            pos: string, verifyDocs: boolean, whichPerm: string) {
    if (wf.stages === undefined) {
        wf.stages = [];
    }

    const st = new NRStage();
    st.id = stSeq;
    stSeq++;

    st.name = "ST_" + Guid.create().toString();
    st.description = st.name + "_DESC";

    if (perm === "RAND") {
        st.permission = Math.round(Math.random());
    } else if (perm !== null) {
        st.permission = (perm === "WRITE") ? 1 : 0;
    }

    // The expected location of the stage.
    let loc;

    let resp;
    if (pos === "APPEND") {
        resp = await request(app)
                     .post(`/api/workflows/${wf.id}/stages`)
                     .send(st)
                     .set("User-Id", `${usr.id}`);
    } else {
        // Choose a random location, or convert the passed one to a number.
        loc = (pos === "RAND") ? Math.round(Math.random() * wf.stages.length) : +pos;

        resp = await request(app)
                    .post(`/api/workflows/${wf.id}/stages/${loc}`)
                    .send(st)
                    .set("User-Id", `${usr.id}`);

        // Fix for splicing.
        if (loc <= 0) {
            loc = 1;
        } else if (loc > wf.stages.length) {
            loc = wf.stages.length;
        }
    }

    expect(resp).not.toBeUndefined();
    expect(resp.status).toEqual(status);

    if (status === 200) {
        const str: NRStage = resp.body;

        if (pos === "APPEND") {
            wf.stages.push(str);
        } else {
            // Fix sequence IDs manually.
            const newLoc = loc - 1;
            wf.stages.splice(newLoc, 0, str);

            for (const s of wf.stages) {
                if ((s.id !== str.id) && (s.sequenceId >= loc)) {
                    s.sequenceId += 1;
                }
            }
        }

        await verifySTResp(st, str, wf, verifyDocs, whichPerm);
    }

    return wf;
}

// DONE.
async function addStagesToWF(wf: NRWorkflow, numStages: number, status: number, perm: string,
                             pos: string, verifyDocs: boolean, whichPerm: string) {
    let wfr;

    for (let i = 0; i < numStages; i++) {
        if (i === 0) {
            wfr = await addStageToWF(wf, status, perm, pos, verifyDocs, whichPerm);
        } else {
            wfr = await addStageToWF(wfr, status, perm, pos, verifyDocs, whichPerm);
        }
    }

    return wfr;
}

// DONE.
async function addStagesToWFS(wfs: NRWorkflow[], numStages: number, status: number, perm: string,
                              pos: string, verifyDocs: boolean, whichPerm: string) {
    const wfrs: NRWorkflow[] = [];

    for (const wf of wfs) {
        wfrs.push(await addStagesToWF(wf, numStages, status, perm, pos, verifyDocs, whichPerm));
    }

    return wfrs;
}

// DONE.
async function changeWFPerm(wf: NRWorkflow, perm: string) {
    const priv = (perm === "WRITE") ? DBConstants.WRITE : DBConstants.READ;

    const resp = await request(app)
                       .put(`/api/users/${usr.id}/wfperm/${wf.id}/${priv}`)
                       .set("User-Id", `${usr.id}`);
    expect(resp).not.toBeUndefined();
    expect(resp.status).toEqual(200);
    expect(resp.body.access).toEqual(priv);

    wf.permission = priv;
    return wf;
}

// DONE.
async function changeSTPerm(st: NRStage, perm: string) {
    const priv = (perm === "WRITE") ? 1 : 0;

    const resp = await request(app)
                       .put(`/api/users/${usr.id}/stperm/${st.id}/${priv}`)
                       .set("User-Id", `${usr.id}`);
    expect(resp).not.toBeUndefined();
    expect(resp.status).toEqual(200);
    expect(resp.body.access).toEqual(priv);

    st.permission = priv;
    return st;
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
        const stwf = await stRep.findOne(st.id, { relations: ["workflow"]});
        const wfdb = stwf.workflow;
        dc.workflow = wfdb;
        dc.stage = st;

        const resp = await request(app)
                           .post(`/api/documents/`)
                           .send(dc)
                           .set("User-Id", `${usr.id}`);
        expect(resp.status).toEqual(status);

        if (status === 200) {
            const dcr = resp.body;
            expect(dcr.name).toEqual(dc.name);
            expect(dcr.description).toEqual(dc.description);

            await verifyDCInST(dcr, st);
            st.documents.push(resp.body);
        }
    }

    return st;
}

async function createGroup(status: number) {
    const role = new NRRole();
    role.id = rlSeq;
    rlSeq++;

    role.name = Guid.create().toString();

    const resp = await request(app)
                       .post(`/api/roles`)
                       .send(role)
                       .set("User-Id", `${usr.id}`);
    expect(resp.status).not.toBeUndefined();
    expect(resp.status).toEqual(status);

    return resp.body;
}

async function addUserToGroup(grp: string, targUsr: NRUser, status: number) {
    let role: NRRole;

    // See if the group exists, or create it.
    try {
        role = await rlRep.findOneOrFail({ where: { name: grp }});
    } catch (err) {
        role = await createGroup(200);
    }

    // Add the user to the group.
    const resp = await request(app)
                        .put(`/api/users/${targUsr.id}/role/${role.id}`)
                        .set("User-Id", `${targUsr.id}`);
    expect(resp.status).not.toBeUndefined();
    expect(resp.status).toEqual(status);

    if (status === 200) {
        await verifyUserInGroup(resp.body, role);
    }

    return role;
}

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
                        .set("User-Id", `${usr.id}`);
    expect(resp.status).toEqual(status);
}

async function setSTPermForGroup(role: NRRole, st: NRStage, perm: string, status: number) {
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
                        .put(`/api/roles/${role.id}/stage/${st.id}`)
                        .send({access: resPerm})
                        .set("User-Id", `${usr.id}`);
    expect(resp.status).toEqual(status);
}

// DONE.
async function clearAllPermissions() {
    await wfUSRep.createQueryBuilder()
                 .delete()
                 .from(NRWFUSPermission)
                 .execute();

    await stUSRep.createQueryBuilder()
                 .delete()
                 .from(NRSTUSPermission)
                 .execute();

    await wfPRep.createQueryBuilder()
                .delete()
                .from(NRWFPermission)
                .execute();

    await stPRep.createQueryBuilder()
                .delete()
                .from(NRSTPermission)
                .execute();
 }

// DONE.
function changeSTPermMatchWFS(wfs: NRWorkflow[]) {
    // Make a copy to return that DOESN'T change.
    const wfns: NRWorkflow[] = [];
    let wfc;

    for (const wf of wfs) {
        wfc = JSON.parse(JSON.stringify(wf));
        wfns.push(wfc);

        for (const st of wf.stages) {
            st.permission = wf.permission;
        }
    }

    return wfns;
 }

// ----------------------------------------------------------------------------------
// |                             VERIFICATION FUNCTIONS                             |
// ----------------------------------------------------------------------------------

// DONE.
async function verifyWFDB(wf: NRWorkflow) {
    const wfdb = await wfRep.findOneOrFail({ where: { id: wf.id }});

    expect(wfdb.name).not.toBeUndefined();
    expect(wf.name).toEqual(wfdb.name);

    expect(wfdb.description).not.toBeUndefined();
    expect(wf.description).toEqual(wfdb.description);

    if (wf.permission === undefined) {
        expect(await permServ.getWFPermForUser(wf, usr)).toEqual(DBConstants.READ);
    } else {
        expect(wf.permission).toEqual(await permServ.getWFPermForUser(wf, usr));
    }

    if (wf.stages !== undefined) {
        await verifySTSDB(wf.stages, wf);
    }
}

// DONE.
async function verifyWFSDB(wfs: NRWorkflow[]) {
    for (const wf of wfs) {
        await verifyWFDB(wf);
    }
}

// DONE.
async function verifyWFResp(wf: NRWorkflow, wfr: NRWorkflow, verifyStages: boolean) {
    expect(wf.id).toEqual(wfr.id);

    expect(wfr.name).not.toBeUndefined();
    expect(wf.name).toEqual(wfr.name);

    expect(wfr.description).not.toBeUndefined();
    expect(wf.description).toEqual(wfr.description);

    if (wf.permission === undefined) {
        expect(wfr.permission).toEqual(DBConstants.READ);
    } else {
        expect(wfr.permission).not.toBeUndefined();
        expect(wf.permission).toEqual(wfr.permission);
    }

    if (verifyStages === true) {
        expect(wfr.stages).not.toBeUndefined();
    } else {
        expect(wfr.stages).toBeUndefined();
    }
}

// DONE.
async function verifyWFResps(wfs: NRWorkflow[], wfrs: NRWorkflow[], verifyStages: boolean) {
    expect(wfs.length).toEqual(wfrs.length);

    const wfss = wfs.sort((a: NRWorkflow, b: NRWorkflow) => a.id - b.id);
    const wfrss = wfrs.sort((a: NRWorkflow, b: NRWorkflow) => a.id - b.id);

    for (let i = 0; i < wfs.length; i++) {
        await verifyWFResp(wfss[i], wfrss[i], verifyStages);
    }
}

// DONE.
async function verifySTDB(st: NRStage, wf: NRWorkflow, seq: number) {
    await verifySTInWF(st, wf);

    const stdb = await stRep.findOneOrFail({ where: { id: st.id }});
    expect(stdb).not.toBeUndefined();

    expect(st.sequenceId).toEqual(seq);
    expect(stdb.sequenceId).toEqual(seq);

    expect(stdb.name).not.toBeUndefined();
    expect(st.name).toEqual(stdb.name);

    expect(stdb.description).not.toBeUndefined();
    expect(st.description).toEqual(stdb.description);

    if (st.permission === undefined) {
        expect(await permServ.getSTPermForUser(st, usr)).toEqual(DBConstants.READ);
    } else {
        expect(st.permission).toEqual(await permServ.getSTPermForUser(st, usr));
    }

    if (st.documents !== undefined) {
        await verifyDCSDB(st.documents, st, wf);
    }
}

// DONE.
async function verifySTSDB(sts: NRStage[], wf: NRWorkflow) {
    let i = 1;

    const stss = sts.sort((a: NRStage, b: NRStage) => a.sequenceId - b.sequenceId);

    for (const st of stss) {
        await verifySTDB(st, wf, i);
        i += 1;
    }
}

// DONE.
async function verifyWFSSTSDB(wfs: NRWorkflow[]) {
    for (const wf of wfs) {
        await verifySTSDB(wf.stages, wf);
    }
}

// DONE.
async function verifySTResp(st: NRStage, str: NRStage, wf: NRWorkflow, verifyDocs: boolean,
                            whichPerm: string) {
    expect(st.id).toEqual(str.id);

    expect(str.name).not.toBeUndefined();
    expect(str.name).toEqual(st.name);

    expect(str.description).not.toBeUndefined();
    expect(str.description).toEqual(st.description);

    // In some cases, the returned stage permission should match the workflow
    // permissions.
    if (whichPerm === "WF") {
        expect(str.permission).not.toBeUndefined();
        expect(st.permission).toEqual(str.permission);
        expect(wf.permission).toEqual(str.permission);
    } else {
        if (st.permission === undefined) {
            expect(str.permission).toEqual(DBConstants.READ);
        } else {
            expect(str.permission).not.toBeUndefined();
            expect(st.permission).toEqual(str.permission);
        }
    }

    if (verifyDocs === true) {
        expect(str.documents).not.toBeUndefined();
    } else {
        expect(str.documents).toBeUndefined();
    }
}

// DONE.
async function verifySTResps(sts: NRStage[], strs: NRStage[], wf: NRWorkflow,
                             verifyDocs: boolean, whichPerm: string) {
    expect(sts.length).toEqual(strs.length);

    const stss = sts.sort((a: NRStage, b: NRStage) => a.sequenceId - b.sequenceId);
    const strss = strs.sort((a: NRStage, b: NRStage) => a.sequenceId - b.sequenceId);

    for (let i = 0; i < sts.length; i++) {
        await verifySTResp(stss[i], strss[i], wf, verifyDocs, whichPerm);
    }
}

// DONE.
async function verifyDCDB(dc: NRDocument, st: NRStage, wf: NRWorkflow) {
    await verifyDCInST(dc, st);

    const dcdb = await this.dcRep.findOne(dc.id);

    expect(dcdb).not.toBeUndefined();
    expect(dcdb.name).not.toBeUndefined();
    expect(dcdb.name).toEqual(dc.name);

    expect(dcdb.description).not.toBeUndefined();
    expect(dc.description).toEqual(dcdb.description);
}

// DONE.
async function verifyDCSDB(dcs: NRDocument[], st: NRStage, wf: NRWorkflow) {
    for (const dc of dcs) {
        await verifyDCDB(dc, st, wf);
    }
}

// DONE.
async function verifyDCResp(dc: NRDocument, dcr: NRDocument, st: NRStage, wf: NRWorkflow) {
    expect(dc.id).toEqual(dcr.id);

    expect(dcr.name).not.toBeUndefined();
    expect(dcr.name).toEqual(dc.name);

    expect(dcr.description).not.toBeUndefined();
    expect(dcr.description).toEqual(dc.description);

    // Document permission is based off of stage.
    if (st.permission === undefined) {
        expect(dc.permission).toEqual(DBConstants.READ);
    } else {
        expect(dcr.permission).not.toBeUndefined();
        expect(dc.permission).toEqual(dcr.permission);
    }
}

// DONE.
async function verifyDCResps(dcs: NRDocument[], dcrs: NRDocument[], st: NRStage, wf: NRWorkflow) {
    expect(dcs.length).toEqual(dcrs.length);

    for (let i = 0; i < dcs.length; i++) {
        await verifyDCResp(dcs[i], dcrs[i], st, wf);
    }
}

// DONE.
async function verifySTInWF(st: NRStage, wf: NRWorkflow) {
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

async function verifyUserInGroup(targUsr: NRUser, group: NRRole) {
    const rldb = await rlRep.findOne({ relations: ["users"],
                                       where: { id: group.id } });

    let found = false;
    for (const u of rldb.users) {
        if (u.id === targUsr.id) {
            found = true;
            break;
        }
    }

    expect(found).toEqual(true);
}

async function verifyDCInST(dc: NRDocument, st: NRStage) {
    // Verify it is in the right stage.
    const dcstid  = await dcRep.createQueryBuilder(DBConstants.DOCU_TABLE)
                               .select(`${DBConstants.DOCU_TABLE}.stageId`, "val")
                               .where(`${DBConstants.DOCU_TABLE}.id = :did`, {did: dc.id})
                               .getRawOne();
    expect(dcstid.val).not.toBeUndefined();
    expect(dcstid.val).toEqual(st.id);
}
