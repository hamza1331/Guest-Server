const mongoose = require('mongoose');

const earnings=new mongoose.Schema({
    earningsByMonth:{
        term:String,
        earning:Number
    }
})
const booking=new mongoose.Schema({
    bookingsByMonth:{
        term:String,
        bookingNumber:Number
    }
})

const Analytics = new mongoose.Schema({
earningsAnlyze:{
        type:[earnings],
    },
 bookingAnalyze:{
        type:[booking],
    },
    hotelID:{
        type:String,
        required:true
    }
});
module.exports = mongoose.model('Analytic',Analytics)