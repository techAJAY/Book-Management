const reviewModels = require('../models/reviewModels')
const bookModels = require('../models/bookModels')
const mongoose = require('mongoose')  



// globle function for validation //

const isValid = function (value) {
  if (typeof value === 'undefined' || value === null) return false
  if (typeof value === 'string' && value.trim().length === 0) return false
  if (typeof value === 'number') return false
  return true;
}

const isValidRequestBody = function (requestBody) {
  return Object.keys(requestBody).length > 0
}

//this validation to check object id type//

const isValidObjectId = function(objectId) {         
  return mongoose.Types.ObjectId.isValid(objectId)
}



//  eight api to create review 

const createReview = async function (req, res) {
  try {
    let requestBody = req.body

    let checkBookId = await bookModels.findOne({ _id: req.params.bookId, isDeleted: false })
    if (!checkBookId) {
      return res.status(404).send({ status: false, message: 'book does not exist' })
    }

    if (!isValidRequestBody(requestBody)) {
      res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide review details' })
      return
    }

    if (!isValid(req.params.bookId)) {                    //book id from prams
      res.status(400).send({ status: false, message: 'bookId is required' })
      return
    }

    if(!isValidObjectId(req.params.bookId)) {            // add this function
      res.status(400).send({status: false, message: `${req.params.bookId} is not a valid book id`})
      return
  }

   
    if(isValid(requestBody.rating)){
     return res.status(400).send({ status: false, message: ' rating required' })
      
    }
   
    //this for checking range
    if ( !(requestBody.rating>=1 && requestBody.rating<=5 )) {
      return res.status(400).send({ status: false, message: ' rating should be in range of number 1 to 5' })
      
    }

     let bookDetail = await bookModels.findOneAndUpdate({ _id: req.params.bookId }, { reviews: checkBookId.reviews + 1 }, { new: true })

    requestBody.reviewedAt = new Date()
    requestBody.bookId = req.params.bookId
    requestBody.reviewedBy = requestBody.reviewedBy?requestBody.reviewedBy:'Guest';
    


    let create = await reviewModels.create(requestBody);
    
    const data = {
     _id:create._id , 
     bookId: create.bookId, 
     reviewedBy: create.reviewedBy, 
     reviewedAt: create.reviewedAt, 
     rating: create.rating, 
     review: create.review 

    }
     return res.status(201).send({ status: true, message: 'review created sucessfully', data:{...bookDetail.toObject(),review:data} })


  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
}


const updateReviews = async (req, res) => {
  try {
      let bookId = req.params.bookId;
      let reviewId = req.params.reviewId;
      if (!(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/.test(bookId))) { return res.status(400).send({ status: false, message: "You should have put correct book Id in params" }) }
      if (!(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/.test(reviewId))) { return res.status(400).send({ status: false, message: "You should have put correct review Id in params" }) }
      let data = req.body;
      if(Object.keys(data)==0){return res.status(400).send({status: false, message: "Enter some data for update"})}
      if (!(data.rating >= 1 && data.rating <= 5)) { return res.status(400).send({ status: false, message: "Rating value should be between 1 to 5" }) }

      let book = await bookModels.findOne({ _id: bookId, isDeleted: false })
      if (!book) { return res.status(400).send({ status: false, message: "No book exist with this id" }) }

      let checkReviewId = await reviewModels.findOne({ _id: reviewId, isDeleted: false })
      if (!checkReviewId) { return res.status(400).send({ status: false, message: "No review exist with this id" }) }

      let updateReview = await reviewModels.findOneAndUpdate({ _id: reviewId, bookId: bookId },
          { $set: { review: data.review, rating: data.rating, reviewedBy: data.reviewedBy, reviewedAt: data.reviewAt } }, { new: true })

      let result = {
          bookId: book._id,
          title: book.title,
          excerpt: book.excerpt,
          userId: book.userId,
          category: book.category,
          reviews: book.review,
          releasedAt: book.releasedAt,
          reviewsData: updateReview
      };
      return res.status(200).send({ status: true, message: "Review updated successfully", bookDetailsWithReview: result })
  }
  catch (error) {
      return res.status(500).send({ status: false, error: error.message })
  }
}


const deleteReview = async (req, res) => {
  try {
      let reviewId = req.params.reviewId
      let bookId = req.params.bookId
      if (!(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/.test(bookId))) { return res.status(400).send({ status: false, message: "You should have put correct book Id in params" }) }
      if (!(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/.test(reviewId))) { return res.status(400).send({ status: false, message: "You should have put correct review Id in params" }) }

      let book = await bookModels.findOne({ _id: bookId, isDeleted: false });
      if (!book) { return res.status(404).send({ status: false, message: "No book exist with this id" }) }

      let review = await reviewModels.findOne({ _id: reviewId, bookId: bookId });
      if (!review) { return res.status(400).send({ status: false, msg: "Review id should be checked, id is not from this book." }) }
      if (review.isDeleted == true) { return res.status(400).send({ status: false, msg: "Review has already been deleted" }) }

      let deleteRev = await reviewModels.findOneAndUpdate({ _id: review._id, bookId: review.bookId, isDeleted: false },
          { $set: { isDeleted: true } })
      let deleteReview = await bookModels.findOneAndUpdate({ _id: book._id }, { $inc: { review: -1 } })
      return res.status(200).send({ status: true, message: "Review deleted successfully"})
  }
  catch (error) {
      return res.status(500).send({ status: false, error: error.message })
  }
}

module.exports.createReview = createReview

module.exports.deleteReview=deleteReview

module.exports.updateReviews=updateReviews
