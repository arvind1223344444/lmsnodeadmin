const express = require('express');
const app = express.Router();
const multer = require('multer');
const upload = multer();
const imgUploadImddleware = require(__dirname+'/../../middleware/uploadImage');
const rolePermission = require(__dirname+'/../../middleware/PermissionCheck'); //middleware for session check
const levelModel = require(__dirname+'/../../Models/level');
const inArray = require('in-array'); 




app.get('/addlevel',rolePermission('addLevel'),async(req,res)=>{
    // const course =  await courseModel.find();
    res.render('admin/level/add_level',{inArray:inArray});
});

app.post('/addlevel',rolePermission('addLevel'),imgUploadImddleware.single('LevelImage'),async (req,res)=>{
    const {levelName } = req.body;
    levelModel({
        levelName: levelName,
        levelImage: typeof req.file !== 'undefined' && req.file !== null ?  req.file.path.replace('public','') :'',
    
    }).save().then((data)=>{
        res.redirect('/level/show_level');
    }).catch((err)=>{
        console.error(err.message);
    });
});

app.get('/show_level',rolePermission('viewLevel'),async (req,res)=>{
    const level =  await levelModel.find().sort('-_id');
    res.render('admin/level/showlevel',{level:level,inArray:inArray});
     
});



app.get('/edit_level/:id',rolePermission('editLevel'),async (req,res)=>{
    const id = req.params.id;
    levelModel.findOne({_id:id}).then(reslut=>{
        res.render('admin/level/edit_level',{level:reslut,inArray:inArray});
    }).catch(err => {
        console.err(err);
    })
    
})

app.post('/edit_level/:id',rolePermission('editLevel'),imgUploadImddleware.single('levelImage'),async(req,res)=>{
    const {levelName,imageUnlink} = req.body;
    const id = req.params.id;
    var imageUpload ='';
    

    if(typeof req.file == 'undefined' && req.file == null  ){
         imageUpload = imageUnlink;
    }else{
         imageUpload = req.file.path.replace('public','');
    }


    levelModel.updateOne({ _id: id }, {
        levelName: levelName,
        levelImage: imageUpload,
    }).then((reslut) => {
        res.redirect('/level/show_level');
    }).catch((err) => {
        console.error(err);
    })

})

app.get('/status_level/:id/:status',rolePermission('statusLevel'),async (req,res)=>{
    const id = req.params.id;
    const status = req.params.status;

    await levelModel.updateOne({_id:id},{status:status});
    res.redirect('/level/show_level');
})

app.get('/delete_level/:id',rolePermission('deleteLevel'),async(req,res)=>{
    const id = req.params.id;
    await levelModel.deleteOne({_id:id});
    res.redirect('/level/show_level');
});

module.exports = app;

