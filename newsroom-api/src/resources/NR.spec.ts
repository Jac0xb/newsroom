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
//   - Test comments return for a single document.

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

// ----------------------------------------------------------------------------------
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |                                    SETUP                                       |
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// ----------------------------------------------------------------------------------

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

    jest.setTimeout(25000);
    done();
});

// ----------------------------------------------------------------------------------
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |                                 WORKFLOW TESTS                                 |
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// ----------------------------------------------------------------------------------

describe("POST /api/workflows", () => {
    it("Test creating a single workflow.", async () => {
        await reqWFGetResp("RAND", 200);
    });

    it("Test creating 5 workflows with different permissions.", async () => {
        const wfNum = 5;

        await reqWFSGetResps(wfNum, "RAND", 200);
    });

    it("Test creating workflows when specifying no permissions.", async () => {
        const wfNum = 2;

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

        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);

        // Don't verify stage documents, we haven't created any.
        await addStagesToWFS(wfs, stNum, 200, "RAND", "RAND", false, "ST");

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

        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);

        // Don't verify stage documents, we haven't created any.
        // Returned stage permissions should match passed permissions on creation.
        await addStagesToWFS(wfs, stNum, 200, "READ", "RAND", false, "ST");
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

describe("PUT /api/workflows/:wid", () => {
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

        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);

        // Don't verify stage documents, we haven't created any.
        await addStagesToWFS(wfs, stNum, 200, "RAND", "RAND", false, "ST");

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

        await changeWFPerm(wfs[wfNum / wfNum], "WRITE", "USER", true);
        await changeWFPerm(wfs[Math.floor(wfNum / 2)], "WRITE", "USER", true);

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

            if (wfs[i].permission === DBConstants.READ) {
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

// TODO: Test both at the same time?
describe("DELETE /api/workflows/:wid", () => {
    it("Test deleting workflows no relationships, user permissions.", async () => {
        const wfNum = 10;

        const wfs = await reqWFSGetResps(wfNum, "RAND", 200);

        await changeWFPerm(wfs[wfNum / wfNum], "WRITE", "USER", true);
        await changeWFPerm(wfs[Math.floor(wfNum / 2)], "READ", "USER", true);

        for (let i = 0; i < wfs.length; i++) {
            const resp = await request(app)
                               .delete(`/api/workflows/${wfs[i].id}`)
                               .set("User-Id", `${usr.id}`);

            expect(resp).not.toBeUndefined();

            if (wfs[i].permission === DBConstants.READ) {
                const wfdb = await wfRep.findOne({ where: { id: wfs[i].id }});

                expect(resp.status).toEqual(403);
                expect(wfdb).not.toBeUndefined();

                await verifyWFDB(wfs[i]);
            } else {
                await verifyWFDeleted(wfs[i], false);
            }
        }
    });

    it("Test deleting workflows no relationships, group permissions.", async () => {
        const wfNum = 10;

        const wfs = await reqWFSGetResps(wfNum, "RAND", 200);

        // Make sure these only have group permissions.
        await changeWFSPermsToGroup(wfs);

        for (let i = 0; i < wfs.length; i++) {
            const resp = await request(app)
                               .delete(`/api/workflows/${wfs[i].id}`)
                               .set("User-Id", `${usr.id}`);

            expect(resp).not.toBeUndefined();

            if (wfs[i].permission === DBConstants.READ) {
                const wfdb = await wfRep.findOne({ where: { id: wfs[i].id }});

                expect(resp.status).toEqual(403);
                expect(wfdb).not.toBeUndefined();

                await verifyWFDB(wfs[i]);
            } else {
                await verifyWFDeleted(wfs[i], false);
            }
        }
    });

    it("Test deleting workflows with stages, user permissions.", async () => {
        const wfNum = 10;
        const stNum = 5;

        // Start with write to be able to add stages.
        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);
        await addStagesToWFS(wfs, stNum, 200, "RAND", "RAND", false, "ST");

        // Change back to random, 'true' to modify existing ones instead
        // of creating new ones.
        await changeWFSPerms(wfs, "RAND", "USER", true);

        await changeWFPerm(wfs[wfNum / wfNum], "WRITE", "USER", true);
        await changeWFPerm(wfs[Math.floor(wfNum / 2)], "READ", "USER", true);

        for (let i = 0; i < wfs.length; i++) {
            const resp = await request(app)
                               .delete(`/api/workflows/${wfs[i].id}`)
                               .set("User-Id", `${usr.id}`);

            expect(resp).not.toBeUndefined();

            if (wfs[i].permission === DBConstants.READ) {
                const wfdb = await wfRep.findOne(wfs[i].id);

                expect(resp.status).toEqual(403);
                expect(wfdb).not.toBeUndefined();

                await verifyWFDB(wfs[i]);
                await verifySTSDB(wfs[i].stages, wfs[i]);
            } else {
                await verifyWFDeleted(wfs[i], true);
            }
        }
    });

    it("Test deleting workflows with stages, group permissions.", async () => {
        const wfNum = 10;
        const stNum = 5;

        // Start with write to be able to add stages.
        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);
        await addStagesToWFS(wfs, stNum, 200, "RAND", "RAND", false, "ST");

        // Make sure these only have group permissions.
        await changeWFSPermsToGroup(wfs);

        await changeWFPerm(wfs[wfNum / wfNum], "WRITE", "GROUP", true);
        await changeWFPerm(wfs[Math.floor(wfNum / 2)], "READ", "GROUP", true);

        for (let i = 0; i < wfs.length; i++) {
            const resp = await request(app)
                               .delete(`/api/workflows/${wfs[i].id}`)
                               .set("User-Id", `${usr.id}`);

            expect(resp).not.toBeUndefined();

            if (wfs[i].permission === DBConstants.READ) {
                const wfdb = await wfRep.findOne(wfs[i].id);

                expect(resp.status).toEqual(403);
                expect(wfdb).not.toBeUndefined();

                await verifyWFDB(wfs[i]);
                await verifySTSDB(wfs[i].stages, wfs[i]);
            } else {
                await verifyWFDeleted(wfs[i], true);
            }
        }
    });

    it("Test deleting workflows with stages and documents, user permissions.", async () => {
        const wfNum = 10;
        const stNum = 5;
        const dcNum = 1;

        // Start with write to be able to add stages.
        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);

        // Need write so we can add documents to the stages.
        await addStagesToWFS(wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(wfs, dcNum, 200);

        // Change back to random, 'true' to modify existing ones instead
        // of creating new ones.
        await changeWFSPerms(wfs, "RAND", "USER", true);

        await changeWFPerm(wfs[wfNum / wfNum], "WRITE", "USER", true);
        await changeWFPerm(wfs[Math.floor(wfNum / 2)], "READ", "USER", true);

        for (let i = 0; i < wfs.length; i++) {
            const resp = await request(app)
                               .delete(`/api/workflows/${wfs[i].id}`)
                               .set("User-Id", `${usr.id}`);

            expect(resp).not.toBeUndefined();

            if (wfs[i].permission === DBConstants.READ) {
                const wfdb = await wfRep.findOne(wfs[i].id);

                expect(resp.status).toEqual(403);
                expect(wfdb).not.toBeUndefined();

                await verifyWFDB(wfs[i]);
                await verifySTSDB(wfs[i].stages, wfs[i]);
            } else {
                await verifyWFDeleted(wfs[i], true);
            }
        }
    });

    it("Test deleting workflows with stages and documents, group permissions.", async () => {
        const wfNum = 10;
        const stNum = 5;
        const dcNum = 1;

        // Start with write to be able to add stages.
        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);
        await addStagesToWFS(wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(wfs, dcNum, 200);

        // Make sure these only have group permissions.
        await changeWFSPermsToGroup(wfs);

        await changeWFPerm(wfs[wfNum / wfNum], "WRITE", "GROUP", true);
        await changeWFPerm(wfs[Math.floor(wfNum / 2)], "READ", "GROUP", true);

        for (let i = 0; i < wfs.length; i++) {
            const resp = await request(app)
                               .delete(`/api/workflows/${wfs[i].id}`)
                               .set("User-Id", `${usr.id}`);

            expect(resp).not.toBeUndefined();

            if (wfs[i].permission === DBConstants.READ) {
                const wfdb = await wfRep.findOne(wfs[i].id);

                expect(resp.status).toEqual(403);
                expect(wfdb).not.toBeUndefined();

                await verifyWFDB(wfs[i]);
                await verifySTSDB(wfs[i].stages, wfs[i]);
            } else {
                await verifyWFDeleted(wfs[i], true);
            }
        }
    });

    it("Test deleting workflows when no permissions exist at all.", async () => {
        const wfNum = 3;

        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);

        for (const wf of wfs) {
            await clearWFPermissions(wf);

            const resp = await request(app)
                               .delete(`/api/workflows/${wf.id}`)
                               .set("User-Id", `${usr.id}`);

            expect(resp).not.toBeUndefined();

            const wfdb = await wfRep.findOne(wf.id);

            expect(resp.status).toEqual(403);
            expect(wfdb).not.toBeUndefined();

            await verifyWFDB(wf);
        }
    });
});

describe("POST /api/workflows/:wid/stages", () => {
    it("Test appending a stage to an empty workflow.", async () => {
        const wfNum = 10;
        const stNum = 1;

        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);
        await addStagesToWFS(wfs, stNum, 200, "RAND", "APPEND", false, "ST");
    });

    it("Test appending many stages to an workflows.", async () => {
        const wfNum = 10;
        const stNum = 10;

        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);
        await addStagesToWFS(wfs, stNum, 200, "RAND", "APPEND", false, "ST");
    });

    it("Test appending many stages to an workflows.", async () => {
        const wfNum = 10;
        const stNum = 10;

        const wfs = await reqWFSGetResps(wfNum, "READ", 200);
        await addStagesToWFS(wfs, stNum, 403, "RAND", "APPEND", false, "ST");
    });

    it("Test appending stages doesn't affect documents.", async () => {
        const wfNum = 5;
        const stNum = 5;
        const dcNum = 2;

        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);
        await addStagesToWFS(wfs, stNum, 200, "WRITE", "APPEND", false, "ST");
        await addDocsToWFSStages(wfs, dcNum, 200);

        // Append more stages.
        await addStagesToWFS(wfs, stNum, 200, "RAND", "APPEND", false, "ST");
    });
});

