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
var db=Mongoose.connection
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
    guestHouse.create(req.body,function(err,docs){
        if(err)
            console.log(err)
            else{
                const months = ['JAN','FEB','MAR','APR','MAY','JUNE','JULY','AUG','SEP','OCT','NOV','DEC']
                const date = new Date()
                const currentMonth = months[date.getMonth()]
                const year = date.getFullYear()
                const term = currentMonth +" - " + year
              let bookingAnalyze=[{
                    term,
                    bookingNumber:0
                }]
              let earningsAnlyze=[{
                    term,
                    earning:0
                }]
                let data = {
                    hotelID:docs._id,
                    earningsAnlyze,
                    bookingAnalyze
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
app.put('/hotelListBySpecificID',(req,res)=>{
   guestHouse.find({firebaseUID: req.body.firebaseUID},(err,docs)=>{
    res.send(docs)
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
        // guestHouse.findOneAndUpdate(
        //     {"_id":'5def82040ce6b003c06e58e0', 'rooms._id':"5df4c89cfd37f60b3cfe5375"},
        //     { $set: {'rooms.$.roomNumber': '600',
        //     'rooms.$.booked': 'true',
        //     'rooms.$.rate': '25'

        // }}).exec((err,docs)=>{
        //    res.send(docs)
        //     });
        guestHouse.aggregate([
            { "$match": {
                "rooms._id": "5df4c89cfd37f60b3cfe5375"
            }},
            { "$unwind": "$rooms" },
            { "$match": {
                "rooms._id": "5df4c89cfd37f60b3cfe5375"
            }},
            { "$project": {
                "booked": "$rooms.booked"
            }}
        ],function(err,result) {
           console.log(result)
        })
     })
 
app.put('/addRooms',(req,res)=>{
  
    guestHouse.findOneAndUpdate({"_id":'5def82040ce6b003c06e58e0'},{rooms:req.body.rooms},{new:true},(err,docs)=>{
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
    let data = req.body
    if(data.hotelID!==undefined && data.guestFirebaseUID!==undefined){
        Booking.create(data,(err,booking)=>{
            if(err)return res.json(handleError(err))
            else{
                guestHouse.findOneAndUpdate({hotelID:data.hotelID},{
                    rooms:data.rooms,
                    $inc:{totalBookingNumber:1,totalEarning:data.amount}
                
                },{new:true},(error,rooms)=>{
                    if(err)return res.json(handleError(error))
                    else{
                        Activity.findOneAndUpdate({firebaseUID:data.guestFirebaseUID},{$push:{bookings:booking._id}})
                        const months = ['JAN','FEB','MAR','APR','MAY','JUNE','JULY','AUG','SEP','OCT','NOV','DEC']
                        const date = new Date()
                        const currentMonth = months[date.getMonth()]
                        const year = date.getFullYear()
                        const term = currentMonth +" - " + year
                        Analytics.findOne({hotelID:data.hotelID},(er,analytics)=>{
                            if(er)return res.json(handleError(er))
                            else{
                                let exists = analytics.bookingAnalyze.filter(booking=>{
                                    return booking.term === term
                                })
                                if(exists.length>0){
                                    //Update
                                    let updatedBookingAnalytics = analytics.bookingAnalyze.filter(booking=>{
                                        if(booking.term===term){
                                            let analyze = {
                                                term,
                                                bookingNumber:booking.bookingNumber+1
                                            }
                                            return analyze
                                        }
                                        else{
                                            return booking
                                        }
                                    })
                                    let updatedEarningAnalytics = analytics.earningsAnlyze.filter(earningg=>{
                                        if(earningg.term===term){
                                            let analyze = {
                                                term,
                                                earning:earningg.earning+data.amount
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
                                        term,
                                        bookingNumber:1
                                    }
                                  let earningsAnlyze={
                                        term,
                                        earning:data.amount
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
app.get('/api/hotelAnalytics:hotelID',(req,res)=>{
    if(req.params.hotelID){
        Analytics.findOne({hotelID:req.params.hotelID},(err,doc)=>{
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

                guestHouse.findOneAndUpdate({hotelID:data.hotelID},{
                    $dec:{totalBookingNumber:1,totalEarning:data.amount}
                
                },{new:true},(error,rooms)=>{
                    if(err)return res.json(handleError(error))
                    else{
                        const term  = data.term
                        Analytics.findOne({hotelID:data.hotelID},(er,analytics)=>{
                            if(er)return res.json(handleError(er))
                            else{
                                let exists = analytics.bookingAnalyze.filter(booking=>{
                                    return booking.term === term
                                })
                                if(exists.length>0){
                                    //Update
                                    let updatedBookingAnalytics = analytics.bookingAnalyze.filter(booking=>{
                                        if(booking.term===term){
                                            let analyze = {
                                                term,
                                                bookingNumber:booking.bookingNumber-1
                                            }
                                            return analyze
                                        }
                                        else{
                                            return booking
                                        }
                                    })
                                    let updatedEarningAnalytics = analytics.earningsAnlyze.filter(earningg=>{
                                        if(earningg.term===term){
                                            let analyze = {
                                                term,
                                                earning:earningg.earning-data.amount
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