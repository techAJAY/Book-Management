const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.Types.ObjectId

const reviewSchema = new mongoose.Schema({

  bookId: {
    type: ObjectId,
    required: true,
    ref: 'Book'
  },

  reviewedBy: {                 // value: reviewer's name
    type: String,                      
    required: true,
    default: 'Guest',
    trim: true
    
  },

  reviewedAt: {
    type: Date,
    default:Date.now(),
    required: true
  },

  rating: {                    //min 1, max 5,
    type: Number,
    minlength: 1,
    maxlength: 5,   
    required: true
  },

  review: {
    type: String,
  },
  
  isDeleted: {
    type: Boolean,
    default: false
  }

},
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);