describe("GET /api/workflows/:wid/stages", () => {
    it("Test getting all stages for a specific workflow.", async () => {
        const wfNum = 5;
        const stNum = 5;

        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);
        await addStagesToWFS(wfs, stNum, 200, "RAND", "RAND", false, "ST");

        for (const wf of wfs) {
            const resp = await request(app)
                               .get(`/api/workflows/${wf.id}/stages`)
                               .set("User-Id", `${usr.id}`);

            expect(resp).not.toBeUndefined();
            expect(resp.status).toEqual(200);

            const strs = resp.body;

            await verifySTResps(wf.stages, strs, wf, false, "ST");
            await verifySTSDB(strs, wf);
        }
    });
});

// TODO:
//     - Verify that everything still works even when moving stages.
describe("GET :wid/stages/:sid", () => {
    it("Test getting a specific stage from a workflow.", async () => {
        const wfNum = 5;
        const stNum = 5;

        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);
        await addStagesToWFS(wfs, stNum, 200, "RAND", "RAND", false, "ST");

        for (const wf of wfs) {
            for (let i = 0; i < stNum; i++) {
                const resp = await request(app)
                                .get(`/api/workflows/${wf.id}/stages/${wf.stages[i].id}`)
                                .set("User-Id", `${usr.id}`);

                expect(resp).not.toBeUndefined();
                expect(resp.status).toEqual(200);

                const str = resp.body;

                await verifySTResp(wf.stages[i], str, wf, false, "ST");

                // Sequences start with 1.
                await verifySTDB(str, wf, i + 1);
            }
        }
    });

    it("Test getting a specific stage returns documents.", async () => {
        const wfNum = 5;
        const stNum = 5;
        const dcNum = 1;

        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);
        await addStagesToWFS(wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(wfs, dcNum, 200);

        for (const wf of wfs) {
            for (let i = 0; i < stNum; i++) {
                const resp = await request(app)
                                .get(`/api/workflows/${wf.id}/stages/${wf.stages[i].id}`)
                                .set("User-Id", `${usr.id}`);

                expect(resp).not.toBeUndefined();
                expect(resp.status).toEqual(200);

                const str = resp.body;

                await verifySTResp(wf.stages[i], str, wf, true, "ST");

                // Sequences start with 1.
                await verifySTDB(str, wf, i + 1);
            }
        }
    });
});

// TODO:
//     Verify that everything still works even when moving stages.
describe("POST :wid/stages/:pos", () => {
    it("Test adding a stage at a specific positions in a workflow.", async () => {
        // 100 stages.
        const wfNum = 10;
        const stNum = 10;

        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);
        await addStagesToWFS(wfs, stNum, 200, "RAND", "RAND", false, "ST");

        for (const wf of wfs) {
            // Explicitly check beginning, middle, and end.
            const len = wf.stages.length;
            const pos = [len + 100, Math.round(len / 2), -1];

            for (const loc of pos) {
                // Add at the position and verify.
                await addStageToWF(wf, 200, "RAND", "" + loc, false, "ST");
            }
        }
    });
});

describe("DELETE /api/workflows/:wid/stages/:sid", () => {
    it("Test deleting stages with no documents, user permissions.", async () => {
        const wfNum = 10;
        const stNum = 5;

        // WRITE permissions initially to be able to add stages.
        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);
        await addStagesToWFS(wfs, stNum, 200, "RAND", "RAND", false, "ST");

        // Randomize them now for testing.
        await changeWFSPerms(wfs, "RAND", "USER", true);

        for (const wf of wfs) {
            for (let i = 0; i < stNum; i++) {
                const sts = wf.stages;

                // Choose a random stage to delete.
                const idtd = Math.floor(Math.random() * sts.length);
                const sttd = sts[idtd];
                const seq = sttd.sequenceId;

                // Only change locally if we expect it to be deleted remotely too.
                if (wf.permission === DBConstants.WRITE) {
                    // Delete the stage from our 'local' copy.
                    sts.splice(idtd, 1);

                    // Fix sequence numbers.
                    for (let j = 0; j < sts.length; j++) {
                        sts[j].sequenceId = j + 1;
                    }
                }

                const resp = await request(app)
                                   .delete(`/api/workflows/${wf.id}/stages/${sttd.id}`)
                                   .set("User-Id", `${usr.id}`);

                expect(resp).not.toBeUndefined();

                // Stage permissions depend on workflow.
                if (wf.permission === DBConstants.READ) {
                    const stdb = await stRep.findOne(sttd.id);

                    expect(resp.status).toEqual(403);
                    expect(stdb).not.toBeUndefined();

                    // Should have the same sequence ID if it wasn't deleted.
                    await verifySTDB(sttd, wf, seq);
                } else {
                    await verifySTDeleted(sttd, sts);
                }
            }
        }
    });

    it("Test deleting stages with no documents, group permissions.", async () => {
        const wfNum = 10;
        const stNum = 5;

        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);
        await addStagesToWFS(wfs, stNum, 200, "RAND", "RAND", false, "ST");

        // Test to try group permissions for stages, workflow permissions don't change.
        await changeWFSSTPermToGroup(wfs);

        for (const wf of wfs) {
             for (let i = 0; i < stNum; i++) {
                const sts = wf.stages;

                // Choose a random stage to delete.
                const idtd = Math.floor(Math.random() * sts.length);
                const sttd = sts[idtd];
                const seq = sttd.sequenceId;

                // Only change locally if we expect it to be deleted remotely too.
                if (wf.permission === DBConstants.WRITE) {
                    // Delete the stage from our 'local' copy.
                    sts.splice(idtd, 1);

                    // Fix sequence numbers.
                    for (let j = 0; j < sts.length; j++) {
                        sts[j].sequenceId = j + 1;
                    }
                }

                const resp = await request(app)
                                   .delete(`/api/workflows/${wf.id}/stages/${sttd.id}`)
                                   .set("User-Id", `${usr.id}`);

                expect(resp).not.toBeUndefined();

                // Stage permissions depend on workflow.
                if (wf.permission === DBConstants.READ) {
                    const stdb = await stRep.findOne(sttd.id);

                    expect(resp.status).toEqual(403);
                    expect(stdb).not.toBeUndefined();

                    // Should have the same sequence ID if it wasn't deleted.
                    await verifySTDB(sttd, wf, seq);
                } else {
                    await verifySTDeleted(sttd, sts);
                }
            }
        }
    });

    it("Test deleting stages with documents, user permissions.", async () => {
        const wfNum = 3;
        const stNum = 5;
        const dcNum = 3;

        // WRITE permissions initially to be able to add stages.
        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);
        await addStagesToWFS(wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(wfs, dcNum, 200);

        // Randomize them now for testing.
        await changeWFSPerms(wfs, "RAND", "USER", true);
        await changeWFSSTSPerms(wfs, "RAND", "USER", true);

        for (const wf of wfs) {
            const sts = wf.stages;

            for (let i = 0; i < stNum; i++) {
                // Choose a random stage to delete.
                const idtd = Math.floor(Math.random() * sts.length);
                const sttd = sts[idtd];
                const seq = sttd.sequenceId;
                let docs = null;

                // Only change locally if we expect it to be deleted remotely too.
                if (wf.permission === DBConstants.WRITE) {
                    docs = sttd.documents;

                    // Documents move to first stage.
                    if (idtd !== 0) {
                        for (const dc of docs) {
                            dc.stage = sts[0];
                        }

                        // Delete the stage from our 'local' copy.
                        sts.splice(idtd, 1);

                        // Move documents to first stage.
                        sts[0].documents = sts[0].documents.concat(docs);
                    } else {
                        for (const dc of docs) {
                            dc.stage = null;
                            dc.workflow = null;
                        }

                        sts.splice(idtd, 1);
                    }

                    // If there is only one stage left, we will have just deleted it,
                    // so nothing to fix.
                    if (sts.length > 1) {
                        // Fix sequence numbers.
                        for (let j = 0; j < sts.length; j++) {
                            sts[j].sequenceId = j + 1;
                        }
                    }
                }

                const resp = await request(app)
                                   .delete(`/api/workflows/${wf.id}/stages/${sttd.id}`)
                                   .set("User-Id", `${usr.id}`);

                expect(resp).not.toBeUndefined();
                const strs = resp.body;

                // Stage permissions depend on workflow.
                if (wf.permission === DBConstants.READ) {
                    const stdb = await stRep.findOne(sttd.id);

                    expect(resp.status).toEqual(403);
                    expect(stdb).not.toBeUndefined();

                    // Should have the same sequence ID if it wasn't deleted.
                    await verifySTDB(sttd, wf, seq);
                } else {
                    await verifySTResps(sts, strs, wf, true, "ST");
                    await verifySTDeleted(sttd, sts);

                    if (idtd !== 0) {
                        await verifyDCSInST(docs, sts[0]);
                    } else {
                        await verifyDCSInST(docs, null);
                    }
                }
            }
        }
    });

    it("Test deleting stages with documents, group permissions.", async () => {
        const wfNum = 3;
        const stNum = 5;
        const dcNum = 3;

        // WRITE permissions initially to be able to add stages.
        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);
        await addStagesToWFS(wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(wfs, dcNum, 200);

        // Randomize to group permissions for both workflows and stages.
        await changeWFSPermsToGroup(wfs);
        await changeWFSSTPermToGroup(wfs);

        for (const wf of wfs) {
            const sts = wf.stages;

            for (let i = 0; i < stNum; i++) {
                // Choose a random stage to delete.
                const idtd = Math.floor(Math.random() * sts.length);
                const sttd = sts[idtd];
                const seq = sttd.sequenceId;
                let docs = null;

                // Only change locally if we expect it to be deleted remotely too.
                if (wf.permission === DBConstants.WRITE) {
                    docs = sttd.documents;

                    // Documents move to first stage.
                    if (idtd !== 0) {
                        for (const dc of docs) {
                            dc.stage = sts[0];
                        }

                        // Delete the stage from our 'local' copy.
                        sts.splice(idtd, 1);

                        // Move documents to first stage.
                        sts[0].documents = sts[0].documents.concat(docs);
                    } else {
                        for (const dc of docs) {
                            dc.stage = null;
                            dc.workflow = null;
                        }

                        sts.splice(idtd, 1);
                    }

                    // If there is only one stage left, we will have just deleted it,
                    // so nothing to fix.
                    if (sts.length > 1) {
                        // Fix sequence numbers.
                        for (let j = 0; j < sts.length; j++) {
                            sts[j].sequenceId = j + 1;
                        }
                    }
                }

                const resp = await request(app)
                                   .delete(`/api/workflows/${wf.id}/stages/${sttd.id}`)
                                   .set("User-Id", `${usr.id}`);

                expect(resp).not.toBeUndefined();
                const strs = resp.body;

                // Stage permissions depend on workflow.
                if (wf.permission === DBConstants.READ) {
                    const stdb = await stRep.findOne(sttd.id);

                    expect(resp.status).toEqual(403);
                    expect(stdb).not.toBeUndefined();

                    // Should have the same sequence ID if it wasn't deleted.
                    await verifySTDB(sttd, wf, seq);
                } else {
                    await verifySTResps(sts, strs, wf, true, "ST");
                    await verifySTDeleted(sttd, sts);

                    if (idtd !== 0) {
                        await verifyDCSInST(docs, sts[0]);
                    } else {
                        await verifyDCSInST(docs, null);
                    }
                }
            }
        }
    });
});

