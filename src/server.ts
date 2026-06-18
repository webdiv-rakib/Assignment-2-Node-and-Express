import express, { type Application } from "express"
const app:Application = express()
const port = 3000

app.get('/', (req, res) => {
  
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})