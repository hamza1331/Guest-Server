var mongoose = require('mongoose')

const userSchema = {
    firebaseUID:{
        type:String
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
     userType:{
         type:Boolean,
         required:true,
                    //true:vendor false:user
     },
    cnic:{
        type:String,
        required:true
    },
     profilePicUrl:{
        type:String,
        required:true
    },
    createDate:{
        type:Date,
        default:Date.now()
    }
}

module.exports=mongoose.model('Users',userSchema)