describe("PUT /:wid/stages/:sid", () => {
    it("Test updating stages in different workflows.", async () => {
        const wfNum = 3;
        const stNum = 5;
        const dcNum = 3;

        // WRITE permissions initially to be able to add stages.
        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);
        await addStagesToWFS(wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(wfs, dcNum, 200);

        for (let i = 0; i < wfNum; i++) {
            for (let j = 0; j < stNum; j++) {
                const st = wfs[i].stages[j];
                st.name = st.name + "_NEW";
                st.description = st.name + "_DESC";

                const resp = await request(app)
                                   .put(`/api/workflows/${wfs[i].id}/stages/${st.id}`)
                                   .send(st)
                                   .set("User-Id", `${usr.id}`);

                expect(resp).not.toBeUndefined();
                expect(resp.status).toEqual(200);

                const str = resp.body;
                await verifySTResp(st, str, wfs[i], false, "ST");
                await verifySTDB(st, wfs[i], st.sequenceId);
                await verifySTInWF(str, wfs[i]);
                await verifyDCSInST(st.documents, str);
            }
       }
    });

    it("Test updating stages with mixed user permissions.", async () => {
        const wfNum = 3;
        const stNum = 5;
        const dcNum = 3;

        // WRITE permissions initially to be able to add stages.
        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);
        await addStagesToWFS(wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(wfs, dcNum, 200);

        await changeWFSPerms(wfs, "RAND", "USER", true);
        await changeWFSSTSPerms(wfs, "RAND", "USER", true);

        for (let i = 0; i < wfNum; i++) {
            for (let j = 0; j < stNum; j++) {
                const st = wfs[i].stages[j];
                const stbk = JSON.parse(JSON.stringify(st));

                st.name = st.name + "_NEW";
                st.description = st.name + "_DESC";

                const resp = await request(app)
                                   .put(`/api/workflows/${wfs[i].id}/stages/${st.id}`)
                                   .send(st)
                                   .set("User-Id", `${usr.id}`);

                expect(resp).not.toBeUndefined();
                const str = resp.body;

                if (wfs[i].permission === DBConstants.READ) {
                    expect(resp.status).toEqual(403);

                    await verifySTDB(stbk, wfs[i], stbk.sequenceId);
                    await verifySTInWF(stbk, wfs[i]);
                    await verifyDCSInST(stbk.documents, stbk);
                } else {
                    expect(resp.status).toEqual(200);

                    await verifySTResp(st, str, wfs[i], false, "ST");
                    await verifySTDB(st, wfs[i], st.sequenceId);
                    await verifySTInWF(str, wfs[i]);
                    await verifyDCSInST(st.documents, str);
                }
            }
       }
    });

    it("Test updating stages with mixed group permissions.", async () => {
        const wfNum = 3;
        const stNum = 5;
        const dcNum = 3;

        // WRITE permissions initially to be able to add stages.
        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);
        await addStagesToWFS(wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(wfs, dcNum, 200);

        await changeWFSPermsToGroup(wfs);
        await changeWFSSTPermToGroup(wfs);

        for (let i = 0; i < wfNum; i++) {
            for (let j = 0; j < stNum; j++) {
                const st = wfs[i].stages[j];
                const stbk = JSON.parse(JSON.stringify(st));

                st.name = st.name + "_NEW";
                st.description = st.name + "_DESC";

                const resp = await request(app)
                                   .put(`/api/workflows/${wfs[i].id}/stages/${st.id}`)
                                   .send(st)
                                   .set("User-Id", `${usr.id}`);

                expect(resp).not.toBeUndefined();
                const str = resp.body;

                if (wfs[i].permission === DBConstants.READ) {
                    expect(resp.status).toEqual(403);

                    await verifySTDB(stbk, wfs[i], stbk.sequenceId);
                    await verifySTInWF(stbk, wfs[i]);
                    await verifyDCSInST(stbk.documents, stbk);
                } else {
                    expect(resp.status).toEqual(200);

                    await verifySTResp(st, str, wfs[i], false, "ST");
                    await verifySTDB(st, wfs[i], st.sequenceId);
                    await verifySTInWF(str, wfs[i]);
                    await verifyDCSInST(st.documents, str);
                }
            }
       }
    });
});

// ----------------------------------------------------------------------------------
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |                                 DOCUMENT TESTS                                 |
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// ----------------------------------------------------------------------------------

