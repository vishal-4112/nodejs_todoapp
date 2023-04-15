import { User } from "../models/user.js";
import bcrypt, { hash } from "bcrypt";
import jwt from "jsonwebtoken";
import { sendCookie } from "../utils/features.js";
import ErrorHandler from "../middleware/error.js";

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email }).select("+password");
    if (!user) return next(new ErrorHandler("Invalid email or password", 400));
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return next(new ErrorHandler("Invalid email or password", 400));
    sendCookie(user, res, `Welcome back,${user.name}`, 200);
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) return next(new ErrorHandler("User already exist", 400));

    const hashedPassword = await bcrypt.hash(password, 10);
    user = await User.create({ name, email, password: hashedPassword });
    sendCookie(user, res, "Registered successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
      secure: process.env.NODE_ENV === "development" ? false : true,
    })
    .json({
      success: true,
      message: "logout successfully",
    });
};

export const getMyProfile = (req, res) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
};
