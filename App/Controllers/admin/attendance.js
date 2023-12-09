const express = require('express');
const app = express.Router();
const attendance = require(__dirname+'/../../Models/attendance');
const inArray = require('in-array'); 
const loginModel = require(__dirname+'/../../Models/admin_login');
const rolePermission = require(__dirname+'/../../middleware/PermissionCheck');



app.post('/insert',rolePermission('addAtten'),async(req,res)=>{
 const {status} = req.body
 const now = new Date();
 const options = { timeZone: 'Asia/Kolkata' };
 const ISTDateString = now.toLocaleString('en-US', options);

const attendanc = await attendance.create({
    user_id:req.session.user._id,
    note:status,
    login_date:ISTDateString,
    present:true
})
// res.session.attendance = true;
const referer = req.headers.referer || '/';
res.send(referer)



})

app.get('/update',rolePermission('addAtten'),async(req,res)=>{
  
   
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const now = new Date();
    const options = { timeZone: 'Asia/Kolkata' };
    const ISTDateString = now.toLocaleString('en-US', options);

    attendance.findOneAndUpdate(
        {
          $and: [
            { login_date: { $gte: today } },
            { present: true },
            { logout: false },
            { user_id: req.session.user._id },
          ],
        },
        {
          $set: {
            logout: true,
            logout_date: ISTDateString,
           
          },
        }
      )
        .then((success) => {
          const referer = req.headers.referer || '/';
          res.redirect(referer);
        })
        .catch((err) => {
          console.log(err);
        });
      
    
})

app.get('/show_attendance',rolePermission('viewAtten'), async(req,res)=>{
    const user = await loginModel.find()
    var atten
    if(req.session.user.roles_id.roles === 'admin'){
     atten = await attendance.find().populate('user_id').sort('-_id');
    }else{
     atten = await attendance.find({user_id:req.session.user._id}).populate('user_id').sort('-_id');
    }
    console.log(atten)
    res.render('admin/attendance/show_attendance',{inArray:inArray,atten:atten,user:user})
})


app.get('/delete_atten/:id',rolePermission('deleteAtten'),async(req,res)=>{
const {id} = req.params;
    await attendance.deleteOne({_id:id});
    res.redirect('/attendance/show_attendance');
})
module.exports=app