import exp from 'express';
import { register } from '../Services/authService.js'
import { UserTypeModel } from '../Models/UserModel.js';
import { ArticleModel } from '../Models/ArticleModel.js';
import { verifyToken } from '../middlewares/verifyToken.js';
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
userRoute.get('/articles', verifyToken("USER"), async (req, res) => {
  let articles = await ArticleModel.find({ isArticleActive: true });
  res.status(200).json({ message: "all articles", payload: articles })
})

//Add comment to an article
userRoute.post('/articles/comments', verifyToken("USER"), async (req, res) => {
  const { userId, articleId, comment } = req.body;
  //check user is same logined user or not
  if (userId != req.user.userId) {
    return res.status(403).json({ message: "Forbidden" })
  }
  let newComment = await ArticleModel.findByIdAndUpdate(
    { _id: articleId, isArticleActive: true },
    { $push: { comments: { comment, user: userId } } },
    { new: true, runValidators: true }
  );
  //if article not found
  if (!newComment) {
    return res.status(404).json({ message: "Article not found" })
  }
  res.status(201).json({ message: "comment added successfully", payload: newComment });
});