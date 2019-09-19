import { expect } from "chai";
import "mocha";
import {agent as request} from "supertest";

import app from "../../";
import { NRStage, NRWorkflow } from "../../entity";
import { WorkflowResource } from "../../resources/WorkflowResource";
import { WorkflowService } from "../../services/WorkflowService";

describe("Workflow", () => {
  // before(function() {
  //   process.env.TESTING_MODE = "yeet";
  // });

  it("createWorkflow", async function() {
    const wf = new NRWorkflow();
    wf.name = "Test Name";
    wf.description = "Test description.";

    const res = await request(app).post("/api/workflows/");
    // expect(res.body.data).not.to.be.empty;
  });

});
