import express from "express"
import dotenv from "dotenv"
dotenv.config()
const app=express()
const port=process.env.PORT||8080

app.use(express.json())


app.use("/",(req,res)=>{
   res.json({
      status:"Done",
      message:"server running"
   })
})
app.listen(port,(err)=>{
   if(err){
      console.log("Cannot initalize the server")
   }
   console.log(`Running server on port ${port}`)
})
