import exp from 'express'
import {connect} from 'mongoose'
import {config} from 'dotenv'
import cookieParser from 'cookie-parser'
import { userRoute } from './APIs/UserAPI.js'
import { authorRoute } from './APIs/AuthorAPI.js'
import { adminRoute } from './APIs/AdminAPI.js'
import { commonRouter } from './APIs/CommonAPI.js'
config()
const app=exp()

//add body parser middleware
app.use(exp.json())  //what is this function on function?
app.use(cookieParser())
//connect APIs
app.use('/user-api',userRoute)
app.use('/author-api',authorRoute)
app.use('/admin-api',adminRoute)
app.use('/common-api',commonRouter)
//connect to db

const connectDB=async()=>{
    try{
    await connect(process.env.MONGODB_URL)
    console.log("DB connected successfully")
    //start http server
    app.listen(process.env.PORT,()=>console.log("server started"))
    }catch(err){
    console.log("DB connection failed",err)
}
}

connectDB()

//dealing with invalid path
app.use((req,res,next)=>{
    console.log(req.url)
    res.json({message:req.url+" is Invalid path"})
})

//error handling middleware          ,,//why 'next' in this middleware?
app.use((err,req,res,next)=> {                                           
 console.log("err",err)
 res.json({message:err.message})
})      