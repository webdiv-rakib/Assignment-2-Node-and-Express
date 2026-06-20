import express, { type Application } from "express"
import config from "./config/config";
import initDB from "./database/database";

const app: Application = express()
const port = config.port

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

initDB();

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        sever: "Assignment Server Running",
        message: "Assignment-2",
        author: "webdiv-rakib"
    });
});

app.post('/', async (req, res) => {
    const body = req.body;
    const { name, email, address } = body
    res.status(201).json({
        success: true,
        message: "User Created Successfully",
        data: { name, email, address }
    })
})

app.listen(port, () => {
    console.log(`The Server is running on: ${port}`)
})