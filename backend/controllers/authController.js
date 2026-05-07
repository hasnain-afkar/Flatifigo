const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Profile = require("../models/Profile");

const serializeUser = (user) => ({
  id: user._id.toString(),
  _id: user._id.toString(),
  fullName: user.fullName,
  full_name: user.fullName,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  created_at: user.createdAt,
});

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const register = async (req, res, next) => {
  try {
    const { fullName, email, password, confirmPassword, role } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, password, and role are required.",
      });
    }

    if (!["student", "jobholder", "owner", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be student, jobholder, owner, or admin.",
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
    });

    await Profile.create({ userId: user._id });

    const token = signToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      token,
      user: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const MAX_LOGIN_ATTEMPTS = 5;
    const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(403).json({
        success: false,
        message: "Account is temporarily locked due to too many failed attempts.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = Date.now() + LOCK_TIME;
      }
      await user.save();
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    const token = signToken(user._id);

    return res.json({
      success: true,
      message: "Login successful.",
      token,
      user: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

const checkSession = async (req, res) => {
  return res.json({
    success: true,
    loggedIn: true,
    user: serializeUser(req.user),
  });
};

const logout = async (_req, res) => {
  return res.json({
    success: true,
    message: "Logout successful.",
  });
};

module.exports = {
  serializeUser,
  register,
  login,
  checkSession,
  logout,
};
