import express from "express";
import { Guid } from "guid-typescript";
import request from "supertest";
import { Connection, getRepository, Repository } from "typeorm";

import App from "../app";
import { DBConstants, NRDocument, NRRole,
         NRStage, NRSTPermission, NRUser,
         NRWFPermission, NRWorkflow } from "../entity";
import { PermissionService } from "../services/PermissionService";

// TODO:
//   - Test validators.
//   - Verify creator, test CREATE permissions.
//   - Fix 413 for 1 workflow, 5 stages, 2 documents in each stage?
//   - Test comments return for a single document.

let app: express.Express;
let conn: Connection;

let adminUsr: NRUser;
let usr1: NRUser;
let usr2: NRUser;
let usr3: NRUser;
let usrRep: Repository<NRUser>;
let usrSeq: number;

let wfRep: Repository<NRWorkflow>;
let wfSeq: number;
let wfPRep: Repository<NRWFPermission>;
let wfPSeq: number;

let stRep: Repository<NRStage>;
let stSeq: number;
let stPRep: Repository<NRSTPermission>;
let stPSeq: number;

let dcRep: Repository<NRDocument>;
let dcSeq: number;

let rlRep: Repository<NRRole>;
let rlSeq: number;

let permServ: PermissionService;

// Setup.
beforeAll(async (done) => {
    // Configure without oauth, and no actual Google Document creation.
    app = await App.configure(false, false);

    // Can't have two active connections, steal from app.
    conn = App.getDBConnection();

    usrRep = getRepository(NRUser);

    wfRep = getRepository(NRWorkflow);
    wfPRep = getRepository(NRWFPermission);

    stRep = getRepository(NRStage);
    stPRep = getRepository(NRSTPermission);

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

    stSeq = 1;
    stPSeq = 1;

    dcSeq = 1;

    rlSeq = 1;

    adminUsr = new NRUser();
    adminUsr.id = usrSeq;
    usrSeq++;

    adminUsr.firstName = "Admin";
    adminUsr.lastName = "User";
    adminUsr.userName = "admin";
    adminUsr.email = "admin@newsroom.com";
    adminUsr.admin = "Y";
    await usrRep.save(adminUsr);

    usr1 = new NRUser();
    usr1.id = usrSeq;
    usrSeq++;

    usr1.firstName = "User";
    usr1.lastName = "One";
    usr1.userName = "uone";
    usr1.email = "uone@newsroom.com";
    usr1.admin = "N";
    await usrRep.save(usr1);

    usr2 = new NRUser();
    usr2.id = usrSeq;
    usrSeq++;

    usr2.firstName = "User";
    usr2.lastName = "Two";
    usr2.userName = "utwo";
    usr2.email = "utwo@newsroom.com";
    usr2.admin = "N";
    await usrRep.save(usr2);

    usr3 = new NRUser();
    usr3.id = usrSeq;
    usrSeq++;

    usr3.firstName = "User";
    usr3.lastName = "Three";
    usr3.userName = "uthree";
    usr3.email = "uthree@newsroom.com";
    usr3.admin = "N";
    await usrRep.save(usr3);

    jest.setTimeout(25000);
    done();
});

// Workflow tests.
describe("1. POST /api/workflows", () => {
    it("Test creating a single workflow as an administrator.", async () => {
        await reqWFGetResp(adminUsr, 200, "WRITE", null);
    });

    it("Test creating many workflows as an administrator.", async () => {
        const wfNum = 5;

        await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);
    });

    it("Test creating as a non-administrator.", async () => {
        const wfNum = 2;

        const wg = await addUserToGroup(adminUsr, "w", usr1, 200);
        const rg = await addUserToGroup(adminUsr, "r", usr2, 200);

        await reqWFSGetResps(usr1, 403, wfNum, "READ", null);
        await reqWFSGetResps(usr2, 403, wfNum, "READ", null);
    });
});

describe("2. GET /api/workflows", () => {
    it("Test getting workflows with no stages.", async () => {
        const wfNum = 5;
        const grpName = "g";

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);

        // Admin user.
        let resp = await request(app)
                           .get("/api/workflows")
                           .set("User-Id", `${adminUsr.id}`);

        expect(resp).not.toBeUndefined();
        expect(resp.status).toEqual(200);

        let wfrs: NRWorkflow[] = resp.body;
        expect(wfrs).toHaveLength(wfNum);

        // The workflow has no stages.
        await verifyWFResps(adminUsr, wfs, wfrs, true, false);
        await verifyWFSDB(adminUsr, wfs, false, false);
        await verifyWFSDB(adminUsr, wfrs, true, false);

        // Create a group and give the user mixed permissions.
        await setWFSPermsForGroup(adminUsr, grpName, wfs, "WRITE", 200, [Math.floor(wfNum / 2)]);
        await addUserToGroup(adminUsr, grpName, usr1, 200);

        // Non-admin user with mixed permissions.
        resp = await request(app)
                      .get("/api/workflows")
                      .set("User-Id", `${usr1.id}`);

        expect(resp).not.toBeUndefined();
        expect(resp.status).toEqual(200);

        wfrs = resp.body;
        expect(wfrs).toHaveLength(wfNum);

        await verifyWFResps(usr1, wfs, wfrs, true, false);
        await verifyWFSDB(usr1, wfs, false, false);
        await verifyWFSDB(usr1, wfrs, true, false);
    });

    it("Test getting workflows with stages.", async () => {
        const wfNum = 5;
        const stNum = 3;
        const grpName = "g";

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);

        // We expect them to have WRITE permissions as they are created by an admin.
        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");

        // Admin user.
        let resp = await request(app)
                           .get("/api/workflows")
                           .set("User-Id", `${adminUsr.id}`);

        expect(resp).not.toBeUndefined();
        expect(resp.status).toEqual(200);

        let wfrs = resp.body;
        expect(wfrs).toHaveLength(wfNum);

        // Verify stages as well.
        await verifyWFResps(adminUsr, wfs, wfrs, true, false);
        await verifyWFSDB(adminUsr, wfs, true, false);
        await verifyWFSDB(adminUsr, wfrs, true, false);

        // Create a group and give the user mixed permissions.
        await setWFSPermsForGroup(adminUsr, grpName, wfs, "WRITE", 200, [Math.floor(wfNum / 2)]);
        await setWFSSTSPermsForGroup(adminUsr, grpName, wfs, "WRITE", 200, [Math.floor(stNum / 2)]);
        await addUserToGroup(adminUsr, grpName, usr1, 200);

        // Non-admin user with mixed permissions.
        resp = await request(app)
                     .get("/api/workflows")
                     .set("User-Id", `${usr1.id}`);

        expect(resp).not.toBeUndefined();
        expect(resp.status).toEqual(200);

        wfrs = resp.body;
        expect(wfrs).toHaveLength(wfNum);

        await verifyWFResps(usr1, wfs, wfrs, true, false);
        await verifyWFSDB(usr1, wfs, true, false);
        await verifyWFSDB(usr1, wfrs, true, false);
    });
});

describe("3. GET /api/workflows/:wid", () => {
    it("Test getting individual workflows with no stages.", async () => {
        const wfNum = 5;
        const grpName = "g";

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);

        for (let i = 0; i < wfNum; i++) {
            const wf = wfs[i];

            // Admin user.
            let resp = await request(app)
                               .get(`/api/workflows/${wf.id}`)
                               .set("User-Id", `${adminUsr.id}`);

            expect(resp).not.toBeUndefined();
            expect(resp.status).toEqual(200);

            let wfr: NRWorkflow = resp.body;

            // Stages comes back and empty array.
            expect(wfr.stages).toHaveLength(0);
            await verifyWFResp(adminUsr, wf, wfr, true, false);
            await verifyWFDB(adminUsr, wf, false, false);
            await verifyWFDB(adminUsr, wfr, false, false);

            // Create a group and give the user mixed permissions.
            const wfPerm = ((i % 2) === 0) ? "READ" : "WRITE";
            await setWFPermForGroup(adminUsr, grpName, wf, wfPerm, 200);
            await addUserToGroup(adminUsr, grpName, usr1, 200);

            // Non-admin user with mixed permissions.
            resp = await request(app)
                         .get(`/api/workflows/${wf.id}`)
                         .set("User-Id", `${usr1.id}`);

            expect(resp).not.toBeUndefined();
            expect(resp.status).toEqual(200);

            wfr = resp.body;

            // Stages comes back and empty array.
            expect(wfr.stages).toHaveLength(0);
            await verifyWFResp(usr1, wf, wfr, true, false);
            await verifyWFDB(usr1, wf, false, false);
            await verifyWFDB(usr1, wfr, false, false);

            await clearGroups();
        }
    });

    it("Test getting individual workflows with stages.", async () => {
        const wfNum = 5;
        const stNum = 3;
        const grpName = "g";

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);

        // We expect them to have WRITE permissions as they are created by an admin.
        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");

        for (let i = 0; i < wfNum; i++) {
            const wf = wfs[i];

            // Admin user.
            let resp = await request(app)
                               .get(`/api/workflows/${wf.id}`)
                               .set("User-Id", `${adminUsr.id}`);

            expect(resp).not.toBeUndefined();
            expect(resp.status).toEqual(200);

            let wfr: NRWorkflow = resp.body;
            await verifyWFResp(adminUsr, wf, wfr, true, false);
            await verifyWFDB(adminUsr, wf, true, false);
            await verifyWFDB(adminUsr, wfr, true, false);

            await verifySTResps(adminUsr, wf.stages, wfr.stages, wf, false, "ST");
            await verifySTSDB(adminUsr, wf.stages, wf, false);
            await verifySTSDB(adminUsr, wfr.stages, wfr, false);

            // Create a group and give the user mixed permissions.
            const wfPerm = ((i % 2) === 0) ? "READ" : "WRITE";
            await setWFPermForGroup(adminUsr, grpName, wf, wfPerm, 200);
            await setSTSPermsForGroup(adminUsr, grpName, wf.stages, "WRITE", 200, [Math.floor(stNum / 2)]);
            await addUserToGroup(adminUsr, grpName, usr1, 200);

            // Non-admin user with mixed permissions.
            resp = await request(app)
                         .get(`/api/workflows/${wf.id}`)
                         .set("User-Id", `${usr1.id}`);

            expect(resp).not.toBeUndefined();
            expect(resp.status).toEqual(200);

            wfr = resp.body;
            await verifyWFResp(usr1, wf, wfr, true, false);
            await verifyWFDB(usr1, wf, true, false);
            await verifyWFDB(usr1, wfr, true, false);

            await verifySTResps(usr1, wf.stages, wfr.stages, wf, false, "ST");
            await verifySTSDB(usr1, wf.stages, wf, false);
            await verifySTSDB(usr1, wfr.stages, wfr, false);

            await clearGroups();
        }
    });
});

