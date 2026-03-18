import exp from 'express';
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
authorRoute.post('/articles', verifyToken("AUTHOR"), checkAuthor, async (req, res) => {
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
authorRoute.get('/articles', verifyToken("AUTHOR"), checkAuthor, async (req, res) => {
    // ID comes automatically from checkAuthor middleware
    let aId = req.author._id;

    //read articles by this author
    let articles = await ArticleModel.find({ author: aId, isArticleActive: true })

    res.status(201).json({ message: "Articles of author", payload: articles })
})

//get article by ID (plural endpoint)
authorRoute.get('/articles/:id', verifyToken("AUTHOR"), checkAuthor, async (req, res) => {
    //get article id from params
    let articleId = req.params.id
    //find article by id
    let article = await ArticleModel.findById(articleId)
    if (!article) {
        return res.status(404).json({ message: "Article not found" })
    }
    res.status(200).json({ message: "Article found", payload: article })
})

authorRoute.put('/articles', verifyToken("AUTHOR"), checkAuthor, async (req, res) => {
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

//delete(soft delete) article(Protected route)
authorRoute.patch("/articles/:id/status", verifyToken("AUTHOR"), async (req, res) => {
    const { id } = req.params;
    const { isArticleActive } = req.body;
    // Find article
    const article = await ArticleModel.findById(id);

    if (!article) {
        return res.status(404).json({ message: "Article not found" });
    }

    // AUTHOR can only modify their own articles
    if (req.user.role === "AUTHOR" &&
        article.author.toString() !== req.user.userId) {
        return res
            .status(403)
            .json({ message: "Forbidden. You can only modify your own articles" });
    }

    // Already in requested state
    if (article.isArticleActive === isArticleActive) {
        return res.status(400).json({
            message: `Article is already ${isArticleActive ? "active" : "deleted"}`,
        });
    }

    //update status
    article.isArticleActive = isArticleActive;
    await article.save();

    //send res
    res.status(200).json({
        message: `Article ${isArticleActive ? "restored" : "deleted"} successfully`,
        article
    });
});