describe("POST /api/documents", () => {
    it("Test creating documents with permissions.", async () => {
        const wfNum = 3;
        const stNum = 5;
        const dcNum = 1;

        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);
        await addStagesToWFS(wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(wfs, dcNum, 200);
    });

    it("Test creating documents in stages without permissions.", async () => {
        const wfNum = 2;
        const stNum = 3;
        const dcNum = 5;

        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);
        await addStagesToWFS(wfs, stNum, 200, "READ", "RAND", false, "ST");
        await addDocsToWFSStages(wfs, dcNum, 403);
    });

    it("Test creating a document in a workflow with no stages.", async () => {
        const wfNum = 2;

        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);

        for (const wf of wfs) {
            const dc = new NRDocument();
            dc.id = dcSeq;
            dcSeq++;
            dc.name = Guid.create().toString();
            dc.description = dc.name + "_DESC";
            dc.workflow = wf;

            const resp = await request(app)
                               .post(`/api/documents/`)
                               .send(dc)
                               .set("User-Id", `${usr.id}`);

            expect(resp).not.toBeUndefined();
            expect(resp.status).toEqual(403);
        }
    });

    it("Test passing no stage defaults to putting document in first stage.", async () => {
        const wfNum = 2;
        const stNum = 3;

        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);
        await addStagesToWFS(wfs, stNum, 200, "WRITE", "RAND", false, "ST");

        for (const wf of wfs) {
            const dc = new NRDocument();
            dc.id = dcSeq;
            dcSeq++;
            dc.name = Guid.create().toString();
            dc.description = dc.name + "_DESC";
            dc.workflow = wf;

            const resp = await request(app)
                               .post(`/api/documents/`)
                               .send(dc)
                               .set("User-Id", `${usr.id}`);

            expect(resp).not.toBeUndefined();
            expect(resp.status).toEqual(200);

            const dcr = resp.body;

            expect(dcr.stage.id).toEqual(wf.stages[0].id);
        }
    });
});

describe("GET /api/documents", () => {
    it("Test getting all documents", async () => {
        const wfNum = 2;
        const stNum = 3;
        const dcNum = 5;

        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);
        await addStagesToWFS(wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(wfs, dcNum, 200);

        const expDocNum = wfNum * stNum * dcNum;

        const resp = await request(app)
                           .get("/api/documents")
                           .set("User-Id", `${usr.id}`);

        expect(resp).not.toBeUndefined();
        expect(resp.status).toEqual(200);

        const dcrs: NRDocument[] = resp.body;
        expect(dcrs.length).toEqual(expDocNum);

        for (const wf of wfs) {
            for (const st of wf.stages) {
                for (let i = 0; i < dcNum; i++) {
                    const dc = st.documents[i];
                    const dch = dcrs.find((x) => x.id === dc.id);

                    await verifyDCDB(dc, st, wf);
                    await verifyDCDB(dch, st, wf);
                    await verifyDCResp(dc, dch, st, wf);
                }
            }
        }
    });
});

describe("GET /api/documents/user", () => {
    it("Test getting all documents that the logged in user has permissions to edit.", async () => {
        const wfNum = 7;
        const stNum = 3;
        const dcNum = 1;

        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);
        await addStagesToWFS(wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(wfs, dcNum, 200);

        const grps = [];
        for (let i = 0; i < 4; i++) {
            grps.push(await addUserToGroup(Guid.create().toString(), usr, 200));
        }

        // Clear created permissions from baseline data creation.
        await clearAllPermissions();

        let expDocs: NRDocument[] = [];
        let ind = 0;

        // grps[0] has READ permissions on first workflow, no additions.
        await setWFPermForGroup(grps[ind], wfs[ind], "READ", 200);
        ind++;

        // grps[1] has WRITE permissions on the first two stages of the second workflow.
        // Addition for the documents in each stage.
        await setSTPermForGroup(grps[ind], wfs[ind].stages[0], "WRITE", 200);
        await setSTPermForGroup(grps[ind], wfs[ind].stages[1], "WRITE", 200);
        expDocs = expDocs.concat(wfs[ind].stages[0].documents);
        expDocs = expDocs.concat(wfs[ind].stages[1].documents);
        ind++;

        // grps[2] has WRITE permissions on third workflow, no additions.
        await setWFPermForGroup(grps[ind], wfs[ind], "WRITE", 200);
        ind++;

        // user has WRITE permissions on fourth workflow, no additions.
        await changeWFPerm(wfs[ind], "WRITE", "USER", false);
        ind++;

        // user has READ permissions on fifth workflow, no additions.
        await changeWFPerm(wfs[ind], "READ", "USER", false);
        ind++;

        // user has WRITE permissions on the first two stages of the sixth workflow.
        // Addition for the documents in each stage.
        await changeSTPerm(wfs[ind].stages[0], "WRITE", "USER", false);
        await changeSTPerm(wfs[ind].stages[1], "WRITE", "USER", false);
        expDocs = expDocs.concat(wfs[ind].stages[0].documents);
        expDocs = expDocs.concat(wfs[ind].stages[1].documents);
        ind++;

        // 'user' has mixed permissions for stages in seventh workflow.
        // Workflow itself needs to be READ.
        await changeWFPerm(wfs[ind], "READ", "USER", false);
        for (let j = 0; j < stNum; j++) {
            if (j % 2 === 0) {
                await changeSTPerm(wfs[ind].stages[j], "READ", "USER", false);
            } else {
                // Addition for the documents in each stage with WRITE permissions.
                await changeSTPerm(wfs[ind].stages[j], "WRITE", "USER", false);
                expDocs = expDocs.concat(wfs[ind].stages[j].documents);
            }
        }

        const resp = await request(app)
                           .get("/api/documents/user")
                           .set("User-Id", `${usr.id}`);

        expect(resp).not.toBeUndefined();
        expect(resp.status).toEqual(200);

        const dcrs = resp.body;
        expect(dcrs.length).toEqual(expDocs.length);

        // Sort by ID for easy comparisons.
        dcrs.sort((a: NRDocument, b: NRDocument) => a.id - b.id);
        expDocs.sort((a: NRDocument, b: NRDocument) => a.id - b.id);

        // Verify we got the right documents back.
        for (let i = 0; i < expDocs.length; i++) {
            expect(dcrs[i].id).toEqual(expDocs[i].id);
        }
    });
});

describe("GET /api/documents/:did", () => {
    it("Test getting individual documents.", async () => {
        const wfNum = 5;
        const stNum = 3;
        const dcNum = 2;

        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);
        await addStagesToWFS(wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(wfs, dcNum, 200);

        // Now randomize the stage permissions.
        await changeWFSSTSPerms(wfs, "RAND", "USER", true);
        await changeWFSDCSPermToMatchSTS(wfs);

        for (const wf of wfs) {
            for (const st of wf.stages) {
                for (const dc of st.documents) {
                    const resp = await request(app)
                                       .get(`/api/documents/${dc.id}`)
                                       .set("User-Id", `${usr.id}`);

                    expect(resp).not.toBeUndefined();
                    expect(resp.status).toEqual(200);

                    const dcr = resp.body;

                    await verifyDCResp(dc, dcr, st, wf);
                }
            }
        }
    });
});

describe("GET /api/documents/author/:aid", () => {
    it("Test getting all documents written by a particular author.", async () => {
        const wfNum = 5;
        const stNum = 3;
        const dcNum = 2;

        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);
        await addStagesToWFS(wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(wfs, dcNum, 200);

        // Change the user and create more documents.
        usr = await createUser();

        // Give new user WRITE permissions on the existing stages.
        await changeWFSSTSPerms(wfs, "WRITE", "USER", false);

        // Add documents created by this user.
        await addDocsToWFSStages(wfs, dcNum, 200);

        const expDocNum = wfNum * stNum * dcNum;

        const resp = await request(app)
                           .get(`/api/documents/author/${usr.id}`)
                           .set("User-Id", `${usr.id}`);

        expect(resp).not.toBeUndefined();
        expect(resp.status).toEqual(200);

        const usdcs = resp.body;

        expect(usdcs).toHaveLength(expDocNum);
    });
});

describe("GET /api/documents/stage/:sid", () => {
    it("Test getting all documents in a certain stage.", async () => {
        const wfNum = 5;
        const stNum = 3;
        const dcNum = 2;

        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);
        await addStagesToWFS(wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(wfs, dcNum, 200);

        for (const wf of wfs) {
            for (const st of wf.stages) {
                const resp = await request(app)
                                  .get(`/api/documents/stage/${st.id}`)
                                  .set("User-Id", `${usr.id}`);

                expect(resp).not.toBeUndefined();
                expect(resp.status).toEqual(200);

                const dcs: NRDocument[] = resp.body;

                expect(dcs).toHaveLength(dcNum);

                for (const dc of dcs) {
                    await verifyDCInST(dc, st);
                }

            }
        }
    });
});

