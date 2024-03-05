const express = require('express');
const coursee = require(__dirname+'/../../Models/course');
const playlist = require(__dirname+'/../../Models/playList');
const user = require(__dirname+'/../../Models/StudentModel');
const payment_done = require(__dirname+'/../../Models/payment_done');
const multer = require('multer')
const couponModel = require(__dirname+'/../../Models/coupon');
const coupon_applied = require(__dirname+'/../../Models/coupon');
//const studentmodel =  require(__dirname+'/../../Models/coupon');
const app = express.Router();

app.post('/payment',multer().none(), async (req, res) => {
const { user_id, playlist_id } = req.body;
   playlist.findOne({_id:playlist_id }).populate('payments').then(async(course_details)=>{
    const user_details = await user.findOne({_id: user_id});
     const course_res = course_details.toObject();
     console.log(course_res)
    res.status(200).json({ response: { course_details: course_res, user_details: user_details } });
  }).catch((err)=>{
    console.log(err.message)
  })
});

app.post('/payment_done',multer().none(),async(req,res)=>{
  const{ user_id, payment_id,course_id,payment_status,transcation_id,amount,coupan,discount_amount,course_amount} = req.body;
   console.log(user_id,course_id);

   if(user_id == null){
    res.status(500).json({response:'user_id  is null'})
   }
  payment_done.create({
    user_id:user_id,
    playlist_id:course_id,
    payment_status:payment_status,
    amount:amount,
    coupan:coupan,
    discount_amount:discount_amount,
    course_amount:course_amount,
    transcation_id:transcation_id
  }).then((data)=>{
    console.log(data)

    
const student_assign_course = user.findByIdAndUpdate(user_id ,{ $push : {"assign_course" : course_id} },{new:true}).exec();

     res.status(200).json({response:'payment done!'})
  }).catch((err)=>{
    console.log(err.message)
    res.status(500).json({response:err})
  })
})


app.post('/user_order',multer().none(), (req, res) => {
  const { user_id, course_id } = req.body;
  payment_done.findOne({ $and:  [{ user_id: user_id }, { playlist_id: course_id }] })
    .then((data) => {
      console.log(user_id,course_id)
      console.log(data)
      res.status(200).json({ response: data });
    })
    .catch((err) => {
      console.log(err.message);
      res.status(500).json({ error: 'An error occurred while fetching user order.' });
    });
});


app.post('/order_history', multer().none(), (req, res) => {
  const { user_id } = req.body;
  payment_done.find({ user_id: user_id }).populate({ path: 'course_id', populate: { path: 'teacher' }, populate: { path: 'payment'} })
    .then((data) => {
      const response = data.map((doc) => doc.toObject());
      console.log(response);
      res.status(200).json({ response: response });
    })
    .catch((err) => {
      console.log(err.message);
      res.status(500).json({ error: 'An error occurred while fetching user order.' });
    });
});

//////////////couppon/////////////

app.get('/coupon',(req,res)=>{
  couponModel.find().then((data)=>{
     console.log(data)
     res.status(200).json({response:data})
  }).catch((err)=>{
    res.status(500).json(err)    
  })
})

app.post('/coupon',multer().none(),async(req,res)=>{
  const { coupon,user_id } = req.body;
 await couponModel.findOne({coupon:coupon}).then(async(data)=>{
     console.log(data)
  
  //  const applied = await  coupon_applied.findOne({$and: [{coupon:coupon},{user_id:user_id}]})
  //  if(typeof applied.status != 'undefined' && applied.status != null){
  //       res.status(200).json({response:'Coupon is Allready Applied'})
  //  }else{
     res.status(200).json({response:data})
  //  }
  }).catch((err)=>{
    res.status(500).json(err)
  })
})


module.exports = app;
