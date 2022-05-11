const userModels = require("../models/userModels");
const bookModels = require("../models/bookModels");
const mongoose = require('mongoose') 
 

// ================================================================================================================================================//

const isValid = function (value) {
  if (typeof value === 'undefined' || value === null) return false
  if (typeof value === 'string' && value.trim().length === 0) return false
  if (typeof value === 'number') return false
  return true;
}

const isValidRequestBody = function (requestBody) {
  return Object.keys(requestBody).length > 0
}

const isValidObjectId = function(objectId) { // change -- add this validation to check object id type
  return mongoose.Types.ObjectId.isValid(objectId)
}




// third api to craete book  

const createBook = async function (req, res) {
       try {
     
         let requestBody = req.body
     
     //  error handling and validation of request body and request boy keys
     
         if (!isValidRequestBody(requestBody)) {
           res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide author details' })
           return
         }
     
         if (!isValid(requestBody.title)) {
           res.status(400).send({ status: false, message: 'title is required' })
           return
         }
     
         if (!isValid(requestBody.excerpt)) {
           res.status(400).send({ status: false, message: ' excerpt is required' })
           return
         }
         if (!isValid(requestBody.userId)) {   
           res.status(400).send({ status: false, message: ' user id is required' })
           return
         }
     
         if(!isValidObjectId(requestBody.userId)) {       
           res.status(400).send({status: false, message: `${requestBody.userId} is not a valid user id`})
           return
       }
     
         if (!isValid(requestBody.ISBN)) {
           res.status(400).send({ status: false, message: ' ISBN is required' })
           return
         }
     
         if (!isValid(requestBody.category)) {
           res.status(400).send({ status: false, message: ' category is required' })
           return
         }
     
         if (!isValid(requestBody.subcategory)) {
           res.status(400).send({ status: false, message: ' subcategory is required' })
           return
         }
     
         if (!isValid(requestBody.releasedAt)) {
           res.status(400).send({ status: false, message: ' releasedAt is required' })
           return
         }
     
         if(!(req.validToken._id == requestBody.userId)){
           return res.status(400).send({status:false,message:'unauthorized access'})
        }
        
        //  check user id exist or not 
     
         let userCheck = await userModels.findOne({ _id: requestBody.userId })
         if (!userCheck) {
           return res.status(400).send({ status: false, msg: "user dosnt exis with this user id" })
         }
     
         // unique check  title and isbn is already exist or not 
     
         let titleCheck = await bookModels.findOne({ title: requestBody.title })
         if (titleCheck) {
           return res.status(400).send({ status: false, msg: "title already exist" })
         }
     
         let ISBNCheck = await bookModels.findOne({ ISBN: requestBody.ISBN }) //change -- ISBN in book model not in user model
         if (ISBNCheck) {       
           return res.status(400).send({ status: false, msg: "ISBN already exist" })
         }
     
         requestBody.deletedAt = requestBody.isDeleted === true ? Date() : ''   //null
     
         // sucessfully save data in datbase
     
         let savedBook1 = await bookModels.create(requestBody);
     
         res.status(201).send({ status: true, data: savedBook1 });
     
       } catch (error) {
     
         res.status(500).send({ status: false, msg: error.message });
     
       }
     };


//fourth api to get books/ query params

const getBooks = async function (req, res) {
  try {

    let filterObject ={ isDeleted:false }

    if (isValid(req.query.userId)) {
      filterObject.userId =req.query.userId
    }

    if(req.query.userId){

    if(!isValidObjectId(req.query.userId)) {      
      res.status(400).send({status: false, message: `${req.query.userId} is not a valid user id`})
      return
     }

   }

    if (isValid(req.query.category)) {
      filterObject.category =req.query.category
    }

    if (isValid(req.query.subcategory)) {
      filterObject.subcategory =req.query.subcategory
    }

   
   
    let search = await bookModels.find(filterObject).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, reviews: 1, releasedAt: 1 }).sort({title:1});


    if (search.length == 0) {
       return res.status(404).send({ status: false, message:" no book with this combination found" })
    }
     
    res.status(200).send({ status: true, message:"Book list", data:search}) 

  
  } catch (error) {

    res.status(500).send({ status: false, error: error.message });

  }
}



module.exports.createBook = createBook;
module.exports.getBooks = getBooks;






