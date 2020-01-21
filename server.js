var express = require('express');
var Mongoose = require('mongoose')
var cors = require('cors')
var User= require('./models/user')
var Activity= require('./models/ProfileActivity')
var guestHouse=require('./models/guestHouse')
var Booking=require('./models/bookings')
var Analytics=require('./models/analytics')
var bodyParser= require('body-parser')
Mongoose.connect('mongodb://tbali:tbali123@ds151814.mlab.com:51814/stayngo',{ useNewUrlParser: true })

var db = Mongoose.connection //Mongo Connection Instance
db.on('open', () => console.log('database connected'))
var app = express();
app.use(cors())
app.use(bodyParser.json())  //Body Parser MiddleWare
app.use(express.json())


// User Module

function handleSuccess(data){
    return {
        message:"Success",
        doc:data
    }
}
function handleError(err){
    return {
        message:"Failed",
        err
    }
}

app.post('/userCreate',(req,res)=>{
    console.log(req.body)
   User.create(req.body,function(err,docs){
    if(err)
        console.log(err)
        else{
       console.log(docs)
       Activity.create({firebaseUID:req.body.firebaseUID},(err,doc)=>{
        if(err)res.json(handleError(err))
           res.send(docs)
       })
        } 
})
})
app.get('/users',(req,res)=>{
    User.find(function(err,docs){
        if(err)
            console.log(err)
            else{
           console.log(docs)
           res.send(docs)
            } 
    })
})
app.put('/singleUser',(req,res)=>{
    console.log(req.body)
User.findOne({firebaseUID:req.body.firebaseUID},(err,docs)=>{
    if(err)
    console.log(err)
    else{
   console.log(docs)
   res.send(docs)
    } 
})

})
app.put('/updateUserProfile',(req,res)=>{
        User.findOneAndUpdate({firebaseUID:req.body.firebaseUID},req.body,{upsert:true},(err,docs)=>{
            if(err)
            console.log(err)
            else{
           console.log(docs)
           res.send(docs)
            } 
        })
})
//GuestHouse Module
app.post('/addHotel',(req,res)=>{
    console.log(req.body)
    guestHouse.create(req.body,function(err,docs){
        if(err)
            console.log(err)
            else{
                var months = ['JAN','FEB','MAR','APR','MAY','JUNE','JULY','AUG','SEP','OCT','NOV','DEC']
                var date = new Date()
                var currentMonth = months[date.getMonth()]
                var year = date.getFullYear()
                 var term = currentMonth +" - " + year
                console.log(term)
                let data = {
                    hotelID:docs._id,
                    earningsAnlyze:[{
                        _id:new Mongoose.Types.ObjectId(),
                     earningsByMonth:{
                        term:term,
                     earning:0
                    }
                    }],
                    bookingAnalyze: [{
                        _id:new Mongoose.Types.ObjectId(),
                      bookingsByMonth:{
                            term:term,
                           bookingNumber:0
                        }
                    }]
                }
            
                Analytics.create(data,(error,doc)=>{
                    if(err)return res.json(handleError(error))
                    else{
                        let response = {
                            hotel:docs,
                            analytics:doc
                        }
                        return res.json(handleSuccess(doc))
                    }

                })
                
            } 
    })
})

app.get('/hotelListBySpecificID:firebaseUID',(req,res)=>{
   guestHouse.find({firebaseUID: req.params.firebaseUID},(err,docs)=>{
    if(err)
    console.log(err)
    else{
   console.log(docs)
   res.send(docs)
    } 
     })
    })
app.post('/hotelList',(req,res)=>{
    let perPage = 20
    let page = req.body.page || 1 
        guestHouse.find({
        }).skip((perPage * page) - perPage).limit(perPage).exec((err, data) => {

            guestHouse.estimatedDocumentCount().exec((err, count) => {
                if (err) return res.json(handleError(err))
               return res.json({
                    data,
                    current: page,
                    pages: Math.ceil(count / perPage)
                })
            })
        })
})
app.put('/findHotelOneRoomandUpdate',(req,res)=>{
        guestHouse.findOneAndUpdate(
            {"_id":'5def82040ce6b003c06e58e0', 'rooms._id':"5ded0fb8d4bc0c29e44c76cd"},
            { $set:{
            'rooms.$.booked': false
}}).exec((err,docs)=>{
           res.send(docs)
            });
   
     })
 