describe("GET /api/documents/workflow/:wid", () => {
    it("Test getting all documents in a certain workflow.", async () => {
        const wfNum = 5;
        const stNum = 3;
        const dcNum = 2;

        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);
        await addStagesToWFS(wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(wfs, dcNum, 200);

        const expDocNum = stNum * dcNum;

        for (const wf of wfs) {
            const resp = await request(app)
                                .get(`/api/documents/workflow/${wf.id}`)
                                .set("User-Id", `${usr.id}`);

            expect(resp).not.toBeUndefined();
            expect(resp.status).toEqual(200);

            const dcs: NRDocument[] = resp.body;

            expect(dcs).toHaveLength(expDocNum);

            for (const st of wf.stages) {
                for (const dc of st.documents) {
                    const dch = dcs.find((x) => x.id === dc.id);
                    await verifyDCInST(dch, st);
                }
            }
        }
    });
});

describe("GET /api/documents/orphan", () => {
    it("Test getting all orphan documents.", async () => {
        const wfNum = 5;
        const stNum = 3;
        const dcNum = 2;

        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);
        await addStagesToWFS(wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(wfs, dcNum, 200);

        let expDocNum = 0;

        for (const wf of wfs) {
            // Delete each workflow, causing documents to become orphans.
            let resp = await request(app)
                             .delete(`/api/workflows/${wf.id}`)
                             .set("User-Id", `${usr.id}`);

            expect(resp).not.toBeUndefined();
            expect(resp.status).toEqual(204);

            expDocNum += stNum * dcNum;

            resp = await request(app)
                         .get(`/api/documents/all/orphan/docs`)
                         .set("User-Id", `${usr.id}`);

            expect(resp).not.toBeUndefined();
            expect(resp.status).toEqual(200);

            const odcs: NRDocument[] = resp.body;
            expect(odcs).toHaveLength(expDocNum);
        }
    });
});

describe("PUT /api/documents/:did", () => {
    it("Test updating documents with mixed permissions.", async () => {
        const wfNum = 5;
        const stNum = 3;
        const dcNum = 2;

        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);
        await addStagesToWFS(wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(wfs, dcNum, 200);
        await changeWFSSTSPerms(wfs, "RAND", "USER", true);

        for (const wf of wfs) {
            for (const st of wf.stages) {
                for (const dc of st.documents) {
                    const ndc = JSON.parse(JSON.stringify(dc));
                    ndc.name = "NEW_" + Guid.create().toString();
                    ndc.description = ndc.name + "_DESC";

                    const resp = await request(app)
                                       .put(`/api/documents/${dc.id}`)
                                       .send(ndc)
                                       .set("User-Id", `${usr.id}`);

                    expect(resp).not.toBeUndefined();

                    const dcr = resp.body;

                    if (st.permission === DBConstants.WRITE) {
                        expect(resp.status).toEqual(200);

                        await verifyDCResp(ndc, dcr, st, wf);
                    } else {
                        expect(resp.status).toEqual(403);
                    }
                }
            }
        }
    });
});

describe("DELETE /api/documents/:did", () => {
    it("Test deleting documents with mixed permissions.", async () => {
        const wfNum = 5;
        const stNum = 3;
        const dcNum = 2;

        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);
        await addStagesToWFS(wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(wfs, dcNum, 200);
        await changeWFSSTSPerms(wfs, "RAND", "USER", true);

        for (const wf of wfs) {
            for (const st of wf.stages) {
                for (const dc of st.documents) {
                    const resp = await request(app)
                                       .delete(`/api/documents/${dc.id}`)
                                       .set("User-Id", `${usr.id}`);

                    expect(resp).not.toBeUndefined();

                    if (st.permission === DBConstants.WRITE) {
                        expect(resp.status).toEqual(204);

                        await verifyDCDeleted(dc, true);
                    } else {
                        expect(resp.status).toEqual(403);

                        await verifyDCDB(dc, st, wf);
                    }
                }
            }
        }
    });
});

describe("PUT /api/documents/:did/next", () => {
    it("Test moving documents to the next stage with mixed user permissions.", async () => {
        const wfNum = 5;
        const stNum = 5;
        const dcNum = 5;

        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);
        await addStagesToWFS(wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(wfs, dcNum, 200);

        await changeWFSSTSPerms(wfs, "RAND", "USER", true);

        for (const wf of wfs) {
            for (const st of wf.stages) {
                for (const dc of st.documents) {
                    let nst;

                    // Update local copies if we expect it to actually be moved.
                    if ((st.permission === DBConstants.WRITE) && (st.sequenceId !== stNum)) {
                        nst = await stRep.findOne({ where: { sequenceId: st.sequenceId + 1,
                                                             workflow: wf } });
                        const nstp = await stUSRep.findOne({ where: { stage: nst,
                                                                      user: usr } });

                        dc.stage = nst;
                        dc.permission = nstp.access;
                        nst.permission = nstp.access;
                    }

                    const resp = await request(app)
                                       .put(`/api/documents/${dc.id}/next`)
                                       .set("User-Id", `${usr.id}`);

                    expect(resp).not.toBeUndefined();

                    const dcr = resp.body;

                    if (st.permission === DBConstants.WRITE) {
                        expect(resp.status).toEqual(200);

                        const dcdb = await dcRep.findOne(dcr.id, { relations: ["stage"] });

                        // Can't move past last stage.
                        if (st.sequenceId !== stNum) {
                            expect(dcdb.stage.sequenceId).toEqual(nst.sequenceId);
                            await verifyDCResp(dc, dcr, nst, wf);
                        } else {
                            expect(dcdb.stage.sequenceId).toEqual(st.sequenceId);
                            await verifyDCResp(dc, dcr, st, wf);
                        }

                    } else {
                        // Nothing returned if we don't have permissions.
                        expect(resp.status).toEqual(403);
                    }
                }
            }
        }
    });

    it("Test moving documents to the next stage with mixed group permissions.", async () => {
        const wfNum = 5;
        const stNum = 5;
        const dcNum = 5;

        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);
        await addStagesToWFS(wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(wfs, dcNum, 200);

        // Randomize stage permissions for groups.
        await changeWFSSTPermToGroup(wfs);

        for (const wf of wfs) {
            for (const st of wf.stages) {
                for (const dc of st.documents) {
                    let nst;

                    // Update local copies if we expect it to actually be moved.
                    if ((st.permission === DBConstants.WRITE) && (st.sequenceId !== stNum)) {
                        nst = await stRep.findOne({ where: { sequenceId: st.sequenceId + 1,
                                                             workflow: wf } });
                        const nstp = await stPRep.findOne({ where: { stage: nst,
                                                                     user: usr } });

                        dc.stage = nst;
                        dc.permission = nstp.access;
                        nst.permission = nstp.access;
                    }

                    const resp = await request(app)
                                       .put(`/api/documents/${dc.id}/next`)
                                       .set("User-Id", `${usr.id}`);

                    expect(resp).not.toBeUndefined();

                    const dcr = resp.body;

                    if (st.permission === DBConstants.WRITE) {
                        expect(resp.status).toEqual(200);

                        const dcdb = await dcRep.findOne(dcr.id, { relations: ["stage"] });

                        // Can't move past last stage.
                        if (st.sequenceId !== stNum) {
                            expect(dcdb.stage.sequenceId).toEqual(nst.sequenceId);
                            await verifyDCResp(dc, dcr, nst, wf);
                        } else {
                            expect(dcdb.stage.sequenceId).toEqual(st.sequenceId);
                            await verifyDCResp(dc, dcr, st, wf);
                        }

                    } else {
                        // Nothing returned if we don't have permissions.
                        expect(resp.status).toEqual(403);
                    }
                }
            }
        }
    });
});

