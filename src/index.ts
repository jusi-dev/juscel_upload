import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import path from "path";

import { generate, removeOutputs } from './utils'
import { getAllFiles } from './file'
import { uploadFile, pushToSQS, updateStatus, getStatus } from './aws'

const app = express();
app.use(cors())
app.use(express.json());

app.post("/deploy", async (req, res) => {
    const repoUrl = req.body.repoUrl;
    const buildCommand = req.body.buildCommand;
    const installCommand = req.body.installCommand;

    const id = generate();
    await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));

    const files = getAllFiles(path.join(__dirname, `output/${id}`))

    await Promise.all(files.map(async file => {
        console.log("Uploading file: ", file);
        await uploadFile(file.slice(__dirname.length + 1), file);
    }));

    console.log("Pushing to SQS")
    pushToSQS(id);
    updateStatus(id, 'Uploading Files...', buildCommand, installCommand);
    removeOutputs(id);

    res.json({
        id: id
    })
})

app.get("/status", async (req, res) => {
    const id = req.query.id as string;
    const status = await getStatus(id);
    res.json({
        status: status
    })
})

app.listen(3000);