app.put('/addRooms',(req,res)=>{
   req.body.rooms.forEach((obj,index)=>{
    guestHouse.findByIdAndUpdate('5ded103dd4bc0c29e44c76cf',{$push:{rooms:obj}},{new:true},(err,docs)=>{
      if(index===req.body.rooms.length-1){
        if(err)
        console.log(err)
        else{
       console.log(docs)
       res.json({
           message:"Success",
           docs
       })
        } 
      }
    })
   })
  
})
app.put('/deleteRoom',(req,res)=>{
     guestHouse.findByIdAndUpdate('5ded1136d4bc0c29e44c76d5',{$pull:{rooms:{'_id':'5ded1136d4bc0c29e44c76d6'}}},{new:true},(err,docs)=>{
         if(err)
         console.log(err)
         else{
        console.log(docs)
        res.json({
            message:"Success",
            docs
        })
         } 
        })
   
 })
 app.put('/updateRoom',(req,res)=>{
    guestHouse.findByIdAndUpdate('5def82040ce6b003c06e58e0',{$set:{ "rooms.1" :  {
        "_id": "5e147574a97c062838c9e9fb",
        "roomNumber": 690,
        "singleBedNumbers": 0,
        "doubleBedNumbers": 0,
        "booked": false,
        "rate": 1000
    } }},{new:true},(err,docs)=>{
        if(err)
        console.log(err)
        else{
       console.log(docs)
       res.json({
           message:"Success",
           docs
       })
        } 
       })
  
})
app.get('/hello',(req,res)=>{
    res.json({message:"sdlfjd"})
})
app.delete('/deleteHotel',(req,res)=>{
    guestHouse.findOneAndDelete({_id:req.body.id},(err,docs)=>{
        res.send(docs)
         })
})
app.put('/updateSpecificHotelDetail',(req,res)=>{
guestHouse.findOneAndUpdate({_id:req.body.id},req.body,{upsert:true},{new:true},(err,docs)=>{
        if(err)
        console.log(err)
        else{
       console.log(doc)
       res.send(doc)
        } 
    })
})
//Booking module

