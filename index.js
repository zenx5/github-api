import * as dotenv from "dotenv"
dotenv.config()
import express from "express"
import axios from "axios"



const app = express()
const port = 3000


app.get("/", async (req, res) => {
    const result = []
    for(let indexIterator=0; indexIterator < 10; indexIterator++ ){
        const { data, status} = await axios.get(String(process.env.GITHUB_RAW_URL).replace('{index}', indexIterator))
        result.push({
            url: process.env.GITHUB_RAW_URL.replace('{index}', indexIterator),
            content: data
        })
    }
    let echo = ''
    result.forEach( (item,index) => {
        const regExp = /dificultad: [FÁCIL|MEDIA|DIFÍCIL]{1,}/gi
        echo += "<div><a href='"+item.url+"'>Reto "+ index +"</a><br>"
        echo += "Difcultad : "+item.content.match(/dificultad: [FÁCIL|MEDIA|DIFÍCIL]{1,}/gi)[0].split(': ')[1]
        echo += "</div>"
    })
    res.send(echo)
})

app.get("/test", async (req, res) => {

    res.send("url: " + process.env.GITHUB_RAW_URL)
})

app.listen(port, ()=> console.log("hola, i'm running"))