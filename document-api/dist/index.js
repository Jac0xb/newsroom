"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const routes = __importStar(require("./routes"));
dotenv_1.default.config();
const port = process.env.DOCUMENT_API_PORT;
const app = express_1.default();
routes.register(app);
app.listen(port, () => {
    console.info(`server started at http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map