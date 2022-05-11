const express = require('express');
const router = express.Router();
const userController = require("../controller/userController")
const bookController = require("../controller/bookController")
const loginController = require("../controller/loginController")
const mid = require("../middleware/middleware")



router.post("/register", userController.createuser)

router.post("/login",loginController.loginUser)

router.post("/book",mid.middleware, bookController.createBook)

router.get("/books", bookController.getBooks)


module.exports = router;


