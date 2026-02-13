import exp from 'express';
import jwt from "jsonwebtoken";
import { register } from '../Services/authService.js';
import { ArticleModel } from '../Models/ArticleModel.js';
import { checkAuthor } from '../middlewares/checkAuthor.js';
import { verifyToken } from '../middlewares/verifyToken.js';
export const authorRoute = exp.Router();


//Register user
authorRoute.post('/users', async (req, res) => {
    //get user obj from req
    let userObj = req.body;
    //call register
    const newUserObj = await register({ ...userObj, role: "AUTHOR" });
    //send response
    res.status(201).json({ message: "Author registered Successfully", payload: newUserObj });
})

//create article
authorRoute.post('/articles', verifyToken, checkAuthor, async (req, res) => {
    //get article from req
    let article = req.body;
    // Ensure author field matches the logged-in author's ID
    article.author = req.author._id;
    //create article document
    let newArticleDoc = new ArticleModel(article)
    //save
    let CreatedArticleDoc = await newArticleDoc.save()
    //send res
    res.status(201).json({ message: "content saved successfully", payload: CreatedArticleDoc })
})


//read articles of author
authorRoute.get('/articles', verifyToken, checkAuthor, async (req, res) => {
    // ID comes automatically from checkAuthor middleware
    let aId = req.author._id;

    //read articles by this author
    let articles = await ArticleModel.find({ author: aId, isArticleActive: true })

    res.status(201).json({ message: "Articles of author", payload: articles })
})

//get article by ID (plural endpoint)
authorRoute.get('/articles/:id', verifyToken, checkAuthor, async (req, res) => {
    //get article id from params
    let articleId = req.params.id
    //find article by id
    let article = await ArticleModel.findById(articleId)
    if (!article) {
        return res.status(404).json({ message: "Article not found" })
    }
    res.status(200).json({ message: "Article found", payload: article })
})

authorRoute.put('/articles', verifyToken, checkAuthor, async (req, res) => {
    //get modified article from req
    let { articleId, title, content, category } = req.body
    let authorId = req.author._id;

    // Verify ownership
    let article = await ArticleModel.findOne({ _id: articleId, author: authorId })
    if (!article) {
        return res.status(404).json({ message: "Could not find the article or you are not authorized" })
    }

    let updatedArticle = await ArticleModel.findByIdAndUpdate(articleId, { $set: { title, content, category } }, { new: true })

    return res.status(201).json({ message: "Article updated successfully", payload: updatedArticle })
})

// Soft delete (deactivate) an article
authorRoute.put('/articles/deactivate', verifyToken, checkAuthor, async (req, res) => {
    const { articleId } = req.body;
    const authorId = req.author._id;

    // Find the article and ensure it belongs to this author
    const updated = await ArticleModel.findOneAndUpdate(
        { _id: articleId, author: authorId },
        { $set: { isArticleActive: false } },
        { new: true }
    );

    if (!updated) {
        return res.status(404).json({ message: "Article not found or not authorized" });
    }
    res.status(200).json({ message: "Article deactivated (soft deleted)", payload: updated });
});