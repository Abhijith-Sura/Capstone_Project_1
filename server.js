import exp from 'express'
import {connect} from 'mongoose'
import {config} from 'dotenv'
import cookieParser from 'cookie-parser'
import { userRoute } from './APIs/UserAPI.js'
import { authorRoute } from './APIs/AuthorAPI.js'
import { adminRoute } from './APIs/AdminAPI.js'
import { commonRouter } from './APIs/CommonAPI.js'
import cors from 'cors'
config()
const app=exp()
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://vercel.com/abhijith-suras-projects/capstone-frontend"
  ],
  credentials: true
}));
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
    await connect(process.env.DB_URL)
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



app.use((err, req, res, next) => {

  console.log("Error name:", err.name);
  console.log("Error code:", err.code);
  console.log("Full error:", err);

  // mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "error occurred",
      error: err.message,
    });
  }

  // mongoose cast error
  if (err.name === "CastError") {
    return res.status(400).json({
      message: "error occurred",
      error: err.message,
    });
  }

  const errCode = err.code ?? err.cause?.code ?? err.errorResponse?.code;
  const keyValue = err.keyValue ?? err.cause?.keyValue ?? err.errorResponse?.keyValue;

  if (errCode === 11000) {
    const field = Object.keys(keyValue)[0];
    const value = keyValue[field];
    return res.status(409).json({
      message: "error occurred",
      error: `${field} "${value}" already exists`,
    });
  }

  //HANDLE CUSTOM ERRORS
  if (err.status) {
    return res.status(err.status).json({
      message: "error occurred",
      error: err.message,
    });
  }

  // default server error
  res.status(500).json({
    message: "error occurred",
    error: "Server side error",
  });
});