describe("4. PUT /api/workflows/:wid", () => {
    it("Test updating workflows with no stages.", async () => {
        const wfNum = 5;
        const grpName = "g";

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);

        for (let i = 0; i < wfs.length; i++) {
            const wf = wfs[i];
            wf.name = `UPDATE_NAME_${i}`;
            wf.description = `UPDATE_DESC_${i}`;
            const origName = wf.name;
            const origDesc = wf.description;

            // Admin user.
            let resp = await request(app)
                             .put(`/api/workflows/${wf.id}`)
                             .send(wf)
                             .set("User-Id", `${adminUsr.id}`);

            expect(resp).not.toBeUndefined();
            expect(resp.status).toEqual(200);

            let wfr: NRWorkflow = resp.body;

            // Shouldn't return stages from this endpoint.
            await verifyWFResp(adminUsr, wf, wfr, false, false);
            await verifyWFDB(adminUsr, wf, false, false);
            await verifyWFDB(adminUsr, wfr, false, false);

            // Create a group and give the user mixed permissions.
            const wfPerm = ((i % 2) === 0) ? "READ" : "WRITE";
            await setWFPermForGroup(adminUsr, grpName, wf, wfPerm, 200);
            await addUserToGroup(adminUsr, grpName, usr1, 200);

            wf.name = `UPDATE_NAME_2_${i}`;
            wf.description = `UPDATE_DESC_2_${i}`;

            // Non-admin user with mixed permissions.
            resp = await request(app)
                         .put(`/api/workflows/${wf.id}`)
                         .send(wf)
                         .set("User-Id", `${usr1.id}`);

            expect(resp).not.toBeUndefined();

            if (wf.permission === DBConstants.WRITE) {
                expect(resp.status).toEqual(200);

                wfr = resp.body;
                await verifyWFResp(usr1, wf, wfr, false, false);
                await verifyWFDB(usr1, wf, false, false);
                await verifyWFDB(usr1, wfr, false, false);
            } else {
                expect(resp.status).toEqual(403);

                wf.name = origName;
                wf.description = origDesc;
                await verifyWFDB(usr1, wf, false, false);
            }

            await clearGroups();
        }
    });

    it("Test updating workflows with stages.", async () => {
        const wfNum = 5;
        const stNum = 3;
        const grpName = "g";

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);

        // We expect them to have WRITE permissions as they are created by an admin.
        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");

        for (let i = 0; i < wfs.length; i++) {
            const wf = wfs[i];
            wf.name = `UPDATE_NAME_${i}`;
            wf.description = `UPDATE_DESC_${i}`;
            const origName = wf.name;
            const origDesc = wf.description;

            // Admin user.
            let resp = await request(app)
                             .put(`/api/workflows/${wf.id}`)
                             .send(wf)
                             .set("User-Id", `${adminUsr.id}`);

            expect(resp).not.toBeUndefined();
            expect(resp.status).toEqual(200);

            let wfr: NRWorkflow = resp.body;

            // Shouldn't return stages from this endpoint.
            await verifyWFResp(adminUsr, wf, wfr, false, false);
            await verifyWFDB(adminUsr, wf, false, false);
            await verifyWFDB(adminUsr, wfr, false, false);

            await verifySTSDB(adminUsr, wf.stages, wf, false);

            // Create a group and give the user mixed permissions.
            const wfPerm = ((i % 2) === 0) ? "READ" : "WRITE";
            await setWFPermForGroup(adminUsr, grpName, wf, wfPerm, 200);
            await setSTSPermsForGroup(adminUsr, grpName, wf.stages, "WRITE", 200, [Math.floor(stNum / 2)]);
            await addUserToGroup(adminUsr, grpName, usr1, 200);

            wf.name = `UPDATE_NAME_2_${i}`;
            wf.description = `UPDATE_DESC_2_${i}`;

            // Non-admin user with mixed permissions.
            resp = await request(app)
                         .put(`/api/workflows/${wf.id}`)
                         .send(wf)
                         .set("User-Id", `${usr1.id}`);

            expect(resp).not.toBeUndefined();

            if (wf.permission === DBConstants.WRITE) {
                expect(resp.status).toEqual(200);

                wfr = resp.body;
                await verifyWFResp(usr1, wf, wfr, false, false);
                await verifyWFDB(usr1, wf, true, false);
                await verifyWFDB(usr1, wfr, false, false);
            } else {
                expect(resp.status).toEqual(403);

                wf.name = origName;
                wf.description = origDesc;
                await verifyWFDB(usr1, wf, true, false);
            }

            await clearGroups();
        }
    });
});

describe("5. DELETE /api/workflows/:wid", () => {
    it("Test deleting workflows, admin user.", async () => {
        const wfNum = 5;
        const grpName = "g";

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);

        for (let i = 0; i < wfs.length; i++) {
            const wf = wfs[i];

            // Admin user.
            const resp = await request(app)
                             .delete(`/api/workflows/${wf.id}`)
                             .set("User-Id", `${adminUsr.id}`);

            expect(resp).not.toBeUndefined();
            expect(resp.status).toEqual(204);

            await verifyWFDeleted(wf, false, false);
        }
    });

    it("Test deleting workflows normal user, mixed permissions, no stages.", async () => {
        const wfNum = 5;
        const grpName = "g";

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);

        for (let i = 0; i < wfs.length; i++) {
            const wf = wfs[i];

            // Create a group and give the user mixed permissions.
            const wfPerm = ((i % 2) === 0) ? "READ" : "WRITE";
            await setWFPermForGroup(adminUsr, grpName, wf, wfPerm, 200);
            await addUserToGroup(adminUsr, grpName, usr1, 200);

            // Non-admin user with mixed permissions.
            const resp = await request(app)
                               .delete(`/api/workflows/${wf.id}`)
                               .set("User-Id", `${usr1.id}`);

            expect(resp).not.toBeUndefined();

            if (wf.permission === DBConstants.WRITE) {
                expect(resp.status).toEqual(204);

                await verifyWFDeleted(wf, false, false);
            } else {
                expect(resp.status).toEqual(403);

                await verifyWFDB(usr1, wf, false, false);
            }

            await clearGroups();
        }
    });

    it("Test deleting workflows normal user, mixed permissions, and stages.", async () => {
        const wfNum = 5;
        const stNum = 5;
        const grpName = "g";

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);

        // We expect them to have WRITE permissions as they are created by an admin.
        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");

        for (let i = 0; i < wfs.length; i++) {
            const wf = wfs[i];

            // Create a group and give the user mixed permissions.
            const wfPerm = ((i % 2) === 0) ? "READ" : "WRITE";
            await setWFPermForGroup(adminUsr, grpName, wf, wfPerm, 200);
            await setSTSPermsForGroup(adminUsr, grpName, wf.stages, "WRITE", 200, [Math.floor(stNum / 2)]);
            await addUserToGroup(adminUsr, grpName, usr1, 200);

            // Non-admin user with mixed permissions.
            const resp = await request(app)
                               .delete(`/api/workflows/${wf.id}`)
                               .set("User-Id", `${usr1.id}`);

            expect(resp).not.toBeUndefined();

            if (wf.permission === DBConstants.WRITE) {
                expect(resp.status).toEqual(204);

                await verifyWFDeleted(wf, true, false);
            } else {
                expect(resp.status).toEqual(403);

                await verifyWFDB(usr1, wf, true, false);
            }

            await clearGroups();
        }
    });

    it("Test deleting workflows normal user, mixed permissions, with stages and documents.", async () => {
        const wfNum = 5;
        const stNum = 5;
        const dcNum = 5;
        const grpName = "g";

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);

        // We expect them to have WRITE permissions as they are created by an admin.
        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(adminUsr, wfs, dcNum, 200);

        for (let i = 0; i < wfs.length; i++) {
            const wf = wfs[i];

            // Create a group and give the user mixed permissions.
            const wfPerm = ((i % 2) === 0) ? "READ" : "WRITE";
            await setWFPermForGroup(adminUsr, grpName, wf, wfPerm, 200);
            await setSTSPermsForGroup(adminUsr, grpName, wf.stages, "WRITE", 200, [Math.floor(stNum / 2)]);
            await addUserToGroup(adminUsr, grpName, usr1, 200);

            // Non-admin user with mixed permissions.
            const resp = await request(app)
                               .delete(`/api/workflows/${wf.id}`)
                               .set("User-Id", `${usr1.id}`);

            expect(resp).not.toBeUndefined();

            if (wf.permission === DBConstants.WRITE) {
                expect(resp.status).toEqual(204);

                await verifyWFDeleted(wf, true, true);
            } else {
                expect(resp.status).toEqual(403);

                await verifyWFDB(usr1, wf, true, true);
            }

            await clearGroups();
        }
    });
});

describe("6. POST /api/workflows/:wid/stages", () => {
   it("Test appending a stage to an empty workflow.", async () => {
       const wfNum = 10;
       const stNum = 1;

       const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);

       await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "APPEND", false, "ST");
   });

   it("Test appending many stages to different workflows.", async () => {
       const wfNum = 10;
       const stNum = 10;

       const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);

       await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "APPEND", false, "ST");
   });

   it("Test appending many stages with mixed permissions.", async () => {
       const wfNum = 10;
       const stNum = 10;
       const grpName = "g";

       const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);

       for (let i = 0; i < wfNum; i++) {
           const wf = wfs[i];
           const wfPerm = ((i % 2) === 0) ? "READ" : "WRITE";

           await setWFPermForGroup(adminUsr, grpName, wf, wfPerm, 200);
           await addUserToGroup(adminUsr, grpName, usr1, 200);

           if (wfPerm === "READ") {
                await addStagesToWF(usr1, wf, stNum, 403, "", "APPEND", false, "ST");
           } else {
                await addStagesToWF(usr1, wf, stNum, 200, "WRITE", "APPEND", false, "ST");
           }
       }
   });

   it("Test appending stages doesn't affect documents.", async () => {
       const wfNum = 5;
       const stNum = 5;
       const dcNum = 3;

       const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);
       await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "APPEND", false, "ST");
       await addDocsToWFSStages(adminUsr, wfs, dcNum, 200);

       // Append more stages.
       await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "APPEND", false, "ST");

       // Verify documents haven't moved around.
       for (const wf of wfs) {
           for (const st of wf.stages) {
               // Newly added stages won't have documents.
               if (st.documents === undefined) {
                   continue;
                }

               await verifyDCSDB(st.documents, st, wf);
            }
        }
   });
});

describe("7. GET /api/workflows/:wid/stages", () => {
    it("Test getting all stages for a specific workflow.", async () => {
        const wfNum = 5;
        const stNum = 5;
        const grpName = "g";

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);
        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");

        for (const wf of wfs) {
            // Admin user.
            let resp = await request(app)
                               .get(`/api/workflows/${wf.id}/stages`)
                               .set("User-Id", `${adminUsr.id}`);

            expect(resp).not.toBeUndefined();
            expect(resp.status).toEqual(200);

            let strs: NRStage[] = resp.body;

            await verifySTResps(adminUsr, wf.stages, strs, wf, false, "ST");
            await verifySTSDB(adminUsr, strs, wf, false);

            // Create a group and give the user mixed permissions on these stages.
            await setSTSPermsForGroup(adminUsr, grpName, wf.stages, "WRITE", 200, [Math.floor(stNum / 2)]);
            await addUserToGroup(adminUsr, grpName, usr1, 200);

            resp = await request(app)
                         .get(`/api/workflows/${wf.id}/stages`)
                         .set("User-Id", `${usr1.id}`);

            expect(resp).not.toBeUndefined();
            expect(resp.status).toEqual(200);

            strs = resp.body;

            await verifySTResps(usr1, wf.stages, strs, wf, false, "ST");
            await verifySTSDB(usr1, strs, wf, false);

            await clearGroups();
        }
    });
});

describe("8. GET /api/workflows/:wid/stages/:sid", () => {
    it("Test getting specific stages for different workflows.", async () => {
        const wfNum = 5;
        const stNum = 5;
        const grpName = "g";

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);
        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");

        for (const wf of wfs) {
            for (let i = 0; i < stNum; i++) {
                const st = wf.stages[i];

                // Admin user.
                let resp = await request(app)
                                   .get(`/api/workflows/${wf.id}/stages/${st.id}`)
                                   .set("User-Id", `${adminUsr.id}`);

                expect(resp).not.toBeUndefined();
                expect(resp.status).toEqual(200);

                let str: NRStage = resp.body;

                await verifySTResp(adminUsr, st, str, wf, false, "ST");
                await verifySTDB(adminUsr, str, wf, st.sequenceId, false);

                // Create a group and give the user mixed permissions on these stages.
                const stPerm = ((i % 2) === 0) ? "READ" : "WRITE";
                await setSTPermForGroup(adminUsr, grpName, st, stPerm, 200);
                await addUserToGroup(adminUsr, grpName, usr1, 200);

                // Non-admin user with mixed permissions.
                resp = await request(app)
                             .get(`/api/workflows/${wf.id}/stages/${st.id}`)
                             .set("User-Id", `${usr1.id}`);

                expect(resp).not.toBeUndefined();
                expect(resp.status).toEqual(200);

                str = resp.body;

                await verifySTResp(usr1, st, str, wf, false, "ST");
                await verifySTDB(usr1, str, wf, st.sequenceId, false);

                await clearGroups();
            }
        }
    });

    it("Test getting specific stages with documents.", async () => {
        const wfNum = 5;
        const stNum = 5;
        const dcNum = 3;
        const grpName = "g";

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);
        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(adminUsr, wfs, dcNum, 200);

        for (const wf of wfs) {
            for (let i = 0; i < stNum; i++) {
                const st = wf.stages[i];

                // Admin user.
                let resp = await request(app)
                                   .get(`/api/workflows/${wf.id}/stages/${st.id}`)
                                   .set("User-Id", `${adminUsr.id}`);

                expect(resp).not.toBeUndefined();
                expect(resp.status).toEqual(200);

                let str: NRStage = resp.body;

                await verifySTResp(adminUsr, st, str, wf, true, "ST");
                await verifySTDB(adminUsr, str, wf, st.sequenceId, true);

                // Create a group and give the user mixed permissions on these stages.
                const stPerm = ((i % 2) === 0) ? "READ" : "WRITE";
                await setSTPermForGroup(adminUsr, grpName, st, stPerm, 200);
                await addUserToGroup(adminUsr, grpName, usr1, 200);

                // Non-admin user with mixed permissions.
                resp = await request(app)
                             .get(`/api/workflows/${wf.id}/stages/${st.id}`)
                             .set("User-Id", `${usr1.id}`);

                expect(resp).not.toBeUndefined();
                expect(resp.status).toEqual(200);

                str = resp.body;

                await verifySTResp(usr1, st, str, wf, true, "ST");
                await verifySTDB(usr1, str, wf, st.sequenceId, true);

                await clearGroups();
            }
        }
    });
});

