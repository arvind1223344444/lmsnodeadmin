const database = require(__dirname + '/../../config/Database');


const work = new database.Schema({


student_id:{
    type:database.Schema.Types.ObjectId,
    ref:'studentModel',
    required:[true,'Student is required']
},



playlist_id:{
    type:database.Schema.Types.ObjectId,
    ref:'playlists' ,
    required:[true,'playlist is required']
},

status:{
   type:Number,
   default:1,
},

in_time:{
    type:String
},

course_id:{
    type:String
},

out_time:{
type:String
}



})

const studnt =  database.model('student_attendance',work);

module.exports=studnt;