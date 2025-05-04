const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel"); // Mongoose model

const jwtSecret = process.env.JWT_SECRET || "your_jwt_secret";

// POST /api/users/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res
      .status(400)
      .json({ success: false, error: "Both email and password are required." });

  try {
    const user = await User.findOne({ email });

    if (!user)
      return res
        .status(400)
        .json({ success: false, error: "No user with this email exists." });

    if (!user.isActive)
      return res
        .status(400)
        .json({ success: false, error: "This account is inactive." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, error: "Invalid email or password." });

    const accessToken = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: "7d",
    });
    // console.log(accessToken);
    // console.log(refreshToken);

    // res.cookie('access_token', accessToken, {
    //     httpOnly: true,
    //     secure: false,
    //     sameSite: 'None',
    //     path: '/'
    // });

    // res.cookie('refresh_token', refreshToken, {
    //     httpOnly: true,
    //     secure: false,
    //     sameSite: 'None',
    //     path: '/'
    // });
    res.cookie("access_token", accessToken);

    res.cookie("refresh_token", refreshToken);

    return res.json({ success: true });
  } catch (err) {
    // console.log(`Login error: ${err.message}`);

    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// POST /api/users/token/refresh
exports.refreshToken = (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  if (!refreshToken) return res.status(401).json({ refreshed: false });

  try {
    const payload = jwt.verify(refreshToken, jwtSecret);
    const accessToken = jwt.sign({ userId: payload.userId }, jwtSecret, {
      expiresIn: "15m",
    });

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "None",
      path: "/",
    });

    res.json({ refreshed: true });
  } catch (err) {
    res.status(401).json({ refreshed: false });
  }
};

// POST /api/users/logout
exports.logout = (req, res) => {
  res.clearCookie("access_token", { path: "/", sameSite: "Lax" });
  res.clearCookie("refresh_token", { path: "/", sameSite: "Lax" });
  res.json({ success: true });
};

// GET /api/users/authenticated
exports.isAuthenticated = (req, res) => {
  if (req.user) {
    return res.json({ authenticated: true });
  } else {
    return res.status(401).json({ authenticated: false });
  }
};

// POST /api/users/register
exports.register = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing)
      return res
        .status(400)
        .json({ success: false, error: "Email already registered." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, isActive: true });
    await user.save();

    res.json({ success: true, email: user.email });
  } catch (err) {
    // console.log(`Registration error: ${err.message}`);
    res.status(500).json({ success: false, error: "Server error hai" });
  }
};