describe("9. POST /api/workflows/:wid/stages/:pos", () => {
    it("Test adding stages at specific positions in a workflow.", async () => {
        const wfNum = 5;
        const stNum = 5;
        const dcNum = 3;
        const grpName = "g";

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);
        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(adminUsr, wfs, dcNum, 200);

        for (const wf of wfs) {
            // Explicitly check beginning, middle, and end.
            const len = wf.stages.length;
            const pos = [len + 100, Math.round(len / 2), -1];

            for (const loc of pos) {
                // Add at the position and verify, we know the admin user will have WRITE privileges.
                await addStageToWF(adminUsr, wf, 200, "WRITE", "" + loc, false, "ST");
            }
        }

       // Verify documents haven't moved around.
        for (const wf of wfs) {
           for (const st of wf.stages) {
               // Newly added stages won't have documents.
               if (st.documents === undefined) {
                   continue;
                }

               await verifyDCSDB(st.documents, st, wf);
            }
        }
    });

    it("Test adding stages at specific positions with mixed permissions.", async () => {
        const wfNum = 5;
        const stNum = 5;
        const dcNum = 3;
        const grpName = "g";

        // Do this part as an admin to have some initial data.
        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);
        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(adminUsr, wfs, dcNum, 200);

        // And this part as a user.
        for (let i = 0; i < wfNum; i++) {
            const wf = wfs[i];
            const wfPerm = ((i % 2) === 0) ? "READ" : "WRITE";
            const loc = Math.floor(Math.random() * stNum);

            await setWFPermForGroup(adminUsr, grpName, wf, wfPerm, 200);
            await addUserToGroup(adminUsr, grpName, usr1, 200);

            if (wfPerm === "READ") {
                 await addStagesToWF(usr1, wf, stNum, 403, "", "" + loc, false, "ST");
            } else {
                 await addStagesToWF(usr1, wf, stNum, 200, "WRITE", "" + loc, false, "ST");
            }

            await clearGroups();
        }

        // Verify documents haven't moved around.
        for (const wf of wfs) {
            for (const st of wf.stages) {
                // Newly added stages won't have documents.
                if (st.documents === undefined) {
                    continue;
                 }

                await verifyDCSDB(st.documents, st, wf);
             }
         }
    });
});

describe("10. DELETE /api/workflows/:wid/stages/:sid", () => {
    it("Test deleting stages with no documents, admin user.", async () => {
        const wfNum = 10;
        const stNum = 5;

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);
        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");

        for (const wf of wfs) {
            for (let i = 0; i < stNum; i++) {
                const sts = wf.stages;

                // Choose a random stage to delete.
                const idtd = Math.floor(Math.random() * sts.length);
                const sttd = sts[idtd];
                const seq = sttd.sequenceId;

                // Delete the stage from our 'local' copy.
                sts.splice(idtd, 1);

                // Fix sequence numbers.
                for (let j = 0; j < sts.length; j++) {
                    sts[j].sequenceId = j + 1;
                }

                const resp = await request(app)
                                   .delete(`/api/workflows/${wf.id}/stages/${sttd.id}`)
                                   .set("User-Id", `${adminUsr.id}`);

                expect(resp).not.toBeUndefined();
                expect(resp.status).toEqual(200);

                await verifySTDeleted(sttd, sts, false, true);
            }
        }
    });

    it("Test deleting stages with no documents, user with mixed permissions.", async () => {
        const wfNum = 10;
        const stNum = 5;
        const grpName = "g";

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);
        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");

        for (const wf of wfs) {
            for (let i = 0; i < stNum; i++) {
                const sts = wf.stages;

                // Choose a random stage to delete.
                const idtd = Math.floor(Math.random() * sts.length);
                const sttd = sts[idtd];
                const seq = sttd.sequenceId;

                const wfPerm = ((i % 2) === 0) ? "READ" : "WRITE";

                await setWFPermForGroup(adminUsr, grpName, wf, wfPerm, 200);

                // Stage deletion permissions are based on WF, but we need to change them locally
                // for this user first.
                await setSTSPermsForGroup(adminUsr, grpName, sts, "WRITE", 200, [Math.floor(stNum / 2)]);
                await addUserToGroup(adminUsr, grpName, usr1, 200);

                // Only delete locally if we expect it to succeed when we make the request.
                if (wfPerm === "WRITE") {
                    sts.splice(idtd, 1);

                    // Fix sequence numbers.
                    for (let j = 0; j < sts.length; j++) {
                        sts[j].sequenceId = j + 1;
                    }
                }

                const resp = await request(app)
                                   .delete(`/api/workflows/${wf.id}/stages/${sttd.id}`)
                                   .set("User-Id", `${usr1.id}`);

                expect(resp).not.toBeUndefined();

                if (wfPerm === "READ") {
                    expect(resp.status).toEqual(403);

                    await verifySTDB(usr1, sttd, wf, sttd.sequenceId, false);
                } else {
                    expect(resp.status).toEqual(200);

                    await verifySTDeleted(sttd, sts, false, true);
                }

                await clearGroups();
            }
        }
    });

    it("Test deleting stages with documents, user with mixed permissions.", async () => {
        const wfNum = 5;
        const stNum = 5;
        const dcNum = 3;
        const grpName = "g";

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);
        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(adminUsr, wfs, dcNum, 200);

        for (const wf of wfs) {
            const sts = wf.stages;

            for (let i = 0; i < stNum; i++) {
                // Choose a random stage to delete.
                const idtd = Math.floor(Math.random() * sts.length);
                const sttd = sts[idtd];
                const seq = sttd.sequenceId;
                let docs;

                const wfPerm = ((i % 2) === 0) ? "READ" : "WRITE";
                await setWFPermForGroup(adminUsr, grpName, wf, wfPerm, 200);
                await setSTSPermsForGroup(adminUsr, grpName, sts, "WRITE", 200, [Math.floor(stNum / 2)]);
                await addUserToGroup(adminUsr, grpName, usr1, 200);

                // Only change locally if we expect it to be deleted remotely.
                if (wfPerm === "WRITE") {
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

                    // If there is only one stage left, we will have just deleted it
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
                                   .set("User-Id", `${usr1.id}`);

                expect(resp).not.toBeUndefined();

                const strs = resp.body;

                // Stage permissions depend on workflow.
                if (wfPerm === "READ") {
                    expect(resp.status).toEqual(403);

                    await verifySTSDB(usr1, sts, wf, true);
                } else {
                    expect(resp.status).toEqual(200);

                    await verifySTResps(usr1, sts, strs, wf, true, "ST");
                    await verifySTDeleted(sttd, sts, true, true);

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

describe("11. PUT /api/workflows/:wid/stages/:sid", () => {
   it("Test updating stages in different workflows with mixed permissions.", async () => {
        const wfNum = 5;
        const stNum = 3;
        const dcNum = 3;
        const grpName = "g";

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);

        // We expect them to have WRITE permissions as they are created by an admin.
        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(adminUsr, wfs, dcNum, 200);

        for (const wf of wfs) {
            for (let i = 0; i < stNum; i++) {
                const st = wf.stages[i];

                st.name = `UPDATE_NAME_${i}`;
                st.description = `UPDATE_DESC_${i}`;
                const origName = st.name;
                const origDesc = st.description;

                // Admin user.
                let resp = await request(app)
                                 .put(`/api/workflows/${wf.id}/stages/${st.id}`)
                                 .send(st)
                                 .set("User-Id", `${adminUsr.id}`);

                expect(resp).not.toBeUndefined();
                expect(resp.status).toEqual(200);

                let str: NRStage = resp.body;

                // Endpoint won't returns documents in the response.
                await verifySTResp(adminUsr, st, str, wf, false, "ST");

                // But they should still be right in the DB for the original stage.
                await verifySTDB(adminUsr, st, wf, st.sequenceId, true);

                // Create a group and give the user mixed permissions.
                const wfPerm = ((i % 2) === 0) ? "READ" : "WRITE";
                await setWFPermForGroup(adminUsr, grpName, wf, wfPerm, 200);
                await setSTPermForGroup(adminUsr, grpName, st, "WRITE", 200);
                await addUserToGroup(adminUsr, grpName, usr1, 200);

                st.name = `UPDATE_NAME_2_${i}`;
                st.description = `UPDATE_DESC_2_${i}`;

                // Non-admin user with mixed permissions.
                resp = await request(app)
                             .put(`/api/workflows/${wf.id}/stages/${st.id}`)
                             .send(st)
                             .set("User-Id", `${usr1.id}`);

                expect(resp).not.toBeUndefined();

                if (wf.permission === DBConstants.WRITE) {
                    expect(resp.status).toEqual(200);

                    str = resp.body;

                    // Endpoint won't returns documents in the response.
                    await verifySTResp(adminUsr, st, str, wf, false, "ST");

                    // But they should still be right in the DB for the original stage.
                    await verifySTDB(adminUsr, st, wf, st.sequenceId, true);
                } else {
                    expect(resp.status).toEqual(403);

                    st.name = origName;
                    st.description = origDesc;
                    await verifySTDB(usr1, st, wf, st.sequenceId, true);
                }

                await clearGroups();
            }
        }
   });
});

// Document tests.
describe("12. POST /api/documents", () => {
    it("Test creating documents as an admin.", async () => {
        const wfNum = 5;
        const stNum = 5;
        const dcNum = 3;
        const grpName = "g";

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);

        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(adminUsr, wfs, dcNum, 200);
    });

    it("Test creating documents without any permissions.", async () => {
        const wfNum = 5;
        const stNum = 5;
        const dcNum = 3;

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);
        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");

        await addDocsToWFSStages(usr1, wfs, dcNum, 403);
   });

    it("Test creating documents with READ permissions on the workflow.", async () => {
        const wfNum = 3;
        const stNum = 3;
        const dcNum = 3;
        const grpName = "g";

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);
        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");

        for (const wf of wfs) {
            await setWFPermForGroup(adminUsr, grpName, wf, "READ", 200);
            await addUserToGroup(adminUsr, grpName, usr1, 200);

            for (const st of wf.stages) {
                await addDocsToWFSStages(usr1, wfs, dcNum, 403);
            }
        }
    });

    it("Test creating documents with WRITE permissions on the workflow.", async () => {
        const wfNum = 3;
        const stNum = 3;
        const dcNum = 3;
        const grpName = "g";

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);
        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");

        for (const wf of wfs) {
            await setWFPermForGroup(adminUsr, grpName, wf, "WRITE", 200);
            await addUserToGroup(adminUsr, grpName, usr1, 200);

            for (const st of wf.stages) {
                await addDocsToWFSStages(usr1, wfs, dcNum, 403);
            }
        }
    });

    it("Test creating documents with mixed permissions on the stages.", async () => {
        const wfNum = 3;
        const stNum = 3;
        const dcNum = 3;
        const grpName = "g";

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);
        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");

        for (let i = 0; i < wfNum; i++) {
            const wf = wfs[i];
            const wfPerm = ((i % 2) === 0) ? "READ" : "WRITE";

            await setWFPermForGroup(adminUsr, grpName, wf, wfPerm, 200);
            await setSTSPermsForGroup(adminUsr, grpName, wf.stages, "WRITE", 200, [Math.floor(stNum / 2)]);
            await addUserToGroup(adminUsr, grpName, usr1, 200);

            for (const st of wf.stages) {
                const status = (st.permission === DBConstants.READ) ? 403 : 200;
                await addDocsToStage(usr1, st, dcNum, status);
            }
        }
    });

    it("Test creating a document in a workflow with no stages.", async () => {
        const wfNum = 3;
        const stNum = 3;
        const dcNum = 3;
        const grpName = "g";

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);

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
                               .set("User-Id", `${adminUsr.id}`);

            expect(resp).not.toBeUndefined();
            expect(resp.status).toEqual(400);
        }
    });

    it("Test passing no stage defaults to first stage of workflow.", async () => {
        const wfNum = 3;
        const stNum = 3;
        const dcNum = 3;
        const grpName = "g";

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);
        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");

        for (const wf of wfs) {
            const dc = new NRDocument();
            dc.id = dcSeq;
            dcSeq++;
            dc.name = Guid.create().toString();
            dc.description = dc.name + "_DESC";
            dc.workflow = wf;

            // Created as admin, so it will be WRITE.
            dc.permission = 1;

            const resp = await request(app)
                               .post(`/api/documents/`)
                               .send(dc)
                               .set("User-Id", `${adminUsr.id}`);

            expect(resp).not.toBeUndefined();
            expect(resp.status).toEqual(200);

            const dcr = resp.body;
            const st = wf.stages.find((x) => x.sequenceId === 1);

            dc.stage = st;
            await verifyDCResp(dc, dcr, st, wf);
            await verifyDCDB(dcr, st, wf);
        }
   });
});

