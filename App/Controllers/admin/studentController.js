const express = require('express');
const app = express.Router();
const playListModel = require(__dirname+'/../../Models/playList');
const studentModel = require(__dirname+'/../../Models/StudentModel');
const imageUpload = require(__dirname+'/../../middleware/uploadImage');
const rolePermission = require(__dirname+'/../../middleware/PermissionCheck');

const payment_done = require(__dirname+'/../../Models/payment_done.js');

const assignment_assign = require(__dirname+'/../../Models/assignment_assign.js');
const student_attendance = require(__dirname+'/../../Models/student_attendance.js');
//middleware for session check
const inArray = require('in-array'); 
const multer = require('multer');


// {_id:req.session.user._id}
app.get('/add_student',rolePermission('addStudent'), async(req,res) =>{
    let playlist;
    if(req.session.user.roles_id.roles === 'admin'){
     playlist = await playListModel.find().sort('-_id').select('_id playlist')
    }else{
        playlist = await playListModel.find({$and: [{user_id:req.session.user._id, status:1}]}).sort('-_id').select('_id playlist')
    }
    res.render('admin/student/add_student',{playlist:playlist,inArray:inArray});
})

app.post('/add_student',rolePermission('addStudent'),imageUpload.single('image'),async(req,res)=>{
const {name,mobile,email,password,assign_course,address} = req.body;

 studentModel.create({
     user_id:req.session.user._id,
     name:name,
     image: typeof req.file !== 'undefined' && req.file !== null ? req.file.path.replace('public','') : '',
     mobile:mobile,
     email:email,
     password:password,
     assign_course:assign_course,
     address:address,
    }).then((success)=>{
     res.redirect('/student/show_student')
    }).catch((err)=>{
        console.log(err)
     res.redirect('/student/add_student')
 
    })
 
 })

 app.get('/show_student',rolePermission('viewStudent'), async(req,res)=>{
    let playlist;
    let student;
    if(req.session.user.roles_id.roles === 'admin'){
     student = await studentModel.find().sort('-_id').populate('assign_course','_id playlist').populate('user_id','name')
     playlist = await playListModel.find().sort('-_id').select('_id playlist')
    }else{
        student = await studentModel.find({user_id:req.session.user._id}).sort('-_id').populate('assign_course','_id playlist').populate('user_id','name')
        playlist = await playListModel.find({user_id:req.session.user._id}).sort('-_id').select('_id playlist')
    }
    
    res.render('admin/student/show_student',{student:student,playlist:playlist,inArray:inArray})

})

//my code start
app.get('/view_student_overview/:id',async (req,res)=>{



var user_id = req.params.id;
//console.log("User ID is "+user_id);

   // var student_assignment_data = await assignment_assign.find({student_id:user_id}).populate('chapter_id');
var student_data = await studentModel.find({_id:user_id});
    console.log('hvjsvhsajvhsgdfgwy'+student_data);
 
    res.render('admin/student/show_student_overview' , {data : student_data,inArray:inArray});
})
//my code end





app.get('/status_student/:id/:num',rolePermission('statusStudent'), async(req,res)=>{
    const {id,num} = req.params;
    const data = await studentModel.updateOne({_id:id},{status:num})
    res.redirect('/student/show_student');
    // res.render('/admin/teacher/edit_teacher',{teacher:data})
})

app.get('/delete_student/:id',rolePermission('deleteStudent') , async(req,res)=>{
    const {id} = req.params;
    const delet = await studentModel.deleteOne({_id:id})
    res.redirect('/student/show_student');
})

app.get('/edit_student/:id',rolePermission('editStudent'),async(req,res)=>{
  const {id}= req.params;
  let playlist;

  const data = await studentModel.findOne({_id:id})
  if(req.session.user.roles_id.roles === 'admin'){
   playlist = await playListModel.find().sort('-_id').select('_id playlist')
  }else{
    playlist = await playListModel.find({user_id:req.session.user._id}).sort('-_id').select('_id playlist')
  }
  console.log(data)
  res.render('admin/student/edit_student',{student:data,playlist:playlist,inArray:inArray})
})





app.get('/checkpayment',rolePermission('editStudent'), async  (req, res) => {


    try
    {

        const data = await payment_done.find().sort({ _id: -1 });

        for (const record of data) {
            const student = await studentModel.findOne({ _id: record.user_id }); // Using findOne instead of find
            if (student) {
                record.studentName = student.name; 
                record.studentMobile=student.mobile;
                record.studentemail = student.email;

            } else {
                record.studentName = 'Unknown'; // Handle case where student is not found
            }
        }


        for(const record1 of data)
        {
            const playlistdata   = await playListModel.findOne({_id:record1.playlist_id});
            if(playlistdata)
            {
record1.playlist_name = playlistdata.playlist;
            }
            else
            {
                record1.playlist_name = 'Unknown'
            }

        }


        
        res.render('admin/student/check_payment_status',{data:data,inArray:inArray});

    }
    catch(error)
    {
        console.error("Error Payments:", error);
        res.status(500).send("Internal server error");
    }

});



app.get('/show_student_attendance', rolePermission('editStudent'), async (req, res) => {
    try {
        const data = await student_attendance.find();

        for(const record1 of data)
        {
            const coure_data = await playListModel.findOne({_id:record1.course_id});
            if(coure_data)
            {
                record1.course_name = coure_data.playlist;
            }

        }
        // Fetch student names for each attendance record
        for (const record of data) {
            const student = await studentModel.findOne({ _id: record.student_id }); // Using findOne instead of find
            if (student) {
                record.studentName = student.name; 
                record.studentMobile=student.mobile;
                record.studentemail = student.email;

            } else {
                record.studentName = 'Unknown'; // Handle case where student is not found
            }
        }

       // console.log(data);
        res.render('admin/student/student_attendance_view', { data: data, inArray: inArray });
    } catch (error) {
        console.error("Error fetching student attendance:", error);
        res.status(500).send("Internal server error");
    }
});





app.post('/edit_student/:id',rolePermission('editStudent'),imageUpload.single('image'),async (req,res)=>{
    const {id}=req.params;
    const {name,mobile,email,password,assign_course,address,imageUnlink} = req.body;
    console.log(req)
    let imageUpload='';
    if(typeof req.file == 'undefined' && req.file == null){
        imageUpload = imageUnlink;
   }else{
    
        imageUpload = req.file.path.replace('public','');
   }
   
   studentModel.updateOne({_id:id},{
        name:name,
        image:imageUpload,
        mobile:mobile,
        email:email,
        password:password,
        assign_course:assign_course,
        address:address,    
       }).then((success)=>{
        res.redirect('/student/show_student')
       }).catch((err)=>{
        console.log(err)
        res.redirect('/student/edit_student/'+id)
    
       })

})




module.exports=app;