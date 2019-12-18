const mongoose = require('mongoose');


const Activity = new mongoose.Schema({
firebaseUID:{
        type:String,
    },
 bookings:{
        type:[String],
    }
});
module.exports = mongoose.model('Activity',Activity)