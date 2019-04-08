"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = (app) => {
    app.get("/", (req, res) => {
        console.info("GET request recieved");
        return res.send("OK");
    });
};
//# sourceMappingURL=index.js.map