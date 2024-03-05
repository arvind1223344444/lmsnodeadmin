const express = require('express');
const app = express.Router();
const multer = require('multer');
const upload = multer();
const imgUploadImddleware = require(__dirname+'/../../middleware/uploadImage');
const courseModel = require(__dirname+'/../../Models/course');
const rolePermission = require(__dirname+'/../../middleware/PermissionCheck'); //middleware for session check
const fs = require('fs')
const inArray = require('in-array'); 



app.get('/addcourse',rolePermission('addCourse'),(req,res)=>{
    res.render('admin/course/addcourse',{inArray:inArray});
});

app.post('/addcourse',rolePermission('addCourse'),imgUploadImddleware.single('courseImage'),async (req,res)=>{
    const {courseName,desc} = req.body;
    courseModel({
        courseName: courseName,
      courseImage: typeof req.file !== 'undefined' && req.file !== null ? req.file.path.replace('public', '') : '',
        desc:desc
    }).save().then((data)=>{
        res.redirect('/course/show_course');
    }).catch((err)=>{
        console.error(err.message);
    });
});

app.get('/show_course',rolePermission('viewCourse'),async (req,res)=>{
    const course =  await courseModel.find().sort('-_id');
      res.render('admin/course/showCourse',{course:course,inArray:inArray});
});

app.get('/delete_course/:id',rolePermission('deleteCourse'),async(req,res)=>{
    const id = req.params.id;
    await courseModel.deleteOne({_id:id});
    res.redirect('/course/show_course');
});

app.get('/edit_course/:id',rolePermission('editCourse'),async (req,res)=>{
    const id = req.params.id;
    courseModel.findOne({_id:id}).then(reslut=>{
        res.render('admin/course/edit_course',{course:reslut,inArray:inArray});
    }).catch(err => {
        console.err(err);
    })
    
})

app.post('/edit_course/:id',rolePermission('editCourse'),imgUploadImddleware.single('courseImage'),async(req,res)=>{
    const {courseName,imageUnlink,desc} = req.body;
    const id = req.params.id;
    var imageUpload ='';
    console.log(imageUpload);
    console.log(req.file)

    if(typeof req.file == 'undefined' && req.file == null  ){
         imageUpload = imageUnlink;
    }else{
         imageUpload = req.file.path.replace('public','');
    }
  

    courseModel.updateOne({_id:id},{
        
        courseName: courseName,
        courseImage: imageUpload ,
        desc:desc
    }).then((reslut) => {
        res.redirect('/course/show_course');
    }).catch((err) => {
        console.error(err);
    })

})

app.get('/status_course/:id/:status',rolePermission('statusCourse'),async (req,res)=>{
    const id = req.params.id;
    const status = req.params.status;

    await courseModel.updateOne({_id:id},{status:status});
    res.redirect('/course/show_course');
})
module.exports = app;

