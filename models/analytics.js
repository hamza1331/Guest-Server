const mongoose = require('mongoose');
const Schema = mongoose.Schema
const earnings=new mongoose.Schema({
    _id:Schema.Types.ObjectId,
    earningsByMonth:{
        term:String,
        earning:Number
    }
})
const booking=new mongoose.Schema({
    _id:Schema.Types.ObjectId,
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