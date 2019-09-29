import App from "./app";

const port = process.env.SERVICE_PORT || 8000;

App.configure(true, true).then((express) => {
    express.listen(port, () => {
        console.info(`Server started at http://localhost:${port}.`);
    });
});
