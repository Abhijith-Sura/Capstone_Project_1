import exp from 'express';
import jwt from "jsonwebtoken";
import { register } from '../Services/authService.js'
import { UserTypeModel } from '../Models/UserModel.js';
import { ArticleModel } from '../Models/ArticleModel.js';
export const userRoute = exp.Router();

//Register user
userRoute.post('/users', async (req, res) => {
  //get user obj from req
  let userObj = req.body;
  //call register
  const newUserObj = await register({ ...userObj, role: "USER" });
  //send response
  res.status(201).json({ message: "user registered Successfully", payload: newUserObj });
})

//Read all articles

userRoute.get('/articles', async (req, res) => {
  let userid = req.query.userId
  let user = await UserTypeModel.findById(userid)
  if (!user || user.role !== "USER") {
    return res.status(401).json({ message: "Invalid USER" })
  }
  let articles = await ArticleModel.find({ isArticleActive: true });
  res.status(201).json({ message: "all articles", payload: articles })
})
//Add comment to an article
userRoute.post('/articles/comments', async (req, res) => {
  const { userId, articleId, comment } = req.body;
  // Add comment to article
  let newComment = await ArticleModel.findByIdAndUpdate(
    articleId,
    { $push: { comments: { comment, user: userId } } },
    { new: true }
  );
  res.status(201).json({ message: "comment added successfully", payload: newComment });
});