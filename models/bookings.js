const mongoose = require('mongoose');


const Bookings = new mongoose.Schema({
hotelID:{
        type:String,
        required:true
    },
 guestfirebaseUID:{
        type:String,
        required:true
    },
 startingDate:{
    type:String,
    required:true,
},
 endingDate:{
     type:String,
     required:true
 },
 rooms:{
    type:[String],
    required:true
},
laundry:{
   type:Boolean,
   default:false
},
 booked:{
     type:Boolean,
     default:true           //true: booked. false: cancelled
 },
 amount:{
    type:Number,
    required:true           //true: booked. false: cancelled
}
});
module.exports = mongoose.model('Booking',Bookings)