
const express = require('express');
const app = express.Router();
const studentModel =  require(__dirname+'/../../Models/StudentModel');
const multer = require('multer');
const axios = require('axios');

function generateRandomNumber() {
    const min = 10000; // Minimum 6-digit number
    const max = 99999; // Maximum 6-digit number
  
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

const  loadOtp = async(number,ootp)=>{
   const uname= '20220104';
   const pass = 'a0IXzx9t';
   const send = 'JIGSWS'; 
   const dest = number;

   const apiUrl = `http://164.52.195.161/API/SendMsg.aspx?uname=20220104&pass=a0IXzx9t&send=JIGSWS&dest=${number}&msg=Dear%20User,%20${ootp}%20is%20your%20OTP%20to%20authenticate%20your%20login%20in%20IP%20Support.%0Ahttps://ipsupport.in/index.php%20Jigsaw`;
   
console.log(apiUrl)
   axios.post(apiUrl)
     .then(response => {
       console.log('Response:', response.data);
     })
     .catch(error => {
       console.error('Error:', error.message);
     });
   }





app.post('/user_auth',multer().none(),async(req,res)=>{
     const {mobile} = req.body;



     
     studentModel.findOne({$and: [{
        mobile:mobile
     },
     {
        status:1  
     }
    ]}).then(async(data)=>{


      
      if(typeof data !== 'undefined' && data !==null ){
         console.log(data)
         if( data.register == 1){
        
        const randomSixDigitNumber = await generateRandomNumber();
        await loadOtp(mobile,randomSixDigitNumber);
        await studentModel.updateOne({mobile:data.mobile},{otp:randomSixDigitNumber})
        res.status(200).json({status:true,response:"Allready Register",user_status:0})
         }else{
           
            const randomSixDigitNumber = await generateRandomNumber();
        
            const hitOtpUrl = async (mobile, otp) => {
               const url = `http://164.52.195.161/API/SendMsg.aspx?uname=20220104&pass=a0IXzx9t&send=JIGSWS&dest=${mobile}&msg=Dear%20User,%20${otp}%20is%20your%20OTP%20to%20authenticate%20your%20login%20in%20IP%20Support.%0Ahttps://ipsupport.in/index.php%20Jigsaw`;
       
               try {
                   // Make a GET request to the OTP URL
                   const response = await axios.get(url);
       
                   // Log the response if needed
                   console.log(response.data);
       
                   // Handle response status or data as needed
               } catch (error) {
                   // Handle errors if any
                   console.error('Error sending OTP:', error);
               }
           };
        
        
        
            await loadOtp(mobile,randomSixDigitNumber);
            await studentModel.updateOne(
               { mobile: mobile }, // filter for selecting the document to update or insert
               { $set: { otp: randomSixDigitNumber ,mobile: mobile } }, // update operation to apply to the selected document
               { upsert: true } // options object with upsert set to true
             );
            res.status(200).json({status:true,response:'not_register',otp:randomSixDigitNumber,user_status:1})

         }
      }else{
      
         const randomSixDigitNumber = await generateRandomNumber();
         await loadOtp(mobile,randomSixDigitNumber);
         await studentModel({ otp: randomSixDigitNumber ,mobile: mobile}).save();
         res.status(200).json({status:true,response:'not_register',otp:randomSixDigitNumber,user_status:1})
      }
     }).catch((err)=>{
        res.status(500).json({status:false,error:err})    
     })

})


app.post('/otp_validate', multer().none(),async(req,res)=>{
 const {mobile,otp} = req.body;
  const data =   await studentModel.findOne({$and: [{mobile:mobile,},{otp:otp}]});
  console.log(data);
  if(typeof data !== 'undefined' && data !==null ){
   res.status(200).json({status:true,response:'otp successfully varfied',success:1})
  }else{
  
   res.status(200).json({status:true,response:'incorrect otp',success:0})
  }
})

app.post('/user_auth_register',multer().none(),async(req,res)=>{ 

  const {name,mobile,gender,state,email,password,assign_course,address} = req.body;

 studentModel.updateOne({mobile:mobile},{  
     name:name,
     email:email,
     gender:gender,
     register:1,
     state:state,
    }).then(async(success)=>{
      const data = await studentModel.findOne({mobile:mobile})
        res.status(200).json({status:true,response:'Successfully account created!',user_name:data.name,user_id:data._id})
    }).catch((err)=>{
        console.log(err)
        res.status(500).json({status:true,response:err.message})   
 
    })

 })


 app.post('/user_auth_login',multer().none(),async(req,res)=>{

   const {mobile} = req.body;
   studentModel.findOne({$and: [{
      mobile:mobile
   },
   {
      status:1  
   }
  ]}).then(async(data)=>{
    if(typeof data !== 'undefined' && data !==null ){
       console.log(data)
       if( data.register == 1){
       const randomSixDigitNumber = await generateRandomNumber();

       const hitOtpUrl = async (mobile, otp) => {
         const url = `http://164.52.195.161/API/SendMsg.aspx?uname=20220104&pass=a0IXzx9t&send=JIGSWS&dest=${mobile}&msg=Dear%20User,%20${otp}%20is%20your%20OTP%20to%20authenticate%20your%20login%20in%20IP%20Support.%0Ahttps://ipsupport.in/index.php%20Jigsaw`;
 
         try {
             // Make a GET request to the OTP URL
             const response = await axios.get(url);
 
             // Log the response if needed
             console.log(response.data);
 
             // Handle response status or data as needed
         } catch (error) {
             // Handle errors if any
             console.error('Error sending OTP:', error);
         }
     };


      await loadOtp(mobile,randomSixDigitNumber);
      await studentModel.updateOne({mobile:data.mobile},{otp:randomSixDigitNumber})
      
      res.status(200).json({status:true,response:"Otp send successfully ",otp:randomSixDigitNumber,user_status:1})
       }else{
      res.status(200).json({status:true,response:"user is not register",user_status:0})

       }
      }else{
         res.status(200).json({status:true,response:"user is not register",user_status:0})
      }
      })

 })


 app.post('/otp_validate_login', multer().none(),async(req,res)=>{
   const {mobile,otp} = req.body;
    const data =   await studentModel.findOne({$and: [{mobile:mobile,},{otp:otp}]});
    console.log(data);
    if(typeof data !== 'undefined' && data !==null ){
     res.status(200).json({status:true,response:'otp successfully varfied',user_name:data.name,user_id:data._id,success:1})
    }else{
    
     res.status(200).json({status:true,response:'incorrect otp',success:0})
    }
  }) 

module.exports = app;