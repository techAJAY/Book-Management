const express = require('express');
const router = express.Router();
const userController = require("../controller/usercontroller")



router.post("/register", userController.createuser)

router.post("/login",userController.loginUser)


module.exports = router;