describe("PUT /api/documents/:did/prev", () => {
    it("Test moving documents to the previous stage with mixed user permissions.", async () => {
        const wfNum = 5;
        const stNum = 5;
        const dcNum = 5;

        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);
        await addStagesToWFS(wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(wfs, dcNum, 200);

        await changeWFSSTSPerms(wfs, "RAND", "USER", true);

        for (const wf of wfs) {
            for (const st of wf.stages) {
                for (const dc of st.documents) {
                    let nst;

                    // Update local copies if we expect it to actually be moved.
                    if ((st.permission === DBConstants.WRITE) && (st.sequenceId !== 1)) {
                        nst = await stRep.findOne({ where: { sequenceId: st.sequenceId - 1,
                                                             workflow: wf } });
                        const nstp = await stUSRep.findOne({ where: { stage: nst,
                                                                      user: usr } });

                        dc.stage = nst;
                        dc.permission = nstp.access;
                        nst.permission = nstp.access;
                    }

                    const resp = await request(app)
                                       .put(`/api/documents/${dc.id}/prev`)
                                       .set("User-Id", `${usr.id}`);

                    expect(resp).not.toBeUndefined();

                    const dcr = resp.body;

                    if (st.permission === DBConstants.WRITE) {
                        expect(resp.status).toEqual(200);

                        const dcdb = await dcRep.findOne(dcr.id, { relations: ["stage"] });

                        // Can't move past last stage.
                        if (st.sequenceId !== 1) {
                            expect(dcdb.stage.sequenceId).toEqual(nst.sequenceId);
                            await verifyDCResp(dc, dcr, nst, wf);
                        } else {
                            expect(dcdb.stage.sequenceId).toEqual(st.sequenceId);
                            await verifyDCResp(dc, dcr, st, wf);
                        }

                    } else {
                        // Nothing returned if we don't have permissions.
                        expect(resp.status).toEqual(403);
                    }
                }
            }
        }
    });

    it("Test moving documents to the next stage with mixed group permissions.", async () => {
        const wfNum = 5;
        const stNum = 5;
        const dcNum = 5;

        const wfs = await reqWFSGetResps(wfNum, "WRITE", 200);
        await addStagesToWFS(wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(wfs, dcNum, 200);

        // Randomize stage permissions for groups.
        await changeWFSSTPermToGroup(wfs);

        for (const wf of wfs) {
            for (const st of wf.stages) {
                for (const dc of st.documents) {
                    let nst;

                    // Update local copies if we expect it to actually be moved.
                    if ((st.permission === DBConstants.WRITE) && (st.sequenceId !== 1)) {
                        nst = await stRep.findOne({ where: { sequenceId: st.sequenceId - 1,
                                                             workflow: wf } });
                        const nstp = await stPRep.findOne({ where: { stage: nst,
                                                                     user: usr } });

                        dc.stage = nst;
                        dc.permission = nstp.access;
                        nst.permission = nstp.access;
                    }

                    const resp = await request(app)
                                       .put(`/api/documents/${dc.id}/prev`)
                                       .set("User-Id", `${usr.id}`);

                    expect(resp).not.toBeUndefined();

                    const dcr = resp.body;

                    if (st.permission === DBConstants.WRITE) {
                        expect(resp.status).toEqual(200);

                        const dcdb = await dcRep.findOne(dcr.id, { relations: ["stage"] });

                        // Can't move past last stage.
                        if (st.sequenceId !== 1) {
                            expect(dcdb.stage.sequenceId).toEqual(nst.sequenceId);
                            await verifyDCResp(dc, dcr, nst, wf);
                        } else {
                            expect(dcdb.stage.sequenceId).toEqual(st.sequenceId);
                            await verifyDCResp(dc, dcr, st, wf);
                        }

                    } else {
                        // Nothing returned if we don't have permissions.
                        expect(resp.status).toEqual(403);
                    }
                }
            }
        }
    });
});

// ----------------------------------------------------------------------------------
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |                                 GENERATE DATA                                  |
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// ----------------------------------------------------------------------------------

describe("Generate data, this should always be run last.", () => {
    it("Generate data for testing.", async () => {
        const usrNum = 25;
        const wfNum = 10;
        const dcNum = 4;

        // Create an admin user.
        const adminUserNew = new NRUser();
        adminUserNew.firstName = "Administrative";
        adminUserNew.lastName = "User";
        adminUserNew.userName = "admin";
        adminUserNew.email = "admin@newsroom.com";

        const adminUser = await usrRep.save(adminUserNew);
        usr = adminUser;

        // Create users.
        const createdUsers: NRUser[] = [];
        const usrFirst = ['Greg', 'Samantha', 'Peter', 'Joe', 'Andrew', 'Justin', 'Katherine', 'Jake', 'Conner', 'Youssef', 'Kyle', 'Clark'];
        const usrLast = ['Smith', 'Johnson', 'French', 'King', 'Graves', 'Bradley', 'Wright', 'Parker', 'Hunt', 'Nelson'];
        for (let i = 0; i < usrNum; i++) {
            // Make sure that usernames are unique.
            const usrNew = new NRUser();
            do {
                usrNew.firstName = usrFirst[Math.round(Math.random() * usrFirst.length)];
                usrNew.lastName = usrLast[Math.round(Math.random() * usrLast.length)];
                usrNew.userName = usrNew.firstName.charAt(0).toLowerCase() + usrNew.lastName.toLowerCase();
            } while (createdUsers.findIndex(x => x.userName === usrNew.userName) !== -1);

            usrNew.email = usrNew.userName + '@newsroom.com';

            const resp = await request(app)
                              .post("/api/users")
                              .send(usrNew)
                              .set("User-Id", `${usr.id}`);
            
            expect(resp.status).toEqual(200);
            createdUsers.push(resp.body);
        }

        // Create workflows.
        const createdWorkflows: NRWorkflow[] = [];
        const wfFirst = [ 'World', 'Sports', 'Fashion', 'Opinion', 'Health', 'Food', 'Travel', 'Tech', 'Arts', 'Business'];
        const wfLast = ['Articles', 'Blogs', 'Papers', 'Tidbits', 'Pieces'];
        for (let i = 0; i < wfNum; i++) {
            // Make sure workflow names are unique.
            const wfNew = new NRWorkflow();
            do {
                wfNew.name = wfFirst[Math.round(Math.random() * wfFirst.length)] + wfLast[Math.round(Math.random() * wfLast.length)] 
            } while (createdWorkflows.findIndex(x => x.name === wfNew.name) !== -1);

            wfNew.description = 'A workflow for ' + wfNew.name + '.';
            wfNew.permission = 1;

            const resp = await request(app)
                               .post("/api/workflows")
                               .send(wfNew)
                               .set("User-Id", `${usr.id}`);
            
            expect(resp.status).toEqual(200);
            createdWorkflows.push(resp.body);
        }

        // Create stages.
        const stFirstDraft = ['First Draft', 'The first draft of an article, intended to flesh out ideas and get them on paper.'];
        const stSecondDraft = ['Second Draft', 'A more formalized draft with cohesive writing and progress towards a more finished product.'];
        const stFactCheck = ['Fact Check', 'Pertaining to articles that involve real-world facts or statistics, this stage serves to the author of the article and forces them to double check their own facts.'];
        const stPeerReview = ['Peer Review', 'Before moving onto the edit phase, get feedback from others about the general topic of your piece without them actually looking at it.'];
        const stFirstEdit = ['First Edit', 'The first edit phase, focused more on ideas and overall article flow rather than formatting and grammatical errors.'];
        const stSecondEdit = ['Second Edit', 'The second edit phase, focused more on formatting and grammatical errors as well as final checks.'];
        const stFinalReview = ['Final Review', 'The final review meant to hopefully catch any mistakes that were missed earlier.'];
        const stReadyToPublish = ['Ready to Publish', 'The document has been fully finalized and is ready to publish.'];
        const stDefault = [stFirstDraft, stSecondDraft, stFactCheck, stPeerReview, stFirstEdit, stSecondEdit, stFinalReview, stReadyToPublish];
        const stUrgent = [stFirstDraft, stFactCheck, stFirstEdit, stFinalReview, stReadyToPublish];
        const stOpinion = [stFirstDraft, stSecondDraft, stPeerReview, stFirstEdit, stFinalReview, stReadyToPublish];
        for (const wf of createdWorkflows) {
            let choice;
            if ((wf.name.toLowerCase().search('opinion') === 0 ) || (wf.name.toLowerCase().search('blog') === 0 ) || (wf.name.toLowerCase().search('fashion') === 0 )) {
                choice = stOpinion;
            } else if ((wf.name.toLowerCase().search('world') === 0 ) || (wf.name.toLowerCase().search('business') === 0 )) {
                choice = stUrgent;
            } else {
                choice = stDefault;
            }

            for (const st of choice) {
                const stNew = new NRStage();
                stNew.name = st[0];
                stNew.description = st[1];
                stNew.permission = 1;

                const resp = await request(app)
                                   .post(`/api/workflows/${wf.id}/stages`)
                                   .send(stNew)
                                   .set("User-Id", `${usr.id}`);

                expect(resp.status).toEqual(200);
                wf.stages.push(resp.body);
            }
        }
    });
});


// ----------------------------------------------------------------------------------
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |                                  HELPER FUNCTIONS                              |
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// ----------------------------------------------------------------------------------

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

async function reqWFSGetResps(num: number, priv: string, status: number) {
    const wfrs: NRWorkflow[] = [];

    for (let i = 0; i < num; i++) {
        wfrs.push(await reqWFGetResp(priv, status));
    }

    return wfrs;
}

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
}

async function addStagesToWF(wf: NRWorkflow, numStages: number, status: number, perm: string,
                             pos: string, verifyDocs: boolean, whichPerm: string) {
    for (let i = 0; i < numStages; i++) {
        await addStageToWF(wf, status, perm, pos, verifyDocs, whichPerm);
    }
}

async function addStagesToWFS(wfs: NRWorkflow[], numStages: number, status: number, perm: string,
                              pos: string, verifyDocs: boolean, whichPerm: string) {
    for (const wf of wfs) {
        await addStagesToWF(wf, numStages, status, perm, pos, verifyDocs, whichPerm);
    }
}

