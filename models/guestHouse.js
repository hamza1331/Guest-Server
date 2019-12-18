const mongoose = require('mongoose');
const locationSchema = new mongoose.Schema({
   type:{
       type:String,
       default:"Point"
   },
   coordinates:{
       type:[Number],
       index:'2dsphere'
   }
})
const rooms= new mongoose.Schema({
    roomNumber:{
        type:Number,
        required:true,
    },
     singleBedNumbers:{
         type:Number,
         required:true
     },
     doubleBedNumbers:{
        type:Number,
        required:true
    },
    booked:{
       type:Boolean,
   },
     rate:{
     type:Number
   }
   
})
const guestHouse = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    imageLinks:{
        type:[String]
    },
    rooms:{
        type:[rooms]
    },
    geometry:{
        type:locationSchema
    },
    firebaseUID:{
        type:String,
        required:true
    },
    createdDate:{
        type:Date,
        default:Date.now()
    },
    description:{
        type:String
                    },
    halls:{
     type:Number
        },
    laundry:{
        type:Boolean
        },
    Rating:{
        type:Number
    },
    totalBookingNumber:{
        type:Number
    },
    totalEarning:{
        type:Number
    }
 
});
guestHouse.index({geometry:"2dsphere"});
module.exports = mongoose.model('GuestHouse',guestHouse)