describe("13. GET /api/documents", () => {
    it("Test getting all documents as an admin.", async () => {
        const wfNum = 2;
        const stNum = 3;
        const dcNum = 5;
        const grpName = "g";

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);
        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(adminUsr, wfs, dcNum, 200);

        const expDocNum = wfNum * stNum * dcNum;

        const resp = await request(app)
                           .get("/api/documents")
                           .set("User-Id", `${adminUsr.id}`);

        expect(resp).not.toBeUndefined();
        expect(resp.status).toEqual(200);

        const dcrs: NRDocument[] = resp.body;
        expect(dcrs.length).toEqual(expDocNum);

        for (const wf of wfs) {
            for (const st of wf.stages) {
                for (let i = 0; i < dcNum; i++) {
                    const dc = st.documents[i];
                    const dch = dcrs.find((x) => x.id === dc.id);

                    await verifyDCResp(dc, dch, st, wf);
                    await verifyDCDB(dc, st, wf);
                    await verifyDCDB(dch, st, wf);
                }
            }
        }
    });

    it("Test getting all documents as user with mixed permissions.", async () => {
        const wfNum = 2;
        const stNum = 3;
        const dcNum = 5;
        const grpName = "g";

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);
        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(adminUsr, wfs, dcNum, 200);

        // Workflow has WRITE, but document permissions base off stage.
        await setWFSPermsForGroup(adminUsr, grpName, wfs, "WRITE", 200, [0]);

        // Give index 0 READ.
        await setWFSSTSPermsForGroup(adminUsr, grpName, wfs, "WRITE", 200, [Math.floor(stNum / 2)]);
        await addUserToGroup(adminUsr, grpName, usr1, 200);

        const expDocNum = wfNum * stNum * dcNum;

        const resp = await request(app)
                           .get("/api/documents")
                           .set("User-Id", `${usr1.id}`);

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

describe("14. GET /api/documents/user", () => {
    it("Test getting all documents that the logged in user has permissions to edit.", async () => {
        const wfNum = 7;
        const stNum = 3;
        const dcNum = 2;

        const grp1 = "g1";
        const grp2 = "g2";
        const grp3 = "g3";

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);
        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(adminUsr, wfs, dcNum, 200);

        const expDocs: NRDocument[] = [];
        let expDocNum = 0;

        // grp1 has WRITE on wfs[0].
        await setWFPermForGroup(adminUsr, grp1, wfs[0], "WRITE", 200);

        // grp2 has READ on wfs[1].
        await setWFPermForGroup(adminUsr, grp2, wfs[1], "READ", 200);

        // grp3 has WRITE on wfs[2].stages[0].
        await setSTPermForGroup(adminUsr, grp3, wfs[2].stages[0], "WRITE", 200);
        for (const dc of wfs[2].stages[0].documents) {
            expDocs.push(dc);
            expDocNum++;
        }

        // grp3 has READ on wfs[2].stages[1].
        await setSTPermForGroup(adminUsr, grp3, wfs[2].stages[1], "READ", 200);

        // Add users to these groups.
        await addUserToGroup(adminUsr, grp1, usr1, 200);
        await addUserToGroup(adminUsr, grp2, usr2, 200);
        await addUserToGroup(adminUsr, grp3, usr3, 200);

        let resp = await request(app)
                         .get(`/api/documents/user/${usr1.id}`)
                         .set("User-Id", `${usr1.id}`);

        expect(resp).not.toBeUndefined();
        expect(resp.status).toEqual(200);

        let dcrs = resp.body;
        expect(dcrs.length).toEqual(0);

        resp = await request(app)
                     .get(`/api/documents/user/${usr2.id}`)
                     .set("User-Id", `${usr2.id}`);

        expect(resp).not.toBeUndefined();
        expect(resp.status).toEqual(200);

        dcrs = resp.body;
        expect(dcrs.length).toEqual(0);

        resp = await request(app)
                     .get(`/api/documents/user/${usr3.id}`)
                     .set("User-Id", `${usr3.id}`);

        expect(resp).not.toBeUndefined();
        expect(resp.status).toEqual(200);

        dcrs = resp.body;
        expect(dcrs.length).toEqual(expDocNum);

        // Sort by ID for easy comparisons.
        dcrs.sort((a: NRDocument, b: NRDocument) => a.id - b.id);
        expDocs.sort((a: NRDocument, b: NRDocument) => a.id - b.id);

        // Verify we got the right documents back.
        for (let i = 0; i < expDocs.length; i++) {
            expect(dcrs[i].id).toEqual(expDocs[i].id);
        }
    });
});

describe("15. GET /api/documents/:did", () => {
    it("Test getting individual documents.", async () => {
        const wfNum = 5;
        const stNum = 3;
        const dcNum = 2;
        const grpName = "g";

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);
        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(adminUsr, wfs, dcNum, 200);

        await setWFSSTSPermsForGroup(adminUsr, grpName, wfs, "WRITE", 200, [Math.floor(stNum / 2)]);
        await addUserToGroup(adminUsr, grpName, usr1, 200);

        for (const wf of wfs) {
            for (const st of wf.stages) {
                for (const dc of st.documents) {
                    const resp = await request(app)
                                       .get(`/api/documents/${dc.id}`)
                                       .set("User-Id", `${usr1.id}`);

                    expect(resp).not.toBeUndefined();
                    expect(resp.status).toEqual(200);

                    const dcr = resp.body;
                    await verifyDCResp(dc, dcr, st, wf);
                }
            }
        }
    });
});

describe("16. GET /api/documents/author/:aid", () => {
    it("Test getting all documents written by a particular author.", async () => {
        const wfNum = 2;
        const stNum = 3;
        const dcNum = 2;
        const grpName = "g";
        const expDocNum = 2 * dcNum;

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);
        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");

        // Documents created by admin.
        await addDocsToStage(adminUsr, wfs[0].stages[1], dcNum, 200);
        await addDocsToStage(adminUsr, wfs[1].stages[2], dcNum, 200);

        await setWFSSTSPermsForGroup(adminUsr, grpName, wfs, "WRITE", 200, []);
        await addUserToGroup(adminUsr, grpName, usr1, 200);

        // Documents created by user.
        await addDocsToStage(usr1, wfs[0].stages[0], dcNum, 200);
        await addDocsToStage(usr1, wfs[1].stages[0], dcNum, 200);

        let resp = await request(app)
                         .get(`/api/documents/author/${adminUsr.id}`)
                         .set("User-Id", `${adminUsr.id}`);

        expect(resp).not.toBeUndefined();
        expect(resp.status).toEqual(200);

        let dcrs: NRDocument[] = resp.body;
        expect(dcrs.length).toEqual(expDocNum);

        const adminDocs = wfs[0].stages[1].documents.concat(wfs[1].stages[2].documents);
        adminDocs.sort((a: NRDocument, b: NRDocument) => a.id - b.id);
        dcrs.sort((a: NRDocument, b: NRDocument) => a.id - b.id);

        for (let i = 0; i < expDocNum; i++) {
            expect(adminDocs[i].id).toEqual(dcrs[i].id);
            expect(adminDocs[i].permission).toEqual(dcrs[i].permission);
        }

        resp = await request(app)
                     .get(`/api/documents/author/${usr1.id}`)
                     .set("User-Id", `${usr1.id}`);

        expect(resp).not.toBeUndefined();
        expect(resp.status).toEqual(200);

        dcrs = resp.body;
        expect(dcrs.length).toEqual(expDocNum);

        const usrDocs = wfs[0].stages[0].documents.concat(wfs[1].stages[0].documents);
        usrDocs.sort((a: NRDocument, b: NRDocument) => a.id - b.id);
        dcrs.sort((a: NRDocument, b: NRDocument) => a.id - b.id);

        for (let i = 0; i < expDocNum; i++) {
            expect(usrDocs[i].id).toEqual(dcrs[i].id);
            expect(usrDocs[i].permission).toEqual(dcrs[i].permission);
        }
    });
});

describe("17. GET /api/documents/stage/:sid", () => {
   it("Test getting all documents in a certain stage.", async () => {
        const wfNum = 2;
        const stNum = 3;
        const dcNum = 2;

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);
        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(adminUsr, wfs, dcNum, 200);

        for (const wf of wfs) {
            for (const st of wf.stages) {
                const resp = await request(app)
                                   .get(`/api/documents/stage/${st.id}`)
                                   .set("User-Id", `${adminUsr.id}`);

                expect(resp).not.toBeUndefined();
                expect(resp.status).toEqual(200);

                const dcrs: NRDocument[] = resp.body;
                expect(dcrs.length).toEqual(dcNum);

                st.documents.sort((a: NRDocument, b: NRDocument) => a.id - b.id);
                dcrs.sort((a: NRDocument, b: NRDocument) => a.id - b.id);

                for (let i = 0; i < dcNum; i++) {
                    expect(st.documents[i].id).toEqual(dcrs[i].id);
                    expect(st.documents[i].permission).toEqual(dcrs[i].permission);
                    await verifyDCInST(dcrs[i], st);
                }
            }
        }
    });
});

describe("18. GET /api/documents/workflow/:wid", () => {
    it("Test getting all documents in a certain workflow.", async () => {
        const wfNum = 2;
        const stNum = 3;
        const dcNum = 2;
        const expDocNum = stNum * dcNum;

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);
        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(adminUsr, wfs, dcNum, 200);

        for (const wf of wfs) {
            const resp = await request(app)
                               .get(`/api/documents/workflow/${wf.id}`)
                               .set("User-Id", `${adminUsr.id}`);

            expect(resp).not.toBeUndefined();
            expect(resp.status).toEqual(200);

            const dcrs: NRDocument[] = resp.body;
            expect(dcrs.length).toEqual(expDocNum);

            let localDocs: NRDocument[] = [];
            for (const st of wf.stages) {
                localDocs = localDocs.concat(st.documents);
            }

            localDocs.sort((a: NRDocument, b: NRDocument) => a.id - b.id);
            dcrs.sort((a: NRDocument, b: NRDocument) => a.id - b.id);

            for (let i = 0; i < expDocNum; i++) {
                expect(localDocs[i].id).toEqual(dcrs[i].id);
                expect(localDocs[i].permission).toEqual(dcrs[i].permission);
                await verifyDCInST(dcrs[i], localDocs[i].stage);
            }
        }
    });
});

describe("19. GET /api/documents/orphan", () => {
    it("Test getting all orphan documents.", async () => {
        const wfNum = 5;
        const stNum = 3;
        const dcNum = 2;
        let expDocNum = stNum * dcNum;

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);
        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(adminUsr, wfs, dcNum, 200);

        let localDocs: NRDocument[] = [];
        for (const wf of wfs) {
            let resp = await request(app)
                             .delete(`/api/workflows/${wf.id}`)
                             .set("User-Id", `${adminUsr.id}`);

            expect(resp).not.toBeUndefined();
            expect(resp.status).toEqual(204);

            resp = await request(app)
                         .get(`/api/documents/all/orphan/docs`)
                         .set("User-Id", `${adminUsr.id}`);

            expect(resp).not.toBeUndefined();
            expect(resp.status).toEqual(200);

            const dcrs: NRDocument[] = resp.body;
            expect(dcrs.length).toEqual(expDocNum);

            for (const st of wf.stages) {
                localDocs = localDocs.concat(st.documents);
            }

            localDocs.sort((a: NRDocument, b: NRDocument) => a.id - b.id);
            dcrs.sort((a: NRDocument, b: NRDocument) => a.id - b.id);

            for (let i = 0; i < expDocNum; i++) {
                expect(localDocs[i].id).toEqual(dcrs[i].id);
                expect(dcrs[i].workflow).toBeUndefined();
                expect(dcrs[i].stage).toBeUndefined();
                expect(dcrs[i].permission).toEqual(DBConstants.WRITE);
            }

            expDocNum += (stNum * dcNum);
        }
    });
});

