const mongoose = require('mongoose');

const booking= new mongoose.Schema({
    startingDate:{
        type:String,
        required:true,
    },
     endingDate:{
         type:String,
         required:true
     },
     rooms:{
        type:[Number],
        required:true
    },
    laundry:{
       type:Boolean,
       default:false
   }
   
})
const Bookings = new mongoose.Schema({
hotelID:{
        type:String,
        required:true
    },
 guestfirebaseUID:{
        type:String,
        required:true
    },
    bookingTime:{
        type:String,
        required:true
        },
    bookingDate:{
        type:Date,
        default:Date.now()
 },
 booking:{
     type:booking
 },
 booked:{
     type:Boolean,
     default:true           //true: booked. false: cancelled
 }
});
module.exports = mongoose.model('Booking',Bookings)