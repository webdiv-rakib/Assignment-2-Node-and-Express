import express, { type Application } from "express"
const app: Application = express()
const port = 5000

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Assignment-2",
        author: "webdiv-rakib"
    });
});

app.post('/', async (req, res) => {
    const body = req.body
    const { name, email, password, address } = body;
    res.status(201).json({
        success: true,
        message: "User Created Successfully",
        data: {
            name,
            email,
            address
        }
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})