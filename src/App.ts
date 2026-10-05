import express from 'express';
import useGraph from "./services/graph.ai.service.js"

const app = express()

app.get("/health",(req,res)=>{
    res.status(200).json({
        status:"ok"
    })
})

app.post("/user_graph",async(req,res)=>{
   await useGraph("where is capital of usa")
})

export default app