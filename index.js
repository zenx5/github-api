import * as dotenv from "dotenv"
dotenv.config()
import express from "express"
import axios from "axios"



const app = express()
const port = 3000

const getLinks = (start, end, callback) => async (req, res) => {
    const result = []
    for(let indexIterator=start; indexIterator < end; indexIterator++ ){
        const { data, status} = await axios.get(String(process.env.GITHUB_RAW_URL).replace('{index}', indexIterator))
        result.push({
            url: process.env.GITHUB_RAW_URL.replace('{index}', indexIterator),
            content: data
        })
    }
    res.send( callback( result ) )
}

app.get("/", getLinks(0, 10, result => {
    let echo = ''
    result.forEach( (item,index) => {
        const regExp = /dificultad: [FÁCIL|MEDIA|DIFÍCIL]{1,}/gi
        echo += "<div><a href='"+item.url+"'>Reto "+ index +"</a><br>"
        echo += "Difcultad : "+item.content.match(regExp)[0].split(': ')[1]
        echo += "</div>"
    })
    return echo
}))

app.get("/json", getLinks(0,10, result => result ))
app.get("/json/:id", (req, res)=>getLinks(
    parseInt( req.params.id ),
    parseInt( req.params.id ) + 1,
    result => result )(req, res)
)

app.get("/search/:user/:dep", async (req, res) => {
    const { user, dep } = req.params
    const { data, status} = await axios.get(`https://api.github.com/users/${user}/repos`)
    const packages = data.map( ({name, default_branch, html_url}) => ({
        package: `https://raw.githubusercontent.com/${user}/${name}/${default_branch}/package.json`,
        html_url
    }) )
    let result = []
    let errors = []
    for( let index = 0; index<packages.length; index++ ) {
        const fileuri = packages[ index ].package
        try{
            console.log("url", fileuri)
            const { data:packageContent } = await axios.get(fileuri)
            const keyDependencies = [
                ...Object.keys( packageContent?.devDependencies || {} ),
                ...Object.keys( packageContent?.dependencies || {} )
            ]
            console.log( keyDependencies )
            if( keyDependencies.includes(dep) ){
                result.push( packages[ index ].html_url )
            }else {
                throw new Error("dependencie not found")
            }
        }catch( error ) {
            errors.push( { name: fileuri, error: error.message } )
        }
    }

    res.send( {
        data: result,
        errors
    } )
})

app.get("/:user/repos", async(req, res) => {
    const { user } = req.params
    const { data, status} = await axios.get(`https://api.github.com/users/${user}/repos`)
    res.send( data )
})

app.get("/file", async(req, res) => {
    const { data } = await axios.get("https://raw.githubusercontent.com/zenx5/adrian-pasantia/main/package.json")
    res.send( data )
})

app.get("/test", async (req, res) => {

    res.send("url: " + process.env.GITHUB_RAW_URL)
})

app.listen(port, ()=> console.log("hola, i'm running"))