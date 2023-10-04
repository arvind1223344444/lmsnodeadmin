var database = require(__dirname+'/../../config/Database');


const fee = database.Schema({

    playlist_id:{
        type:database.Schema.Types.ObjectId,
        ref:'playList',
        required:true,
    },

    user_id:{ 
        type:database.Schema.Types.ObjectId,
        ref:'studentModel',
        required:true,
    },

  
    transcation_id:{
        type:String,
        required:true
    },

    payment_status:{
        type:String
    },

    addedOn:{
        type:Date,
        default: new Date(),
    }

})

const table_payment = database.model('payment_done',fee);

module.exports=table_payment;