app.post('/api/createBooking',(req,res)=>{
    console.log(req.body)
    var data = req.body
    if(data.hotelID!==undefined && data.guestfirebaseUID!==undefined){
        console.log('dfs=> ',data)
        Booking.create(data,(err,booking)=>{
            if(err)return res.json(handleError(err))
            else{
                guestHouse.findByIdAndUpdate(data.hotelID,{
                    // rooms:data.rooms,
                    $inc:{totalBookingNumber:1,totalEarning:data.amount}
                
                },{new:true},(error,rooms)=>{
                    if(err)return res.json(handleError(error))
                    else{
                        console.log(data.guestfirebaseUID)
                        Activity.findOneAndUpdate({firebaseUID:data.guestfirebaseUID},{$push:{bookings:booking._id}},{new:true},(er,ac)=>console.log(ac))
                        const months = ['JAN','FEB','MAR','APR','MAY','JUNE','JULY','AUG','SEP','OCT','NOV','DEC']
                        const date = new Date()
                        const currentMonth = months[date.getMonth()]
                        const year = date.getFullYear()
                        const term = currentMonth +" - " + year
                        Analytics.findOne({hotelID:data.hotelID},(er,analytics)=>{
                            if(er)return res.json(handleError(er))
                            else{
                                let exists = analytics.bookingAnalyze.filter(booking=>{
                                    return booking.bookingsByMonth.term === term
                                })
                                /*
                                bookingAnalyze: [{
                        _id:new Mongoose.Types.ObjectId(),
                      bookingsByMonth:{
                            term:term,
                           bookingNumber:0
                        }
                    }]
                                */
                                if(exists.length>0){
                                    //Update
                                    const arr = analytics.bookingAnalyze
                                 const updatedBookingAnalytics = arr.map(booking=>{
                                        if(booking.bookingsByMonth.term===term){
                                            const analyze = {
                                                    _id:booking._id,
                                                    bookingsByMonth:{
                                                        term,
                                                        bookingNumber:booking.bookingsByMonth.bookingNumber+1
                                                    }
                                            }
                                            return analyze
                                        }
                                    
                                        else{
                                            return booking
                                        }
                                    })
                                    console.log(updatedBookingAnalytics)
                                    let updatedEarningAnalytics = analytics.earningsAnlyze.map(earningg=>{
                                        if(earningg.earningsByMonth.term===term){
                                            let analyze = {
                                                _id:booking._id,
                                                earningsByMonth:{
                                                    term,
                                                    earning:earningg.earningsByMonth.earning+data.amount
                                                }
                                            }
                                            return analyze
                                        }
                                        else{
                                            return earningg
                                        }
                                    })
                                    Analytics.findOneAndUpdate({hotelID:data.hotelID},{
                                        earningsAnlyze:updatedEarningAnalytics,
                                        bookingAnalyze:updatedBookingAnalytics
                                    },{new:true},(errr,analy)=>{
                                        if(errr)return res.json(handleError(errr))
                                        else{
                                            return res.json(handleSuccess(booking))
                                        }
                                    })

                                }
                                else{
                                    //Create
                                    let bookingAnalyze={
                                        _id:new Mongoose.Types.ObjectId(),
                                        bookingsByMonth:{
                                            term,
                                            bookingNumber:1
                                        }
                                }
                                  let earningsAnlyze={
                                    _id:new Mongoose.Types.ObjectId(),
                                    earningsByMonth:{
                                       term:term,
                                    earning:data.amount
                                   }
                                }
                                console.log(earningsAnlyze)
                                   
                                    Analytics.findOneAndUpdate({hotelID:data.hotelID},{
                                        $push:{earningsAnlyze:earningsAnlyze,bookingAnalyze:bookingAnalyze}
                                    },{new:true},(e,analyt)=>{
                                        if(e)return res.json(handleError(e))
                                        else{
                                            return res.json(handleSuccess(analyt))
                                        }
                                    })

                                }
                            }
                        })
                    }
                })
            }
        })
    }
})
app.get('/api/getActivity:firebaseUID',(req,res)=>{
    if(req.params.firebaseUID){
        Activity.findOne({firebaseUID:req.params.firebaseUID},(err,doc)=>{
            if(err)return res.json(handleError(err))
            else{
                return res.json(handleSuccess(doc))
            }
        })

    }
})
app.put('/api/hotelAnalytics',(req,res)=>{
    if(req.body.hotelID){
        Analytics.findOne({hotelID:req.body.hotelID},(err,doc)=>{
            if(err)return res.json(handleError(err))
            else{
                return res.json(handleSuccess(doc))
            }
        })
    }
})
app.post('/api/bookings',(req,res)=>{
    let perPage = 20
    let page = req.body.page || 1 
    if(req.body.hotelID){
        Booking.find({
            hotelID:req.body.hotelID
        }).skip((perPage * page) - perPage).limit(perPage).exec((err, data) => {

            Booking.estimatedDocumentCount().exec((err, count) => {
                if (err) return res.json({ message: err })
                res.json({
                    data,
                    current: page,
                    pages: Math.ceil(count / perPage)
                })
            })
        })
    }
})
app.put('/api/cancelBooking',(req,res)=>{
    if(req.body.bookingID){
        let id = req.body.bookingID
        let data = req.body
        Booking.findByIdAndUpdate(id,{booked:false},{new:true},(err,booking)=>{
            if(err)return res.json(handleError(err))
            else{

                guestHouse.findByIdAndUpdate(data.hotelID,{
                    $dec:{totalBookingNumber:1,totalEarning:data.amount}
                
                },{new:true},(error,rooms)=>{
                    if(err)return res.json(handleError(error))
                    else{
                        const term  = data.term
                        Analytics.findOne({hotelID:data.hotelID},(er,analytics)=>{
                            if(er)return res.json(handleError(er))
                            else{
                                let exists = analytics.bookingAnalyze.filter(booking=>{
                                    return booking.bookingsByMonth.term === term
                                })
                                /*
                                bookingAnalyze: [{
                        _id:new Mongoose.Types.ObjectId(),
                      bookingsByMonth:{
                            term:term,
                           bookingNumber:0
                        }
                    }]
                                */
                                if(exists.length>0){
                                    //Update
                                    const arr = analytics.bookingAnalyze
                                 const updatedBookingAnalytics = arr.map(booking=>{
                                        if(booking.bookingsByMonth.term===term){
                                            const analyze = {
                                                    _id:booking._id,
                                                    bookingsByMonth:{
                                                        term,
                                                        bookingNumber:booking.bookingsByMonth.bookingNumber-1
                                                    }
                                            }
                                            return analyze
                                        }
                                    
                                        else{
                                            return booking
                                        }
                                    })
                                    console.log(updatedBookingAnalytics)
                                    let updatedEarningAnalytics = analytics.earningsAnlyze.map(earningg=>{
                                        if(earningg.earningsByMonth.term===term){
                                            let analyze = {
                                                _id:booking._id,
                                                earningsByMonth:{
                                                    term,
                                                    earning:earningg.earningsByMonth.earning-data.amount
                                                }
                                            }
                                            return analyze
                                        }
                                        else{
                                            return earningg
                                        }
                                    })
                                    Analytics.findOneAndUpdate({hotelID:data.hotelID},{
                                        earningsAnlyze:updatedEarningAnalytics,
                                        bookingAnalyze:updatedBookingAnalytics
                                    },{new:true},(errr,analy)=>{
                                        if(errr)return res.json(handleError(errr))
                                        else{
                                            return res.json(handleSuccess(booking))
                                        }
                                    })

                                }
                                else{
                                    //Create
                                    let bookingAnalyze={
                                        bookingsByMonth:{
                                            term,
                                            bookingNumber:booking.bookingsByMonth.bookingNumber-1
                                        }
                                }
                                  let earningsAnlyze={
                                    earningsByMonth:{
                                        term,
                                        earning:earningg.earningsByMonth.earning-data.amount
                                    }
                                }
                                   
                                    Analytics.findOneAndUpdate({hotelID:data.hotelID},{
                                        $push:{earningsAnlyze:earningsAnlyze},
                                        $push:{bookingAnalyze:bookingAnalyze}
                                    },{new:true},(e,analyt)=>{
                                        if(e)return res.json(handleError(e))
                                        else{
                                            return res.json(handleSuccess(booking))
                                        }
                                    })

                                }
                            }
                        })
                    }
                })
            
            }
        })
    }
})
app.listen(8000);
// send a message
console.log('Server has started!');