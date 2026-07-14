import express from "express";
import {env} from "./config/env";

const app = express();
app.use(express.json());

app.get("/", (_, res) => {
    res.send("Background Job Monitor API");
});

app.listen(env.PORT, () => {
    console.log(`API Server running on port ${env.PORT}`);
});