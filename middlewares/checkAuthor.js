import { UserTypeModel } from "../Models/UserModel.js";
export const checkAuthor=async (req,res,next)=>
{
    //get author id

    let authorid=req.body?.author
    if(!authorid){
        authorid=req.params.authorId
    }
    //verify author
    let author= await UserTypeModel.findByID(article.author)
    if(!author || author.role!=="AUTHOR"){
        return res.status(401).json({message:"Invalid Author"})
    }
     if(!author.isActive){
     return res.status(403).json({ message: "Author account is not active" });
  }
 next()
}