import express from "express";

export const register = (app: express.Application) => {
    app.get("/", (req: any, res) => {
        console.info("GET request recieved");
        return res.send("OK");
    });
};