describe("20. PUT /api/documents/:did", () => {
    it("Test updating documents with mixed permissions.", async () => {
        const wfNum = 5;
        const stNum = 3;
        const dcNum = 2;
        const grpName = "g";

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);
        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(adminUsr, wfs, dcNum, 200);

        for (let i = 0; i < wfNum; i++) {
            const wf = wfs[i];
            for (let j = 0; j < stNum; j++) {
                const st = wf.stages[j];

                // Create a group and give the user mixed permissions.
                const wfPerm = ((i % 2) === 0) ? "READ" : "WRITE";
                await setWFPermForGroup(adminUsr, grpName, wf, wfPerm, 200);

                const stPerm = ((j % 2) === 0) ? "READ" : "WRITE";
                await setSTPermForGroup(adminUsr, grpName, st, stPerm, 200);

                await addUserToGroup(adminUsr, grpName, usr1, 200);

                for (const dc of st.documents) {
                    const ndc = JSON.parse(JSON.stringify(dc));
                    ndc.name = "NEW_" + Guid.create().toString();
                    ndc.description = ndc.name + "_DESC";

                    const resp = await request(app)
                                       .put(`/api/documents/${dc.id}`)
                                       .send(ndc)
                                       .set("User-Id", `${usr1.id}`);

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

describe("21. DELETE /api/documents/:did", () => {
    it("Test deleting documents with mixed permissions.", async () => {
        const wfNum = 5;
        const stNum = 3;
        const dcNum = 2;
        const grpName = "g";

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);
        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(adminUsr, wfs, dcNum, 200);

        for (let i = 0; i < wfNum; i++) {
            const wf = wfs[i];
            for (let j = 0; j < stNum; j++) {
                const st = wf.stages[j];

                // Create a group and give the user mixed permissions.
                const wfPerm = ((i % 2) === 0) ? "READ" : "WRITE";
                await setWFPermForGroup(adminUsr, grpName, wf, wfPerm, 200);

                const stPerm = ((j % 2) === 0) ? "READ" : "WRITE";
                await setSTPermForGroup(adminUsr, grpName, st, stPerm, 200);

                await addUserToGroup(adminUsr, grpName, usr1, 200);

                for (const dc of st.documents) {
                    const resp = await request(app)
                                       .delete(`/api/documents/${dc.id}`)
                                       .set("User-Id", `${usr1.id}`);

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

describe("22. PUT /api/documents/:did/next", () => {
    it("Test moving documents to the next stage with mixed group permissions.", async () => {
        const wfNum = 5;
        const stNum = 3;
        const dcNum = 2;
        const grpName = "g";

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);
        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(adminUsr, wfs, dcNum, 200);

        // Give the group mixed permissions on workflows and stages.
        await setWFSPermsForGroup(adminUsr, grpName, wfs, "READ", 200, [Math.floor(wfNum / 2)]);
        await setWFSSTSPermsForGroup(adminUsr, grpName, wfs, "WRITE", 200, [Math.floor(stNum / 2)]);
        await addUserToGroup(adminUsr, grpName, usr1, 200);

        for (const wf of wfs) {
            for (const st of wf.stages) {
                for (const dc of st.documents) {
                    let nst;

                    // Update local copies if we expect it to actually be moved.
                    if ((st.permission === DBConstants.WRITE) && (st.sequenceId !== stNum)) {
                        nst = await stRep.findOne({ where: { sequenceId: st.sequenceId + 1,
                                                             workflow: wf } });

                        const nstp = await stPRep.findOne({ where: { stage: nst,
                                                                     user: usr1 } });

                        dc.stage = nst;
                        dc.permission = nstp.access;
                        nst.permission = nstp.access;
                    }

                    const resp = await request(app)
                                       .put(`/api/documents/${dc.id}/next`)
                                       .set("User-Id", `${usr1.id}`);

                    expect(resp).not.toBeUndefined();

                    const dcr = resp.body;

                    // It only moves forward if we actually have write permissions.
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

describe("23. PUT /api/documents/:did/prev", () => {
    it("Test moving documents to the previous stage with mixed group permissions.", async () => {
        const wfNum = 5;
        const stNum = 3;
        const dcNum = 2;
        const grpName = "g";

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);
        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(adminUsr, wfs, dcNum, 200);

        // Give the group mixed permissions on workflows and stages.
        await setWFSPermsForGroup(adminUsr, grpName, wfs, "READ", 200, [Math.floor(wfNum / 2)]);
        await setWFSSTSPermsForGroup(adminUsr, grpName, wfs, "WRITE", 200, [Math.floor(stNum / 2)]);
        await addUserToGroup(adminUsr, grpName, usr1, 200);

        for (const wf of wfs) {
            for (const st of wf.stages) {
                for (const dc of st.documents) {
                    let nst;

                    // Update local copies if we expect it to actually be moved.
                    if ((st.permission === DBConstants.WRITE) && (st.sequenceId !== 1)) {
                        nst = await stRep.findOne({ where: { sequenceId: st.sequenceId - 1,
                                                             workflow: wf } });

                        const nstp = await stPRep.findOne({ where: { stage: nst,
                                                                     user: usr1 } });

                        dc.stage = nst;
                        dc.permission = nstp.access;
                        nst.permission = nstp.access;
                    }

                    const resp = await request(app)
                                       .put(`/api/documents/${dc.id}/prev`)
                                       .set("User-Id", `${usr1.id}`);

                    expect(resp).not.toBeUndefined();

                    const dcr = resp.body;

                    // It only moves forward if we actually have write permissions.
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

// User tests.
describe("24. PUT /api/users/:uid", () => {
    it("Test updating a user as an admin.", async () => {
        const tstUsr = new NRUser();
        tstUsr.id = usrSeq;
        usrSeq++;

        tstUsr.firstName = "Test";
        tstUsr.lastName = "User";
        tstUsr.userName = "tuser";
        tstUsr.email = "tuser@newsroom.com";
        tstUsr.admin = "N";
        await usrRep.save(tstUsr);

        tstUsr.firstName = "dsfasfd";
        tstUsr.lastName = "sadfsafds";
        tstUsr.userName = "asdfasfdsad";

        const resp = await request(app)
                           .put(`/api/users/${tstUsr.id}`)
                           .send(tstUsr)
                           .set("User-Id", `${adminUsr.id}`);

        expect(resp).not.toBeUndefined();
        expect(resp.status).toEqual(200);

        const usdb = await usrRep.findOne(tstUsr.id);
        expect(usdb).not.toBeUndefined();
        expect(usdb.firstName).toEqual(tstUsr.firstName);
        expect(usdb.lastName).toEqual(tstUsr.lastName);
        expect(usdb.userName).toEqual(tstUsr.userName);
    });

    it("Test updating a user as themselves.", async () => {
        const tstUsr = new NRUser();
        tstUsr.id = usrSeq;
        usrSeq++;

        tstUsr.firstName = "Test";
        tstUsr.lastName = "User";
        tstUsr.userName = "tuser";
        tstUsr.email = "tuser@newsroom.com";
        tstUsr.admin = "N";
        await usrRep.save(tstUsr);

        tstUsr.firstName = "dsfasfd";
        tstUsr.lastName = "sadfsafds";
        tstUsr.userName = "asdfasfdsad";

        const resp = await request(app)
                           .put(`/api/users/${tstUsr.id}`)
                           .send(tstUsr)
                           .set("User-Id", `${tstUsr.id}`);

        expect(resp).not.toBeUndefined();
        expect(resp.status).toEqual(200);

        const usdb = await usrRep.findOne(tstUsr.id);
        expect(usdb).not.toBeUndefined();
        expect(usdb.firstName).toEqual(tstUsr.firstName);
        expect(usdb.lastName).toEqual(tstUsr.lastName);
        expect(usdb.userName).toEqual(tstUsr.userName);
    });

    it("Test updating a user without permissions.", async () => {
        const tstUsr = new NRUser();
        tstUsr.id = usrSeq;
        usrSeq++;

        tstUsr.firstName = "Test";
        tstUsr.lastName = "User";
        tstUsr.userName = "tuser";
        tstUsr.email = "tuser@newsroom.com";
        tstUsr.admin = "N";
        await usrRep.save(tstUsr);

        const usrbk = JSON.parse(JSON.stringify(tstUsr));

        tstUsr.firstName = "dsfasfd";
        tstUsr.lastName = "sadfsafds";
        tstUsr.userName = "asdfasfdsad";

        const resp = await request(app)
                           .put(`/api/users/${tstUsr.id}`)
                           .send(tstUsr)
                           .set("User-Id", `${usr1.id}`);

        expect(resp).not.toBeUndefined();
        expect(resp.status).toEqual(403);

        const usdb = await usrRep.findOne(tstUsr.id);
        expect(usdb).not.toBeUndefined();
        expect(usdb.firstName).toEqual(usrbk.firstName);
        expect(usdb.lastName).toEqual(usrbk.lastName);
        expect(usdb.userName).toEqual(usrbk.userName);
    });
});

describe("25. DELETE /api/users/:uid", () => {
    it("Test deleting a user as an admin.", async () => {
        const tstUsr = new NRUser();
        tstUsr.id = usrSeq;
        usrSeq++;

        tstUsr.firstName = "Test";
        tstUsr.lastName = "User";
        tstUsr.userName = "tuser";
        tstUsr.email = "tuser@newsroom.com";
        tstUsr.admin = "N";
        await usrRep.save(tstUsr);

        const resp = await request(app)
                           .delete(`/api/users/${tstUsr.id}`)
                           .set("User-Id", `${adminUsr.id}`);

        expect(resp).not.toBeUndefined();
        expect(resp.status).toEqual(204);

        const usdb = await usrRep.findOne(tstUsr.id);
        expect(usdb).toBeUndefined();
    });

    it("Test deleting a user without permissions.", async () => {
        const tstUsr = new NRUser();
        tstUsr.id = usrSeq;
        usrSeq++;

        tstUsr.firstName = "Test";
        tstUsr.lastName = "User";
        tstUsr.userName = "tuser";
        tstUsr.email = "tuser@newsroom.com";
        tstUsr.admin = "N";
        await usrRep.save(tstUsr);

        const resp = await request(app)
                           .delete(`/api/users/${tstUsr.id}`)
                           .set("User-Id", `${usr1.id}`);

        expect(resp).not.toBeUndefined();
        expect(resp.status).toEqual(403);

        const usdb = await usrRep.findOne(tstUsr.id);
        expect(usdb).not.toBeUndefined();
    });

    it("Test deleting a user who is a member of multiple groups.", async () => {
        const wfNum = 5;
        const stNum = 3;
        const dcNum = 2;
        const grpName = "g";

        const tstUsr = new NRUser();
        tstUsr.id = usrSeq;
        usrSeq++;

        tstUsr.firstName = "Test";
        tstUsr.lastName = "User";
        tstUsr.userName = "tuser";
        tstUsr.email = "tuser@newsroom.com";
        tstUsr.admin = "N";
        await usrRep.save(tstUsr);

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);
        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(adminUsr, wfs, dcNum, 200);

        // Give the group mixed permissions on workflows and stages.
        await setWFSPermsForGroup(adminUsr, grpName, wfs, "READ", 200, [Math.floor(wfNum / 2)]);
        await setWFSSTSPermsForGroup(adminUsr, grpName, wfs, "WRITE", 200, [Math.floor(stNum / 2)]);
        await addUserToGroup(adminUsr, grpName, tstUsr, 200);

        const resp = await request(app)
                           .delete(`/api/users/${tstUsr.id}`)
                           .set("User-Id", `${adminUsr.id}`);

        expect(resp).not.toBeUndefined();
        expect(resp.status).toEqual(204);

        const usdb = await usrRep.findOne(tstUsr.id);
        expect(usdb).toBeUndefined();

        const grpdb = await rlRep.findOne({ where: { name: grpName } });
        expect(grpdb).not.toBeUndefined();
    });

});

describe("26. PUT /api/users/:uid/role/:rid", () => {
    it("Test adding a role to a user as an admin.", async () => {
        const wfNum = 5;
        const stNum = 3;
        const dcNum = 2;
        const grpName = "g";

        const tstUsr = new NRUser();
        tstUsr.id = usrSeq;
        usrSeq++;

        tstUsr.firstName = "Test";
        tstUsr.lastName = "User";
        tstUsr.userName = "tuser";
        tstUsr.email = "tuser@newsroom.com";
        tstUsr.admin = "N";
        await usrRep.save(tstUsr);

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);
        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(adminUsr, wfs, dcNum, 200);

        // Give the group mixed permissions on workflows and stages.
        await setWFSPermsForGroup(adminUsr, grpName, wfs, "READ", 200, [Math.floor(wfNum / 2)]);
        await setWFSSTSPermsForGroup(adminUsr, grpName, wfs, "WRITE", 200, [Math.floor(stNum / 2)]);
        await addUserToGroup(adminUsr, grpName, tstUsr, 200);

        const usdb = await usrRep.findOne(tstUsr.id, { relations: ["roles"] });
        expect(usdb).not.toBeUndefined();
        expect(usdb.roles).not.toBeUndefined();
        expect(usdb.roles).toHaveLength(1);
        expect(usdb.roles[0].name).toEqual(grpName);
    });

    it("Test adding a role to a user without privileges.", async () => {
        const wfNum = 5;
        const stNum = 3;
        const dcNum = 2;
        const grpName = "g";

        const tstUsr = new NRUser();
        tstUsr.id = usrSeq;
        usrSeq++;

        tstUsr.firstName = "Test";
        tstUsr.lastName = "User";
        tstUsr.userName = "tuser";
        tstUsr.email = "tuser@newsroom.com";
        tstUsr.admin = "N";
        await usrRep.save(tstUsr);

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);
        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(adminUsr, wfs, dcNum, 200);

        // Give the group mixed permissions on workflows and stages.
        await setWFSPermsForGroup(adminUsr, grpName, wfs, "READ", 200, [Math.floor(wfNum / 2)]);
        await setWFSSTSPermsForGroup(adminUsr, grpName, wfs, "WRITE", 200, [Math.floor(stNum / 2)]);
        await addUserToGroup(usr1, grpName, tstUsr, 403);

        const usdb = await usrRep.findOne(tstUsr.id, { relations: ["roles"] });
        expect(usdb).not.toBeUndefined();
        expect(usdb.roles).toHaveLength(0);
    });
});

describe("27. DELETE /api/users/:uid/role/:rid", () => {
    it("Test removing a role from a user as an admin.", async () => {
        const wfNum = 5;
        const stNum = 3;
        const dcNum = 2;
        const grpName = "g";

        const tstUsr = new NRUser();
        tstUsr.id = usrSeq;
        usrSeq++;

        tstUsr.firstName = "Test";
        tstUsr.lastName = "User";
        tstUsr.userName = "tuser";
        tstUsr.email = "tuser@newsroom.com";
        tstUsr.admin = "N";
        await usrRep.save(tstUsr);

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);
        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(adminUsr, wfs, dcNum, 200);

        // Give the group mixed permissions on workflows and stages.
        await setWFSPermsForGroup(adminUsr, grpName, wfs, "READ", 200, [Math.floor(wfNum / 2)]);
        await setWFSSTSPermsForGroup(adminUsr, grpName, wfs, "WRITE", 200, [Math.floor(stNum / 2)]);
        await addUserToGroup(adminUsr, grpName, tstUsr, 200);

        const rl = await rlRep.findOne({ where: { name: grpName } });
        const resp = await request(app)
                           .delete(`/api/users/${tstUsr.id}/role/${rl.id}`)
                           .set("User-Id", `${adminUsr.id}`);

        console.log(resp.text);
        expect(resp).not.toBeUndefined();
        expect(resp.status).toEqual(200);

        const usdb = await usrRep.findOne(tstUsr.id, { relations: ["roles"] });
        expect(usdb).not.toBeUndefined();
        expect(usdb.roles).not.toBeUndefined();
        expect(usdb.roles).toHaveLength(0);
    });

    it("Test adding a role to a user without privileges.", async () => {
        const wfNum = 5;
        const stNum = 3;
        const dcNum = 2;
        const grpName = "g";

        const tstUsr = new NRUser();
        tstUsr.id = usrSeq;
        usrSeq++;

        tstUsr.firstName = "Test";
        tstUsr.lastName = "User";
        tstUsr.userName = "tuser";
        tstUsr.email = "tuser@newsroom.com";
        tstUsr.admin = "N";
        await usrRep.save(tstUsr);

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);
        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(adminUsr, wfs, dcNum, 200);

        // Give the group mixed permissions on workflows and stages.
        await setWFSPermsForGroup(adminUsr, grpName, wfs, "READ", 200, [Math.floor(wfNum / 2)]);
        await setWFSSTSPermsForGroup(adminUsr, grpName, wfs, "WRITE", 200, [Math.floor(stNum / 2)]);
        await addUserToGroup(adminUsr, grpName, tstUsr, 200);

        const rl = await rlRep.findOne({ where: { name: grpName } });
        const resp = await request(app)
                           .delete(`/api/users/${tstUsr.id}/role/${rl.id}`)
                           .set("User-Id", `${usr1.id}`);

        expect(resp).not.toBeUndefined();
        expect(resp.status).toEqual(403);

        const usdb = await usrRep.findOne(tstUsr.id, { relations: ["roles"] });
        expect(usdb).not.toBeUndefined();
        expect(usdb.roles).toHaveLength(1);
        expect(usdb.roles[0].name).toEqual(grpName);
    });
});

// Group tests.
describe("28. POST /api/roles", () => {
    it("Test creating a group as an admin.", async () => {
        await createGroup(adminUsr, "g", 200);
    });

    it("Test creating a group as a non-admin.", async () => {
        await createGroup(usr1, "g", 403);
    });
});

describe("29. PUT /api/roles/:rid", () => {
    it("Test updating role as an admin.", async () => {
        const grp = await createGroup(adminUsr, "g", 200);

        grp.name = "DSFSFSD";
        grp.description = "SDFSdfsfasdfaf";

        const resp = await request(app)
                           .put(`/api/roles/${grp.id}`)
                           .send(grp)
                           .set("User-Id", `${adminUsr.id}`);

        expect(resp).not.toBeUndefined();
        expect(resp.status).toEqual(200);

        const rldb = await rlRep.findOne(grp.id);
        expect(rldb.name).toEqual(grp.name);
        expect(rldb.description).toEqual(grp.description);
    });

    it("Test updating role as a non-admin.", async () => {
        const grp = await createGroup(adminUsr, "g", 200);

        const grpbk = JSON.parse(JSON.stringify(grp));

        grp.name = "DSFSFSD";
        grp.description = "SDFSdfsfasdfaf";

        const resp = await request(app)
                           .put(`/api/roles/${grp.id}`)
                           .send(grp)
                           .set("User-Id", `${usr1.id}`);

        expect(resp).not.toBeUndefined();
        expect(resp.status).toEqual(403);

        const rldb = await rlRep.findOne(grp.id);
        expect(rldb.name).toEqual(grpbk.name);
        expect(rldb.description).toEqual(grpbk.description);
    });
});

describe("30. DELETE /api/roles/:rid", () => {
    it("Test deleting a role as an admin.", async () => {
        const wfNum = 5;
        const stNum = 3;
        const dcNum = 2;
        const grpName = "g";

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);
        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(adminUsr, wfs, dcNum, 200);

        // Give the group mixed permissions on workflows and stages.
        await setWFSPermsForGroup(adminUsr, grpName, wfs, "READ", 200, [Math.floor(wfNum / 2)]);
        await setWFSSTSPermsForGroup(adminUsr, grpName, wfs, "WRITE", 200, [Math.floor(stNum / 2)]);
        await addUserToGroup(adminUsr, grpName, usr1, 200);

        const grp = await rlRep.findOne({ where: { name: grpName } });
        const resp = await request(app)
                           .delete(`/api/roles/${grp.id}`)
                           .set("User-Id", `${adminUsr.id}`);

        expect(resp).not.toBeUndefined();
        expect(resp.status).toEqual(204);

        const usdb = await usrRep.findOne(usr1.id, { relations: ["roles"] });
        expect(usdb).not.toBeUndefined();
        expect(usdb.roles).not.toBeUndefined();
        expect(usdb.roles).toHaveLength(0);

        const stpdb = await stPRep.find();
        expect(stpdb).toHaveLength(0);

        const wfpdb = await wfPRep.find();
        expect(wfpdb).toHaveLength(0);
    });

    it("Test deleting a role as a non-admin.", async () => {
        const wfNum = 5;
        const stNum = 3;
        const dcNum = 2;
        const grpName = "g";

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);
        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(adminUsr, wfs, dcNum, 200);

        // Give the group mixed permissions on workflows and stages.
        await setWFSPermsForGroup(adminUsr, grpName, wfs, "READ", 200, [Math.floor(wfNum / 2)]);
        await setWFSSTSPermsForGroup(adminUsr, grpName, wfs, "WRITE", 200, [Math.floor(stNum / 2)]);
        await addUserToGroup(adminUsr, grpName, usr1, 200);

        const grp = await rlRep.findOne({ where: { name: grpName } });
        const resp = await request(app)
                           .delete(`/api/roles/${grp.id}`)
                           .set("User-Id", `${usr1.id}`);

        expect(resp).not.toBeUndefined();
        expect(resp.status).toEqual(403);

        const usdb = await usrRep.findOne(usr1.id, { relations: ["roles"] });
        expect(usdb).not.toBeUndefined();
        expect(usdb.roles).not.toBeUndefined();
        expect(usdb.roles).toHaveLength(1);

        const stpdb = await stPRep.find();
        expect(stpdb.length).toBeGreaterThan(0);

        const wfpdb = await wfPRep.find();
        expect(wfpdb.length).toBeGreaterThan(0);
    });
});

describe("31. PUT /api/roles/:rid/stage/:sid", () => {
    it("Test adding stage permissions for a group as a non-admin.", async () => {
        const wfNum = 5;
        const stNum = 3;
        const dcNum = 2;
        const grpName = "g";

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);
        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(adminUsr, wfs, dcNum, 200);

        await createGroup(adminUsr, grpName, 200);
        await setSTPermForGroup(usr1, grpName, wfs[0].stages[0], "WRITE", 403);
    });
});

describe("32. PUT /api/roles/:rid/workflow/:wid", () => {
    it("Test adding workflow permissions for a group as a non-admin.", async () => {
        const wfNum = 5;
        const stNum = 3;
        const dcNum = 2;
        const grpName = "g";

        const wfs = await reqWFSGetResps(adminUsr, 200, wfNum, "WRITE", null);
        await addStagesToWFS(adminUsr, wfs, stNum, 200, "WRITE", "RAND", false, "ST");
        await addDocsToWFSStages(adminUsr, wfs, dcNum, 200);

        await createGroup(adminUsr, grpName, 200);
        await setWFPermForGroup(usr1, grpName, wfs[0], "WRITE", 403);
    });
});

//// ----------------------------------------------------------------------------------
//// |--------------------------------------------------------------------------------|
//// |--------------------------------------------------------------------------------|
//// |--------------------------------------------------------------------------------|
//// |--------------------------------------------------------------------------------|
//// |--------------------------------------------------------------------------------|
//// |                                 GENERATE DATA                                  |
//// |--------------------------------------------------------------------------------|
//// |--------------------------------------------------------------------------------|
//// |--------------------------------------------------------------------------------|
//// |--------------------------------------------------------------------------------|
//// |--------------------------------------------------------------------------------|
//// ----------------------------------------------------------------------------------
//
// describe("Generate data, this should always be run last.", () => {
//    it("Generate data for testing.", async () => {
//        const usrNum = 25;
//        const wfNum = 10;
//        const dcNum = 4;
//
//        // Create an admin user.
//        const adminUserNew = new NRUser();
//        adminUserNew.firstName = "Administrative";
//        adminUserNew.lastName = "User";
//        adminUserNew.userName = "admin";
//        adminUserNew.email = "admin@newsroom.com";
//
//        const adminUser = await usrRep.save(adminUserNew);
//        usr = adminUser;
//
//        // Create users.
//        const createdUsers: NRUser[] = [];
//        const usrFirst = [
//            "Greg", "Samantha", "Peter",
//            "Joe", "Andrew", "Justin",
//            "Katherine", "Jake", "Conner",
//            "Youssef", "Kyle", "Clark",
//        ];
//        const usrLast = [
//            "Smith", "Johnson", "French",
//             "King", "Graves", "Bradley",
//             "Wright", "Parker", "Hunt", "Nelson",
//        ];
//        for (let i = 0; i < usrNum; i++) {
//            // Make sure that usernames are unique.
//            const usrNew = new NRUser();
//            do {
//                usrNew.firstName = usrFirst[Math.round(Math.random() * usrFirst.length)];
//                usrNew.lastName = usrLast[Math.round(Math.random() * usrLast.length)];
//                usrNew.userName = usrNew.firstName.charAt(0).toLowerCase() + usrNew.lastName.toLowerCase();
//            } while (createdUsers.findIndex((x) => x.userName === usrNew.userName) !== -1);
//
//            usrNew.email = usrNew.userName + "@newsroom.com";
//
//            const resp = await request(app)
//                              .post("/api/users")
//                              .send(usrNew)
//                              .set("User-Id", `${usr.id}`);
//
//            expect(resp.status).toEqual(200);
//            createdUsers.push(resp.body);
//        }
//
//        // Create workflows.
//        const createdWorkflows: NRWorkflow[] = [];
//        const wfFirst = [ "World", "Sports", "Fashion", "Opinion", "Health", "Food", "Travel", "Tech", "Arts", "Business"];
//        const wfLast = ["Articles", "Blogs", "Papers", "Tidbits", "Pieces"];
//        for (let i = 0; i < wfNum; i++) {
//            // Make sure workflow names are unique.
//            const wfNew = new NRWorkflow();
//            do {
//                wfNew.name = wfFirst[Math.round(Math.random() * wfFirst.length)] + wfLast[Math.round(Math.random() * wfLast.length)];
//            } while (createdWorkflows.findIndex((x) => x.name === wfNew.name) !== -1);
//
//            wfNew.description = "A workflow for " + wfNew.name + ".";
//            wfNew.permission = 1;
//
//            const resp = await request(app)
//                               .post("/api/workflows")
//                               .send(wfNew)
//                               .set("User-Id", `${usr.id}`);
//
//            expect(resp.status).toEqual(200);
//            createdWorkflows.push(resp.body);
//        }
//
//        // Create stages.
//        const stFirstDraft = ["First Draft", "The first draft of an article, intended to flesh out ideas and get them on paper."];
//        const stSecondDraft = ["Second Draft", "A more formalized draft with cohesive writing and progress towards a more finished product."];
//        const stFactCheck = ["Fact Check", "Pertaining to articles that involve real-world facts or statistics, this stage serves to the author of the article and forces them to double check their own facts."];
//        const stPeerReview = ["Peer Review", "Before moving onto the edit phase, get feedback from others about the general topic of your piece without them actually looking at it."];
//        const stFirstEdit = ["First Edit", "The first edit phase, focused more on ideas and overall article flow rather than formatting and grammatical errors."];
//        const stSecondEdit = ["Second Edit", "The second edit phase, focused more on formatting and grammatical errors as well as final checks."];
//        const stFinalReview = ["Final Review", "The final review meant to hopefully catch any mistakes that were missed earlier."];
//        const stReadyToPublish = ["Ready to Publish", "The document has been fully finalized and is ready to publish."];
//        const stDefault = [
//            stFirstDraft,
//            stSecondDraft,
//            stFactCheck,
//            stPeerReview,
//            stFirstEdit,
//            stSecondEdit,
//            stFinalReview,
//            stReadyToPublish,
//        ];
//        const stUrgent = [stFirstDraft, stFactCheck, stFirstEdit, stFinalReview, stReadyToPublish];
//        const stOpinion = [stFirstDraft, stSecondDraft, stPeerReview, stFirstEdit, stFinalReview, stReadyToPublish];
//        for (const wf of createdWorkflows) {
//            let choice;
//            if (
//                (wf.name.toLowerCase().search("opinion") === 0 ) ||
//                (wf.name.toLowerCase().search("blog") === 0 )  ||
//                (wf.name.toLowerCase().search("fashion") === 0 )
//            ) {
//                choice = stOpinion;
//            } else if (
//                (wf.name.toLowerCase().search("world") === 0 ) ||
//                (wf.name.toLowerCase().search("business") === 0 )
//            ) {
//                choice = stUrgent;
//            } else {
//                choice = stDefault;
//            }
//
//            for (const st of choice) {
//                const stNew = new NRStage();
//                stNew.name = st[0];
//                stNew.description = st[1];
//                stNew.permission = 1;
//
//                const resp = await request(app)
//                                   .post(`/api/workflows/${wf.id}/stages`)
//                                   .send(stNew)
//                                   .set("User-Id", `${usr.id}`);
//
//                expect(resp.status).toEqual(200);
//                wf.stages.push(resp.body);
//            }
//        }
//    });
// });

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

// hjkl
function createWF(perm: string) {
    const wf = new NRWorkflow();
    wf.id = wfSeq;
    wfSeq++;

    wf.name = "WF_" + Guid.create().toString();
    wf.description = wf.name + "_DESC";
    wf.stages = [];

    if (perm === "WRITE") {
        wf.permission = DBConstants.WRITE;
    } else if (perm === "READ") {
        wf.permission = DBConstants.READ;
    }

    return wf;
}

// hjkl
async function reqWFGetResp(us: NRUser, status: number, perm: string, users: NRUser[]) {
    const wf = createWF(perm);

    const resp = await request(app)
                       .post("/api/workflows")
                       .send(wf)
                       .set("User-Id", `${us.id}`);

    expect(resp).not.toBeUndefined();
    expect(resp.status).toEqual(status);

    const wfr = resp.body;

    if (users !== null) {
        expect(true).toEqual(false);
    }

    if (status === 200) {
        // It won't have stages or documents if we've just created it.
        await verifyWFResp(us, wf, wfr, false, false);
        await verifyWFDB(us, wf, false, false);
    } else if (status === 403) {
        const wfdb = await wfRep.findOne(wf.id);
        expect(wfdb).toBeUndefined();
    }

    return resp.body;
}

// hjkl
async function reqWFSGetResps(us: NRUser, status: number, num: number, perm: string, users: NRUser[]) {
    const wfrs: NRWorkflow[] = [];

    for (let i = 0; i < num; i++) {
        wfrs.push(await reqWFGetResp(us, status, perm, users));
    }

    return wfrs;
}

// hjkl
async function addStageToWF(us: NRUser, wf: NRWorkflow, status: number, perm: string,
                            pos: string, verifyDocs: boolean, whichPerm: string) {
    if (wf.stages === undefined) {
        wf.stages = [];
    }

    const st = new NRStage();
    st.id = stSeq;
    stSeq++;

    st.permission = (perm === "WRITE") ? DBConstants.WRITE : DBConstants.READ;

    st.name = "ST_" + Guid.create().toString();
    st.description = st.name + "_DESC";

    // The expected location of the stage.
    let loc;
    let resp;

    if (pos === "APPEND") {
        resp = await request(app)
                     .post(`/api/workflows/${wf.id}/stages`)
                     .send(st)
                     .set("User-Id", `${us.id}`);
    } else {
        // Choose a random location, or convert the passed one to a number.
        loc = (pos === "RAND") ? Math.round(Math.random() * wf.stages.length) : +pos;

        resp = await request(app)
                    .post(`/api/workflows/${wf.id}/stages/${loc}`)
                    .send(st)
                    .set("User-Id", `${us.id}`);

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

        await verifySTResp(us, st, str, wf, verifyDocs, whichPerm);
    }
}

// hjkl
async function addStagesToWF(us: NRUser, wf: NRWorkflow, numStages: number, status: number,
                             perm: string, pos: string, verifyDocs: boolean, whichPerm: string) {
    for (let i = 0; i < numStages; i++) {
        await addStageToWF(us, wf, status, perm, pos, verifyDocs, whichPerm);
    }
}

// hjkl
async function addStagesToWFS(us: NRUser, wfs: NRWorkflow[], numStages: number, status: number,
                              perm: string, pos: string, verifyDocs: boolean, whichPerm: string) {
    for (const wf of wfs) {
        await addStagesToWF(us, wf, numStages, status, perm, pos, verifyDocs, whichPerm);
    }
}

async function changeWFPerm(us: NRUser, wf: NRWorkflow, perm: string, exists: boolean) {
    let priv;
    if (perm === "RAND") {
        priv = Math.round(Math.random());
    } else {
        priv = (perm === "WRITE") ? DBConstants.WRITE : DBConstants.READ;
    }

    if (exists === false) {
        const grpName = Guid.create().toString();

        // TODO: Below need to specify which user.
        expect(true).toEqual(false);
        const grp = await addUserToGroup(us, grpName, usr1, 200);
        await setWFPermForGroup(us, grp.name, wf, perm, 200);
    } else {
        const grpdb: NRWFPermission = await wfPRep.findOne({ where: { relations: ["role"],
                                                                      workflow: wf } });
        await setWFPermForGroup(us, grpdb.role.name, wf, perm, 200);
    }
}

async function changeWFSPerms(us: NRUser, wfs: NRWorkflow[], perm: string, exists: boolean) {
    for (const wf of wfs) {
        await changeWFPerm(us, wf, perm, exists);
    }
}

async function changeWFSSTSPerms(us: NRUser, wfs: NRWorkflow[], perm: string, exists: boolean) {
    for (const wf of wfs) {
        for (const st of wf.stages) {
            await changeSTPerm(us, st, perm, exists);
        }
    }
}

async function changeSTPerm(us: NRUser, st: NRStage, perm: string, exists: boolean) {
    let priv;
    if (perm === "RAND") {
        priv = Math.round(Math.random());
    } else {
        priv = (perm === "WRITE") ? DBConstants.WRITE : DBConstants.READ;
    }

    if (exists === false) {
        const grpName = Guid.create().toString();

        // TODO: Below need to specify which user.
        expect(true).toEqual(false);
        const grp = await addUserToGroup(us, grpName, usr1, 200);
        await setSTPermForGroup(us, grp.name, st, perm, 200);
    } else {
        const grpdb: NRSTPermission = await stPRep.findOne({ where: { relations: ["role"],
                                                                      stage: st } });
        await setSTPermForGroup(us, grpdb.role.name, st, perm, 200);
    }
}

async function addDocsToStage(us: NRUser, st: NRStage, numDoc: number, status: number) {
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

        dc.creator = us;

        const resp = await request(app)
                           .post(`/api/documents/`)
                           .send(dc)
                           .set("User-Id", `${us.id}`);

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

async function addDocsToStages(us: NRUser, sts: NRStage[], num: number, status: number) {
    for (const st of sts) {
        await addDocsToStage(us, st, num, status);
    }
}

async function addDocsToWFSStages(us: NRUser, wfs: NRWorkflow[], num: number, status: number) {
    for (const wf of wfs) {
        await addDocsToStages(us, wf.stages, num, status);
    }
}

// hjkl
async function createGroup(us: NRUser, name: string, status: number) {
    const role = new NRRole();
    role.id = rlSeq;
    rlSeq++;

    // TODO: Use later?
    // role.name = Guid.create().toString();
    role.name = name;

    const resp = await request(app)
                       .post(`/api/roles`)
                       .send(role)
                       .set("User-Id", `${us.id}`);

    expect(resp.status).not.toBeUndefined();
    expect(resp.status).toEqual(status);

    if (status === 403) {
        return;
    }

    const grp = resp.body;
    expect(grp.id).toEqual(role.id);
    expect(grp.name).toEqual(role.name);

    const grpdb = await rlRep.findOne(grp.id);
    expect(grpdb).not.toBeUndefined();

    return grp;
}

// hjkl
async function createGroups(us: NRUser, status: number, num: number) {
    const grps: NRRole[] = [];

    for (let i = 0; i < num; i++) {
        const name = Guid.create().toString();
        grps.push(await createGroup(us, name, status));
    }

    return grps;
}

// hjkl
async function addUserToGroup(us: NRUser, grp: string, targUsr: NRUser, status: number) {
    let role: NRRole;

    // See if the group exists, or create it.
    try {
        role = await rlRep.findOneOrFail({ where: { name: grp }});
    } catch (err) {
        role = await createGroup(us, grp, 200);
    }

    const resp = await request(app)
                        .put(`/api/users/${targUsr.id}/role/${role.id}`)
                        .set("User-Id", `${us.id}`);

    expect(resp.status).not.toBeUndefined();
    expect(resp.status).toEqual(status);

    const usrr = resp.body;

    if (status === 200) {
        await verifyUserInGroup(usrr, role);
    }

    return role;
}

async function setWFPermForGroup(us: NRUser, name: string, wf: NRWorkflow, perm: string, status: number) {
    let role;

    try {
        role = await rlRep.findOneOrFail({ where: { name }});
    } catch (err) {
        role = await createGroup(us, name, 200);
    }

    const resPerm = (perm === "WRITE") ? DBConstants.WRITE : DBConstants.READ;

    // Give permissions to the given workflow.
    const resp = await request(app)
                       .put(`/api/roles/${role.id}/workflow/${wf.id}`)
                       .send({ access: resPerm })
                       .set("User-Id", `${us.id}`);

    expect(resp).not.toBeUndefined();
    expect(resp.status).toEqual(status);

    if (status === 403) {
        return;
    }

    const wfpr = resp.body;
    expect(wfpr.access).toEqual(resPerm);

    const wfpdb = await wfPRep.findOne(wfpr.id, { relations: ["workflow"] });
    expect(wfpdb.workflow.id).toEqual(wf.id);
    expect(wfpdb.access).toEqual(resPerm);

    wf.permission = resPerm;

    return resp.body;
}

async function setWFSPermsForGroup(us: NRUser, name: string, wfs: NRWorkflow[], perm: string, status: number,
                                   skipIndexes: number[]) {
    const oppositePerm = (perm === "WRITE") ? "READ" : "WRITE";

    for (let i = 0; i < wfs.length; i++) {
        const doPerm = (skipIndexes.includes(i)) ? oppositePerm : perm;
        const intPerm = (doPerm === "WRITE") ? DBConstants.WRITE : DBConstants.READ;

        await setWFPermForGroup(us, name, wfs[i], doPerm, status);
        wfs[i].permission = intPerm;
    }
}

async function setSTPermForGroup(us: NRUser, name: string, st: NRStage, perm: string, status: number) {
    let role;

    try {
        role = await rlRep.findOneOrFail({ where: { name }});
    } catch (err) {
        role = await createGroup(us, name, 200);
    }

    const resPerm = (perm === "WRITE") ? DBConstants.WRITE : DBConstants.READ;

    // Add the user to the group.
    const resp = await request(app)
                        .put(`/api/roles/${role.id}/stage/${st.id}`)
                        .send({access: resPerm})
                        .set("User-Id", `${us.id}`);

    expect(resp).not.toBeUndefined();
    expect(resp.status).toEqual(status);

    if (status === 403) {
        return;
    }

    const stpr = resp.body;
    expect(stpr.access).toEqual(resPerm);

    const stpdb = await stPRep.findOne(stpr.id, { relations: ["stage"] });
    expect(stpdb.stage.id).toEqual(st.id);
    expect(stpdb.access).toEqual(resPerm);

    st.permission = resPerm;

    // Update documents to match stage permissions.
    if (st.documents !== undefined) {
        for (const dc of st.documents) {
            dc.permission = resPerm;
        }
    }
}

async function setSTSPermsForGroup(us: NRUser, name: string, sts: NRStage[], perm: string, status: number,
                                   skipIndexes: number[]) {
    const oppositePerm = (perm === "WRITE") ? "READ" : "WRITE";

    for (let i = 0; i < sts.length; i++) {
        const doPerm = (skipIndexes.includes(i)) ? oppositePerm : perm;
        const intPerm = (doPerm === "WRITE") ? DBConstants.WRITE : DBConstants.READ;

        await setSTPermForGroup(us, name, sts[i], doPerm, status);
    }
}

async function setWFSSTSPermsForGroup(us: NRUser, name: string, wfs: NRWorkflow[], perm: string, status: number,
                                      skipIndexes: number[]) {
    for (const wf of wfs) {
        await setSTSPermsForGroup(us, name, wf.stages, perm, status, skipIndexes);
    }
}

async function clearGroups() {
    const allGrps = await rlRep.find();

    for (const grp of allGrps) {
        await rlRep.remove(grp);
    }
}

async function clearAllPermissions() {
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
    await wfPRep.createQueryBuilder()
                .delete()
                .from(NRWFPermission)
                .where(`${DBConstants.WFPERM_TABLE}.workflowId = :wid`, { wid: wf.id })
                .execute();

    wf.permission = DBConstants.READ;

    if (wf.stages !== undefined) {
        for (const st of wf.stages) {
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

function changeSTSPermToMatchWF(wf: NRWorkflow, sts: NRStage[]) {
    for (const st of sts) {
        st.permission = wf.permission;
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

async function changeWFSPermsToGroup(us: NRUser, wfs: NRWorkflow[]) {
    // Change to group permissions.
    for (const wf of wfs) {
        await clearWFPermissions(wf);

        const perm = Math.round(Math.random());
        const priv = (perm === 1) ? "WRITE" : "READ";

        await changeWFPerm(us, wf, priv, false);
    }
}

async function changeSTSPermsToGroup(us: NRUser, sts: NRStage[]) {
    // Change to group permissions.
    for (const st of sts) {
        await clearSTPermissions(st);

        const perm = Math.round(Math.random());
        const priv = (perm === 1) ? "WRITE" : "READ";

        await changeSTPerm(us, st, priv, false);
    }
}

async function changeWFSSTPermToGroup(us: NRUser, wfs: NRWorkflow[]) {
    for (const wf of wfs) {
        await clearSTSPermissions(wf.stages);
        await changeSTSPermsToGroup(us, wf.stages);
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
                       .set("User-Id", `${adminUsr.id}`);

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

// hjkl
function changeLocalWFSPerms(wfs: NRWorkflow[], perm: string, doStages: boolean) {
    for (const wf of wfs) {
        changeLocalWFPerms(wf, perm, doStages);
    }
}

// hjkl
function changeLocalWFPerms(wf: NRWorkflow, perm: string, doStages: boolean) {
    wf.permission = (perm === "WRITE") ? DBConstants.WRITE : DBConstants.READ;

    if (doStages) {
        for (const st of wf.stages) {
            st.permission = (perm === "WRITE") ? DBConstants.WRITE : DBConstants.READ;
        }
    }
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

async function verifyWFDB(us: NRUser, wf: NRWorkflow, verifyStages: boolean, verifyDocuments: boolean) {
    const wfdb = await wfRep.findOneOrFail(wf.id);

    expect(wfdb.name).not.toBeUndefined();
    expect(wf.name).toEqual(wfdb.name);

    expect(wfdb.description).not.toBeUndefined();
    expect(wf.description).toEqual(wfdb.description);

    if (wf.permission === undefined) {
        expect(await permServ.getWFPermForUser(wf, us)).toEqual(DBConstants.READ);
    } else {
        expect(wf.permission).toEqual(await permServ.getWFPermForUser(wf, us));
    }

    if (verifyStages) {
        if (wf.stages === undefined) {
            // Specified to verify stages, but the workflow had none.
            expect(true).toEqual(false);
        }

        await verifySTSDB(us, wf.stages, wf, verifyDocuments);
    } else if (wf.stages !== undefined) {
        if ((wf.stages.length !== 0) && (verifyStages)) {
            // Specified to not verify stages, but the workflow had them.
            expect(true).toEqual(false);
        }
    }
}

async function verifyWFSDB(us: NRUser, wfs: NRWorkflow[], verifyStages: boolean, verifyDocuments: boolean) {
    for (const wf of wfs) {
        await verifyWFDB(us, wf, verifyStages, verifyDocuments);
    }
}

async function verifyWFResp(us: NRUser, wf: NRWorkflow, wfr: NRWorkflow, verifyStages: boolean, verifyDocs: boolean) {
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

        if ((wf.stages !== undefined) && (wfr.stages.length === 0)) {
            expect(wfr.stages.length).toEqual(wf.stages.length);
        }

        await verifySTResps(us, wf.stages, wfr.stages, wf, verifyDocs, "ST");
    } else {
        if (wfr.stages !== undefined) {
            expect(wfr.stages).toHaveLength(0);
        } else {
            expect(wfr.stages).toBeUndefined();
        }
    }
}

// hjkl
async function verifyWFResps(us: NRUser, wfs: NRWorkflow[], wfrs: NRWorkflow[], verifyStages: boolean, verifyDocs: boolean) {
    expect(wfs.length).toEqual(wfrs.length);

    const wfss = wfs.sort((a: NRWorkflow, b: NRWorkflow) => a.id - b.id);
    const wfrss = wfrs.sort((a: NRWorkflow, b: NRWorkflow) => a.id - b.id);

    for (let i = 0; i < wfs.length; i++) {
        await verifyWFResp(us, wfss[i], wfrss[i], verifyStages, verifyDocs);
    }
}

async function verifySTDB(us: NRUser, st: NRStage, wf: NRWorkflow, seq: number, verifyDocuments: boolean) {
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
        expect(await permServ.getSTPermForUser(st, us)).toEqual(DBConstants.READ);
    } else {
        const res = await permServ.getSTPermForUser(st, us);
        expect(st.permission).toEqual(res);
    }

    if (verifyDocuments) {
        await verifyDCSDB(st.documents, st, wf);
    }
}

async function verifySTSDB(us: NRUser, sts: NRStage[], wf: NRWorkflow, verifyDocuments: boolean) {
    expect(sts.length).toBeGreaterThanOrEqual(0);

    let i = 1;

    const stss = sts.sort((a: NRStage, b: NRStage) => a.sequenceId - b.sequenceId);

    for (const st of stss) {
        await verifySTDB(us, st, wf, i, verifyDocuments);
        i += 1;
    }
}

async function verifyWFSSTSDB(us: NRUser, wfs: NRWorkflow[], verifyDocuments: boolean) {
    for (const wf of wfs) {
        await verifySTSDB(us, wf.stages, wf, verifyDocuments);
    }
}

async function verifySTResp(us: NRUser, st: NRStage, str: NRStage, wf: NRWorkflow, verifyDocs: boolean,
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
        // expect(wf.permission).toEqual(str.permission);
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

async function verifySTResps(us: NRUser, sts: NRStage[], strs: NRStage[], wf: NRWorkflow,
                             verifyDocs: boolean, whichPerm: string) {
    expect(sts.length).toEqual(strs.length);

    const stss = sts.sort((a: NRStage, b: NRStage) => a.sequenceId - b.sequenceId);
    const strss = strs.sort((a: NRStage, b: NRStage) => a.sequenceId - b.sequenceId);

    for (let i = 0; i < sts.length; i++) {
        await verifySTResp(us, stss[i], strss[i], wf, verifyDocs, whichPerm);
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

    dcs.sort((a: NRDocument, b: NRDocument) => a.id - b.id);
    dcrs.sort((a: NRDocument, b: NRDocument) => a.id - b.id);

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

// hjkl
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

async function verifyWFDeleted(wf: NRWorkflow, hadStages: boolean, hadDocuments: boolean) {
    const wfdb = await wfRep.findOne(wf.id);
    expect(wfdb).toBeUndefined();

    const wfpdb = await wfPRep.find({ where: { workflow: wf.id } });
    expect(wfpdb).toHaveLength(0);

    if (hadStages === true) {
        const stdb = await stRep.find({ where: { workflow: wf } });
        expect(stdb).toHaveLength(0);

        for (const st of wf.stages) {
            // If we are deleting a workflow, the documents should have a null relationship
            // with the newly deleted workflow and its stages.
            if (hadDocuments) {
                for (const dc of st.documents) {
                    dc.workflow = null;
                    dc.stage = null;
                }
            }

            // Don't check sequences because we are deleting all stages.
            await verifySTDeleted(st, wf.stages, hadDocuments, false);
        }

        wf.stages = undefined;
    }
}

async function verifySTDeleted(st: NRStage, sts: NRStage[], hadDocuments: boolean, checkSeq: boolean) {
    const stdb = await stRep.findOne(st.id);
    expect(stdb).toBeUndefined();

    const stpdb = await stPRep.find({ where: { stage: st.id } });
    expect(stpdb).toHaveLength(0);

    // Check sequences for other stages.
    if (checkSeq) {
        for (let i = 0; i < sts.length; i++) {
            const ostdb = await stRep.findOne(sts[i].id);

            expect(ostdb.sequenceId).toEqual(i + 1);
        }
    }

    if (hadDocuments) {
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
