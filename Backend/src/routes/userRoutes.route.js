const express = require("express");
const router = express.Router();


const {
  login,
  refreshToken,
  logout,
  isAuthenticated,
  register,
} = require("../controllers/user.controller");


router.post("/login", login); 
router.post("/token/refresh", refreshToken);
router.post("/logout", logout); 
router.get("/authenticated", isAuthenticated);
router.post("/register", register);

module.exports = router;
