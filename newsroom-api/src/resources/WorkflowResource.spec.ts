import express from "express";
import request, { Response } from "supertest";
import { Connection, getRepository, Repository } from "typeorm";
import App from "../app";

import { NRWorkflow, NRUser, NRRole, NRStage } from "../entity";

// TODO:
//   - Test validators.

// Globals used by all tests.
let app: express.Express;
let conn: Connection;
let user: NRUser;
let wfRep: Repository<NRWorkflow>;
let stRep: Repository<NRStage>;
let usrRep: Repository<NRUser>;
let rlRep: Repository<NRRole>;

// Name prefixes used for test verification.
const WF_NAME = "TEST_WORKFLOW_";
const WF_DESC = "TEST_WF_DESC_";
const ST_NAME = "TEST_STAGE_";
const ST_DESC = "TEST_STAGE_DESC_";

beforeAll(async (done) => {
    // Configure without oauth.
    app = await App.configure(false);

    // Can't have two active connections to the DB, so just use 
    // the one made by the app.
    conn = App.getDBConnection();

    // DB connections for different objects.
    wfRep = getRepository(NRWorkflow);
    stRep = getRepository(NRStage);
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
        await createWorkflowsVerifyResp(1, 'READ', 200, 0);
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
        const ret = await createWorkflowsVerifyResp(wfNum, 'READ', 200, 0);
        const wfs: NRWorkflow[] = ret.get('wfs');
        const wfResps: NRWorkflow[] = ret.get('wfResps');
        const resps: Response[] = ret.get('resps');

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
describe("GET /workflow/:wid", () => {
    it("Test getting a single workflow.", async () => {
        // Verify:
        //  - Response status is 200 OK for each created workflow.
        //  - Returned name and description is correct for
        //    each created workflow.
        //  - GET for each workflows returns a 200 OK.
        //  - The response matches the workflow we created.
        const wfNum = 5;

        // Create 'wfNum' workflows with READ permissions.
        const ret = await createWorkflowsVerifyResp(wfNum, 'READ', 200, 0);
        const wfs: NRWorkflow[] = ret.get('wfs');
        const wfResps: NRWorkflow[] = ret.get('wfResps');
        const resps: Response[] = ret.get('resps');

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
        const ret = await createWorkflowsVerifyResp(wfNum, 'WRITE', 200, 0);
        const wfs: NRWorkflow[] = ret.get('wfs');
        const wfResps: NRWorkflow[] = ret.get('wfResps');
        const resps: Response[] = ret.get('resps');

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
            for (let j = 0; j < wfResps.length; j++) {
                const wfdb = await wfRep.findOne({ where: { id: wfResps[j].id }});
                expect(wfResps[j].name).toEqual(wfdb.name);
                expect(wfResps[j].description).toEqual(wfdb.description);
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
        const ret = await createWorkflowsVerifyResp(1, 'READ', 200, 0);
        const wfs: NRWorkflow[] = ret.get('wfs');
        const wfResps: NRWorkflow[] = ret.get('wfResps');
        const resps: Response[] = ret.get('resps');

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
//   Test permissions returned properly with workflow object.
//   Do something with leftover stages?
//   Test with documents added as well.
describe("DELETE /workflow/:wid", () => {
    it("Test deleting a workflow WITH permissions, no stages or documents.", async () => {
        // Verify:
        //  - Response status is 200 OK for each created workflow.
        //  - Returned name and description is correct for
        //    each created workflow.
        //  - The workflow is no longer present in the DB.
        const wfNum = 1;

        // Create 'wfNum' workflows with READ permissions.
        const ret = await createWorkflowsVerifyResp(wfNum, 'WRITE', 200, 0);
        const wfs: NRWorkflow[] = ret.get('wfs');
        const wfResps: NRWorkflow[] = ret.get('wfResps');
        const resps: Response[] = ret.get('resps');

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
        const ret = await createWorkflowsVerifyResp(wfNum, 'READ', 200, 0);
        const wfs: NRWorkflow[] = ret.get('wfs');
        const wfResps: NRWorkflow[] = ret.get('wfResps');
        const resps: Response[] = ret.get('resps');

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
        const wfNum = 1;

        // Create 'wfNum' workflows with READ permissions.
        const ret = await createWorkflowsVerifyResp(wfNum, 'WRITE', 200, 5);
        const wfs: NRWorkflow[] = ret.get('wfs');
        const wfResps: NRWorkflow[] = ret.get('wfResps');
        const resps: Response[] = ret.get('resps');

        for (let wf of wfResps) {
            console.log(wf);
        }

        const resp = await request(app)
                            .delete(`/api/workflows/${wfResps[0].id}`)
                            .set("User-Id", `${user.id}`);
        expect(resp.status).toEqual(200);

        // Verify it no longer exists in the DB.
        const wfdb = await wfRep.findOne({ where: { id: wfResps[0].id }});
        expect(wfdb).toEqual(undefined);
        
        // // Verify that the stages no longer exist.
        // for (let stage in wfResps[0].stages) {
        //     const stdb = await stRep.findOne({ where: { id: stage.id }});
        //     expect(stdb).toEqual(undefined);
        // }
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
 * 
 * return: A Map<string, object> with keys:
 *      'wfs': The NRWorkflow objects created to send.
 *      'wfResps': The NRWorkflow objects returned from the POST.
 *      'resps': The raw Response to each POST.
 */
async function createWorkflowsVerifyResp(num: number, perm: string, status: number, stages: number) {
    let wfs: NRWorkflow[] = [];
    let wfResps: NRWorkflow[] = [];
    let resps: Response[] = [];

    for (let i = 0; i < num; i++) {
        const wf = new NRWorkflow;
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
        const role: NRRole = res.get('role');

        // Add 'perm' permissions between the group and workflow.
        await setWFPermForGroup(role, resp.body, perm, 200);
    }

    for (let i = 0; i < num; i++ ) {
        wfResps[i].stages = [];
        for (let j = 0; j < stages; j++) {
            const st = new NRStage();
            st.name = ST_NAME + `${wfResps[i].name}_${j}`;
            st.description = ST_DESC + `${wfResps[i].name}_${j}`;

            const resp = await request(app)
                                .post(`/api/workflows/${wfResps[i].id}/stages`)
                                .send(st)
                                .set("User-Id", `${user.id}`);

            expect(resp.status).toEqual(200);

            // Update what is returned so it has stages.
            wfResps[i].stages.push(resp.body);
        }
    }

    let ret = new Map<string, any>();
    ret.set('wfs', wfs);
    ret.set('wfResps', wfResps);
    ret.set('resps', resps);

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
async function addUserToGroup(groupName: string, user: NRUser, status: number) {
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
        dbUser = await usrRep.findOneOrFail({ where: { name: user.userName }});
    } catch (err) {
        dbUser = await usrRep.save(user);
    }

    // Add the user to the group.
    const resp = await request(app)
                        .put(`/api/users/${dbUser.id}/role/${role.id}`)
                        .set("User-Id", `${user.id}`);
    expect(resp.status).toEqual(status);

    let ret = new Map<string, any>();
    ret.set('user', dbUser);
    ret.set('role', role);

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
    const resPerm = (perm === 'WRITE') ? 1 : 0;

    // Add the user to the group.
    const resp = await request(app)
                        .put(`/api/roles/${role.id}/workflow/${wf.id}`)
                        .send({"access": resPerm})
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