async function changeWFPerm(wf: NRWorkflow, perm: string, type: string, exists: boolean) {
    let priv;
    if (perm === "RAND") {
        priv = Math.round(Math.random());
    } else {
        priv = (perm === "WRITE") ? DBConstants.WRITE : DBConstants.READ;
    }

    if (type === "USER") {
        const resp = await request(app)
                        .put(`/api/users/${usr.id}/wfperm/${wf.id}/${priv}`)
                        .set("User-Id", `${usr.id}`);

        expect(resp).not.toBeUndefined();
        expect(resp.status).toEqual(200);

        const wfup = resp.body;
        expect(wfup.access).toEqual(priv);

        const wfusdb = await wfUSRep.findOne(wfup.id, { relations: ["workflow"] });
        expect(wfusdb.workflow.id).toEqual(wf.id);
        expect(wfusdb.access).toEqual(priv);

        wf.permission = priv;
    } else if (type === "GROUP") {
        if (exists === false) {
            const grpName = Guid.create().toString();
            const grp = await addUserToGroup(grpName, usr, 200);
            await setWFPermForGroup(grp, wf, perm, 200);
        } else {
            const grpdb: NRWFPermission = await wfPRep.findOne({ where: { relations: ["role"],
                                                                          workflow: wf } });
            await setWFPermForGroup(grpdb.role, wf, perm, 200);
        }
    } else {
        expect(true).toEqual(false);
    }
}

async function changeWFSPerms(wfs: NRWorkflow[], perm: string, type: string, exists: boolean) {
    for (const wf of wfs) {
        await changeWFPerm(wf, perm, type, exists);
    }
}

async function changeWFSSTSPerms(wfs: NRWorkflow[], perm: string, type: string, exists: boolean) {
    for (const wf of wfs) {
        for (const st of wf.stages) {
            await changeSTPerm(st, perm, type, exists);
        }
    }
}

async function changeSTPerm(st: NRStage, perm: string, type: string, exists: boolean) {
    let priv;
    if (perm === "RAND") {
        priv = Math.round(Math.random());
    } else {
        priv = (perm === "WRITE") ? DBConstants.WRITE : DBConstants.READ;
    }

    if (type === "USER") {
        const resp = await request(app)
                        .put(`/api/users/${usr.id}/stperm/${st.id}/${priv}`)
                        .set("User-Id", `${usr.id}`);

        expect(resp).not.toBeUndefined();
        expect(resp.status).toEqual(200);

        const stup = resp.body;
        expect(stup.access).toEqual(priv);

        const stusdb = await stUSRep.findOne(stup.id, { relations: ["stage"] });
        expect(stusdb.stage.id).toEqual(st.id);
        expect(stusdb.access).toEqual(priv);

        st.permission = priv;
    } else if (type === "GROUP") {
        if (exists === false) {
            const grpName = Guid.create().toString();
            const grp = await addUserToGroup(grpName, usr, 200);
            await setSTPermForGroup(grp, st, perm, 200);
        } else {
            const grpdb: NRSTPermission = await stPRep.findOne({ where: { relations: ["role"],
                                                                          stage: st } });
            await setSTPermForGroup(grpdb.role, st, perm, 200);
        }
    } else {
        expect(true).toEqual(false);
    }
}

async function addDocsToStage(st: NRStage, numDoc: number, status: number) {
    if (st.documents === undefined) {
        st.documents = [];
    }

    for (let i = 0; i < numDoc; i++) {
        const dc = new NRDocument();
        dc.id = dcSeq;
        dcSeq++;

        dc.name = Guid.create().toString();
        dc.description = dc.name + "_DESC";

        // Get stages workflow first.
        const stwf = await stRep.findOne(st.id, { relations: ["workflow"] });
        const wfdb = stwf.workflow;
        dc.workflow = wfdb;
        dc.stage = st;
        dc.creator = usr;

        const resp = await request(app)
                           .post(`/api/documents/`)
                           .send(dc)
                           .set("User-Id", `${usr.id}`);

        expect(resp).not.toBeUndefined();
        expect(resp.status).toEqual(status);

        if (status === 200) {
            const dcr = resp.body;

            // It has to be WRITE if we got a 200.
            dc.permission = DBConstants.WRITE;

            await verifyDCResp(dc, dcr, st, wfdb);
            await verifyDCDB(dc, st, wfdb);

            st.documents.push(dcr);
        }
    }

    return st;
}

async function addDocsToStages(sts: NRStage[], num: number, status: number) {
    for (const st of sts) {
        await addDocsToStage(st, num, status);
    }
}

async function addDocsToWFSStages(wfs: NRWorkflow[], num: number, status: number) {
    for (const wf of wfs) {
        await addDocsToStages(wf.stages, num, status);
    }
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

    const grp = resp.body;

    expect(grp.id).toEqual(role.id);
    expect(grp.name).toEqual(role.name);

    return grp;
}

async function addUserToGroup(grp: string, targUsr: NRUser, status: number) {
    let role: NRRole;

    // See if the group exists, or create it.
    try {
        role = await rlRep.findOneOrFail({ where: { name: grp }});
    } catch (err) {
        role = await createGroup(200);
    }

    const resp = await request(app)
                        .put(`/api/users/${targUsr.id}/role/${role.id}`)
                        .set("User-Id", `${targUsr.id}`);

    expect(resp.status).not.toBeUndefined();
    expect(resp.status).toEqual(status);

    const grpr = resp.body;

    if (status === 200) {
        await verifyUserInGroup(grpr, role);
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

    let resPerm;
    if (perm === "RAND") {
        resPerm = Math.round(Math.random());
    } else {
        resPerm = (perm === "WRITE") ? DBConstants.WRITE : DBConstants.READ;
    }

    // Give permissions to the given workflow.
    const resp = await request(app)
                        .put(`/api/roles/${role.id}/workflow/${wf.id}`)
                        .send({ access: resPerm })
                        .set("User-Id", `${usr.id}`);
    expect(resp).not.toBeUndefined();
    expect(resp.status).toEqual(status);

    const wfpr = resp.body;
    expect(wfpr.access).toEqual(resPerm);

    const wfpdb = await wfPRep.findOne(wfpr.id, { relations: ["workflow"] });
    expect(wfpdb.workflow.id).toEqual(wf.id);
    expect(wfpdb.access).toEqual(resPerm);

    wf.permission = resPerm;
}

async function setSTPermForGroup(role: NRRole, st: NRStage, perm: string, status: number) {
    // See if the group exists, or create it.
    try {
        role = await rlRep.findOneOrFail({ where: { name: role.name }});
    } catch (err) {
        role = await createGroup(200);
    }

    let resPerm;
    if (perm === "RAND") {
        resPerm = Math.round(Math.random());
    } else {
        resPerm = (perm === "WRITE") ? DBConstants.WRITE : DBConstants.READ;
    }

    // Add the user to the group.
    const resp = await request(app)
                        .put(`/api/roles/${role.id}/stage/${st.id}`)
                        .send({access: resPerm})
                        .set("User-Id", `${usr.id}`);

    expect(resp).not.toBeUndefined();
    expect(resp.status).toEqual(status);

    const stpr = resp.body;
    expect(stpr.access).toEqual(resPerm);

    const stpdb = await stPRep.findOne(stpr.id, { relations: ["stage"] });
    expect(stpdb.stage.id).toEqual(st.id);
    expect(stpdb.access).toEqual(resPerm);

    st.permission = resPerm;
}

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

async function clearWFPermissions(wf: NRWorkflow) {
    await wfUSRep.createQueryBuilder()
                 .delete()
                 .from(NRWFUSPermission)
                 .where(`${DBConstants.WFUSPERM_TABLE}.workflowId = :wid`, { wid: wf.id })
                 .execute();

    await wfPRep.createQueryBuilder()
                .delete()
                .from(NRWFPermission)
                .where(`${DBConstants.WFPERM_TABLE}.workflowId = :wid`, { wid: wf.id })
                .execute();

    wf.permission = DBConstants.READ;

    if (wf.stages !== undefined) {
        for (const st of wf.stages) {
            await stUSRep.createQueryBuilder()
                         .delete()
                         .from(NRSTUSPermission)
                         .where(`${DBConstants.STUSPERM_TABLE}.stageId = :sid`, { sid: st.id })
                         .execute();

            await stPRep.createQueryBuilder()
                        .delete()
                        .from(NRSTPermission)
                        .where(`${DBConstants.STPERM_TABLE}.stageId = :sid`, { sid: st.id })
                        .execute();

            st.permission = DBConstants.READ;
        }
    }
 }

async function clearSTPermissions(st: NRStage) {
    await stUSRep.createQueryBuilder()
                    .delete()
                    .from(NRSTUSPermission)
                    .where(`${DBConstants.STUSPERM_TABLE}.stageId = :sid`, { sid: st.id })
                    .execute();

    await stPRep.createQueryBuilder()
                .delete()
                .from(NRSTPermission)
                .where(`${DBConstants.STPERM_TABLE}.stageId = :sid`, { sid: st.id })
                .execute();

    st.permission = DBConstants.READ;
}

async function clearSTSPermissions(sts: NRStage[]) {
    for (const st of sts) {
        await clearSTPermissions(st);
    }
}

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

async function changeWFSPermsToGroup(wfs: NRWorkflow[]) {
    // Change to group permissions.
    for (const wf of wfs) {
        await clearWFPermissions(wf);

        const perm = Math.round(Math.random());
        const priv = (perm === 1) ? "WRITE" : "READ";

        await changeWFPerm(wf, priv, "GROUP", false);
    }
}

async function changeSTSPermsToGroup(sts: NRStage[]) {
    // Change to group permissions.
    for (const st of sts) {
        await clearSTPermissions(st);

        const perm = Math.round(Math.random());
        const priv = (perm === 1) ? "WRITE" : "READ";

        await changeSTPerm(st, priv, "GROUP", false);
    }
}

async function changeWFSSTPermToGroup(wfs: NRWorkflow[]) {
    for (const wf of wfs) {
        await clearSTSPermissions(wf.stages);
        await changeSTSPermsToGroup(wf.stages);
    }

}

async function changeSTDCPermToMatchST(st: NRStage) {
    for (const dc of st.documents) {
        dc.permission = st.permission;
    }
}

async function changeSTSDCPermToMatchST(sts: NRStage[]) {
    for (const st of sts) {
        await changeSTDCPermToMatchST(st);
    }
}

async function changeWFSDCSPermToMatchSTS(wfs: NRWorkflow[]) {
    for (const wf of wfs) {
        await changeSTSDCPermToMatchST(wf.stages);
    }
}

async function createUser() {
    const us = new NRUser();
    us.id = usrSeq;
    usrSeq++;

    us.userName = "UN_" + Guid.create().toString();
    us.firstName = "FIRST_" + Guid.create().toString();
    us.lastName = "LAST_" + Guid.create().toString();
    us.email = Guid.create().toString() + "@newsroom.com";

    const resp = await request(app)
                       .post("/api/users")
                       .send(us)
                       .set("User-Id", `${usr.id}`);

    expect(resp).not.toBeUndefined();
    expect(resp.status).toEqual(200);

    const usrr = resp.body;
    const usdb = await usrRep.findOne(us.id);

    expect(usdb.userName).toEqual(us.userName);
    expect(usrr.userName).toEqual(us.userName);
    expect(usdb.firstName).toEqual(us.firstName);
    expect(usrr.firstName).toEqual(us.firstName);
    expect(usdb.lastName).toEqual(us.lastName);
    expect(usrr.lastName).toEqual(us.lastName);

    return usrr;
}

// ----------------------------------------------------------------------------------
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |                               VERIFICATION FUNCTIONS                           |
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// |--------------------------------------------------------------------------------|
// ----------------------------------------------------------------------------------

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

async function verifyWFSDB(wfs: NRWorkflow[]) {
    for (const wf of wfs) {
        await verifyWFDB(wf);
    }
}

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

async function verifyWFResps(wfs: NRWorkflow[], wfrs: NRWorkflow[], verifyStages: boolean) {
    expect(wfs.length).toEqual(wfrs.length);

    const wfss = wfs.sort((a: NRWorkflow, b: NRWorkflow) => a.id - b.id);
    const wfrss = wfrs.sort((a: NRWorkflow, b: NRWorkflow) => a.id - b.id);

    for (let i = 0; i < wfs.length; i++) {
        await verifyWFResp(wfss[i], wfrss[i], verifyStages);
    }
}

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
        const res = await permServ.getSTPermForUser(st, usr);
        expect(st.permission).toEqual(res);
    }

    if (st.documents !== undefined) {
        await verifyDCSDB(st.documents, st, wf);
    }
}

