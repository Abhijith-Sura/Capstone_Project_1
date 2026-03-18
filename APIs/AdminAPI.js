import exp from 'express';
import { UserTypeModel } from '../Models/UserModel.js';
export const adminRoute = exp.Router();


//read all articles(optinal)

//block user roles
adminRoute.put('/users/block', async (req, res) => {
    let Uid = req.body.UserId
    let user = await UserTypeModel.findById(Uid)
    if (!user) {
        return res.status(400).json({ message: "User Not Found" })
    }
    user.isActive = false
    await user.save()
    res.status(201).json({ message: "User blocked successfully", payload: user })
})
//unblock user roles
adminRoute.put('/users/unblock', async (req, res) => {
    let Userid = req.body.UserId
    let user = await UserTypeModel.findById(Userid)
    if (!user) {
        return res.status(400).json({ message: "User Not Found" })
    }
    user.isActive = true
    await user.save()
    res.status(201).json({ message: "User unblocked successfully", payload: user })
})