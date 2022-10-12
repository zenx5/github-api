import * as dotenv from "dotenv"
import * as express from "express"
import axios from "axios"

dotenv.config()

const app = express()
const port = 3000


app.get("get", (req, res) => {
    
})

app.listen(port, ()=> console.log("hola, i'm running"))