import express from "express";
import request from "supertest";
import App from "../app";

let app: express.Express;

beforeAll(async (done) => {
    app = await App.configure(false);

    done();
});

describe("GET /workflows", () => {
    it("Get Workflows", async () => {
        const result = await request(app).get("/api/workflows").set("User-Id", "1");

        expect(result.status).toEqual(200);
    });
});