async function verifySTSDB(sts: NRStage[], wf: NRWorkflow) {
    expect(sts.length).toBeGreaterThan(0);

    let i = 1;

    const stss = sts.sort((a: NRStage, b: NRStage) => a.sequenceId - b.sequenceId);

    for (const st of stss) {
        await verifySTDB(st, wf, i);
        i += 1;
    }
}

async function verifyWFSSTSDB(wfs: NRWorkflow[]) {
    for (const wf of wfs) {
        await verifySTSDB(wf.stages, wf);
    }
}

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

async function verifySTResps(sts: NRStage[], strs: NRStage[], wf: NRWorkflow,
                             verifyDocs: boolean, whichPerm: string) {
    expect(sts.length).toEqual(strs.length);

    const stss = sts.sort((a: NRStage, b: NRStage) => a.sequenceId - b.sequenceId);
    const strss = strs.sort((a: NRStage, b: NRStage) => a.sequenceId - b.sequenceId);

    for (let i = 0; i < sts.length; i++) {
        await verifySTResp(stss[i], strss[i], wf, verifyDocs, whichPerm);
    }
}

async function verifyDCDB(dc: NRDocument, st: NRStage, wf: NRWorkflow) {
    await verifyDCInST(dc, st);

    const dcdb = await dcRep.findOne(dc.id);

    expect(dcdb).not.toBeUndefined();
    expect(dcdb.name).not.toBeUndefined();
    expect(dcdb.name).toEqual(dc.name);

    expect(dcdb.description).not.toBeUndefined();
    expect(dc.description).toEqual(dcdb.description);
}

async function verifyDCSDB(dcs: NRDocument[], st: NRStage, wf: NRWorkflow) {
    for (const dc of dcs) {
        await verifyDCDB(dc, st, wf);
    }
}

async function verifyDCResp(dc: NRDocument, dcr: NRDocument, st: NRStage, wf: NRWorkflow) {
    await verifyDCInST(dcr, st);

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

async function verifyDCResps(dcs: NRDocument[], dcrs: NRDocument[], st: NRStage, wf: NRWorkflow) {
    expect(dcs.length).toEqual(dcrs.length);

    for (let i = 0; i < dcs.length; i++) {
        await verifyDCResp(dcs[i], dcrs[i], st, wf);
    }
}

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

    expect(dcstid).not.toBeUndefined();
    expect(dcstid.val).not.toBeUndefined();
    expect(dcstid.val).toEqual(st.id);
}

async function verifyWFDeleted(wf: NRWorkflow, hadStages: boolean) {
    const wfdb = await wfRep.findOne(wf.id);
    expect(wfdb).toBeUndefined();

    const wfupdb = await wfUSRep.find({ where: { workflow: wf.id } });
    expect(wfupdb).toHaveLength(0);

    const wfpdb = await wfPRep.find({ where: { workflow: wf.id } });
    expect(wfpdb).toHaveLength(0);

    if (hadStages === true) {
        const stdb = await stRep.find({ where: { workflow: wf } });
        expect(stdb).toHaveLength(0);
        wf.stages = undefined;
    }

    if (wf.stages !== undefined) {
        for (const st of wf.stages) {
            await verifySTDeleted(st, wf.stages);
        }
    }
}

async function verifySTDeleted(st: NRStage, sts: NRStage[]) {
    const stdb = await stRep.findOne(st.id);
    expect(stdb).toBeUndefined();

    const stupdb = await stUSRep.find({ where: { stage: st.id } });
    expect(stupdb).toHaveLength(0);

    const stpdb = await stPRep.find({ where: { stage: st.id } });
    expect(stpdb).toHaveLength(0);

    // Check sequences for other stages.
    for (let i = 0; i < sts.length; i++) {
        const ostdb = await stRep.findOne(sts[i].id);

        expect(ostdb.sequenceId).toEqual(i + 1);
    }

    if (st.documents !== undefined) {
        for (const dc of st.documents) {
            await verifyDCDeleted(dc, false);
        }
    }
}

async function verifyDCDeleted(dc: NRDocument, del: boolean) {
    const dcdb = await dcRep.findOne(dc.id, { relations: ["workflow", "stage"] });

    if (del === true) {
        expect(dcdb).toBeUndefined();
    } else {
        // Documents don't actually get deleted when stages or workflows get deleted.
        expect(dcdb).not.toBeUndefined();

        if (dc.stage === null) {
            expect(dcdb.stage).toBeNull();
        } else {
            expect(dcdb.stage.id).toEqual(dc.stage.id);
        }

        if (dc.workflow === null) {
            expect(dcdb.workflow).toBeNull();
        } else {
            expect(dcdb.workflow.id).toEqual(dc.workflow.id);
        }
    }
}

async function verifyDCSInST(dcs: NRDocument[], st: NRStage) {
    for (const dc of dcs) {
        const dcdb = await dcRep.findOne(dc.id, { relations: ["stage"] });

        if (st === null) {
            expect(dcdb.stage).toBeNull();
        } else {
            expect(dcdb.stage.id).toEqual(st.id);
        }

    }
}
