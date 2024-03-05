const express = require('express')
const app = express.Router();
const playListModel = require(__dirname+'/../../Models/playList');
const course = require(__dirname+'/../../Models/course');
const teacterModel = require(__dirname+'/../../Models/TeacherModel');
const imageUpload = require(__dirname+'/../../middleware/uploadImage');
const rolePermission = require(__dirname+'/../../middleware/PermissionCheck'); //middleware for session check
const inArray = require('in-array'); 

    
app.get('/show_teacher',rolePermission('viewTeacher'), async(req,res)=>{

    let teacher;
    let playlist;
    if(req.session.user.roles_id.roles === 'admin'){
     teacher = await teacterModel.find().sort('-_id').populate('assign_course').populate('user_id','name')
     playlist = await playListModel.find().sort('-_id').select('_id playlist')
    }else{
         teacher = await teacterModel.find({user_id:req.session.user._id}).sort('-_id').populate('assign_course').populate('user_id','name')
         playlist = await playListModel.find({user_id:req.session.user._id}).sort('-_id').select('_id playlist')

    }
   console.log(`here is data ${teacher}`)
    
    res.render('admin/teacher/show_teacher',{teacher:teacher,playlist:playlist,inArray:inArray})

})

app.get('/add_teacher',rolePermission('addTeacher'), async(req,res)=>{
    let playlist;
    if(req.session.user.roles_id.roles === 'admin'){
     playlist = await playListModel.find({status:1}).sort('-_id');
    }else{
     playlist = await playListModel.find({status:1}).sort('-_id');
    }
    res.render('admin/teacher/add_teacher',{playlist:playlist,inArray:inArray});
})

app.post('/add_teacher',rolePermission('addTeacher'),imageUpload.single('image'),async(req,res)=>{
   const {name,mobile,email,password,assign_course,exprience,bio,address} = req.body;
console.log(req)
teacterModel.create({
    user_id:req.session.user._id,
    name:name,
    image:typeof req.file !== 'undefined' && req.file !== null ? req.file.path.replace('public', '') :'',
    mobile:mobile,
    email:email,
    password:password,
    assign_course:assign_course,
    exprience:exprience,
    bio:bio,
    address:address,
   }).then((success)=>{
    res.redirect('/teacher/show_teacher')
   }).catch((err)=>{
    res.redirect('/teacher/add_teacher')

   })

})

app.get('/delete_teacher/:id',rolePermission('deleteTeacher') , async(req,res)=>{
    const {id} = req.params;
    const delet = await teacterModel.deleteOne({_id:id})
    res.redirect('/teacher/show_teacher');
})

app.get('/status_teacher/:id/:num',rolePermission('statusTeacher'), async(req,res)=>{
    const {id,num} = req.params;
    const data = await teacterModel.updateOne({_id:id},{status:num})
    res.redirect('/teacher/show_teacher');
    // res.render('/admin/teacher/edit_teacher',{teacher:data})
})


app.get('/edit_teacher/:id',rolePermission('editTeacher'),async(req,res)=>{
  const {id}= req.params;
  const data = await teacterModel.findOne({_id:id})
  let playlist;
  if(req.session.user.roles_id.roles === 'admin'){
   playlist = await playListModel.find().sort('-_id')
  }else{
    playlist = await playListModel.find().sort('-_id')
  }
  console.log(data)
  res.render('admin/teacher/edit_teacher',{teacher:data,playlist:playlist,inArray:inArray})
})

app.post('/edit_teacher/:id',rolePermission('editTeacher'),imageUpload.single('image'),async (req,res)=>{
    const {id}=req.params;
    const {name,mobile,email,password,assign_course,exprience,bio,address,imageUnlink} = req.body;
    console.log(req)
    let imageUpload='';
    if(typeof req.file == 'undefined' && req.file == null){
        imageUpload = imageUnlink;
   }else{
    
        imageUpload = req.file.path.replace('public', '');
   }
   
    teacterModel.updateOne({_id:id},{
        name:name,
        image:imageUpload,
        mobile:mobile,
        email:email,
        password:password,
        assign_course:assign_course,
        exprience:exprience,
        bio:bio,
        address:address,    
       }).then((success)=>{
        res.redirect('/teacher/show_teacher')
       }).catch((err)=>{
        res.redirect('/teacher/edit_teacher/'+id)
    
       })

})

module.exports=app;