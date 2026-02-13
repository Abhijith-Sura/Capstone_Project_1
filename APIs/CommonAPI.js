import exp from 'express'
import bycrypt from 'bcryptjs'
import { UserTypeModel } from '../Models/UserModel.js';
import { authenticate } from '../Services/authService.js';
import { verifyToken } from '../middlewares/verifyToken.js';
export const commonRouter = exp.Router()

//login
commonRouter.post("/login", async (req, res) => {
  //get user credential object
  let userCred = req.body;
  //call authenticate service
  let { token, user } = await authenticate(userCred);
  //save token as httpOnly cookie
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });
  //send res
  res.status(200).json({ message: "Login Successful", payload: user })
})


//logout
commonRouter.get("/logout", async (req, res) => {
  //clear token cookie
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });
  //send response
  res.status(201).json({ message: "Logout Successful" })
})

//reset password
commonRouter.put('/reset-password', async (req, res) => {
  let { email, newpassword } = req.body
  let user = await UserTypeModel.findOne({ email: email })
  if (!user) {
    return res.status(400).json({ message: "User Not Found" })
  }
  user.password = await bycrypt.hash(newpassword, 12)
  await user.save()
  res.status(201).json({ message: "Password Reset Successfully", payload: user })
})