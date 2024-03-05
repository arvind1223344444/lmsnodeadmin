const express = require('express');
const app = express.Router()
const multer = require('multer')

const { ObjectId } = require('mongoose').Types;
const assignmentModel = require(__dirname+'/../../Models/assignment');
const assign_question_Model = require(__dirname+'/../../Models/assignment_question');
const assign_task = require(__dirname+'/../../Models/assignment_assign');
const oral_assign =  require(__dirname+'/../../Models/oral_assign');





const assign_answer = require(__dirname+'/../../Models/assignment_answer');
const work = require(__dirname+'/../../Models/assign_work_done_status');

const student_attendance = require(__dirname+'/../../Models/student_attendance');









// this api to show all asign assignmrnt in this chapter accoding to type ex: class_work, home_work

app.get('/get_assignment/:chapter_id/:type',multer().none(),(req,res)=>{
     const { chapter_id, type } = req.params;
    assignmentModel.find({chapter_id:chapter_id,type:type}).then((data)=>{
        console.log(data);
        res.status(200).send({response : data}) 
     }).catch((err)=>{
        res.send(err)  //    
     })    
})

// this api show show assign assignment question to users and teacher
app.get('/get_assignment_question/:assignment_id/:student_id',multer().none(),(req,res)=>{
    const { assignment_id , student_id} = req.params;
    assign_question_Model.find({assignment_id:assignment_id}).populate({  path: 'get_answer',
    match: { student_id: student_id }}).then((data)=>{
        console.log(data);
       const response = data.map((doc) => doc.toObject());
        res.status(200).send({response : response})
     }).catch((err)=>{
        res.send(err)
     }) 
})
// this this api here teacher can assign assignment to- the students 

app.post('/assign_assignment_to_student', multer().none(), async (req, res) => {
   const { student_id, assignment_id ,chapter_id} = req.body;
 
   const validationPromises = student_id.map(async (element) => {
     // Use an asynchronous query to check if the assignment exists for this student
     const eist = await assign_task.findOne({
       student_id: element,
       chapter_id:chapter_id,
       assignment_id: { $in: assignment_id }
     });
 
    //  if (eist !== null) {
    //    // User already assigned the same assignment, return a response
    //    return 'alreadyAssigned';
    //  } else {

    const aa = await assign_task.deleteOne({
      student_id: element
  });

       // No existing assignment, create a new one
       await assign_task.findOneAndUpdate(
         { student_id: element,chapter_id:chapter_id, assignment_id: { $nin: assignment_id } },
         { $addToSet: { assignment_id: assignment_id } },
         { new: true, upsert: true }
       );


      

       return 'assignmentCreated';
    //  }
});
 

//old assignment assign code strart
// app.post('/assign_assignment_to_student', multer().none(), async (req, res) => {
//   const { student_id, assignment_id ,chapter_id} = req.body;

//   const validationPromises = student_id.map(async (element) => {
//     // Use an asynchronous query to check if the assignment exists for this student
//     const eist = await assign_task.findOne({
//       student_id: element,
//       chapter_id:chapter_id,
//       assignment_id: { $in: assignment_id }
//     });

//     if (eist !== null) {
//       // User already assigned the same assignment, return a response
//       return 'alreadyAssigned';
//     } else {


//       // No existing assignment, create a new one
//       await assign_task.findOneAndUpdate(
//         { student_id: element,chapter_id:chapter_id, assignment_id: { $nin: assignment_id } },
//         { $addToSet: { assignment_id: assignment_id } },
//         { new: true, upsert: true }
//       );


     

//       return 'assignmentCreated';
//     }
// });

//   // Wait for all the validation and creation tasks to complete

// const results = await Promise.all(validationPromises);
//   if (results.includes('alreadyAssigned')) {
//     res.status(200).send({ response: 'Assignment already assigned to some users.' });
//   } else {
//     res.status(200).send({ response: 'Assignments assigned!' });
//   }
// });
//old assignment assign code end






   // Wait for all the validation and creation tasks to complete

 const results = await Promise.all(validationPromises);
   if (results.includes('alreadyAssigned')) {
     res.status(200).send({ response: 'Assignment already assigned to some users.' });
   } else {
     res.status(200).send({ response: 'Assignments assigned!' });
   }
 });









 // this for notify every student who have assign assignment
 // add live class type in this 
 app.get('/get_notification/:student_id/:chapter_id',multer().none(),async(req,res)=>{
   const {student_id, chapter_id } = req.params;
    assign_task.findOne({ student_id:student_id, chapter_id:chapter_id}).populate({path :'assignment_id',match:{type:'class_work'}}).then((data)=>{
      const dataw1= data.toObject();
      console.log('get_notification'+dataw1)
      res.status(200).send({response: dataw1})
    }).catch((err)=>{
      res.status(500).send(err)
    })
 })

 app.get('/get_home_work/:student_id/:chapter_id',multer().none(),async(req,res)=>{
  const {student_id, chapter_id } = req.params;
   assign_task.findOne({ student_id:student_id, chapter_id:chapter_id}).populate({path :'assignment_id',match:{type:'home_work'}}).then((data)=>{
     const dataw1= data.toObject();
     console.log('get_notification'+dataw1)
     res.status(200).send({response: dataw1})
   }).catch((err)=>{
     res.status(500).send(err)
   })
})

app.get('/get_class_oral/:student_id/:chapter_id',multer().none(),async(req,res)=>{
  const {student_id, chapter_id } = req.params;
   assign_task.findOne({ student_id:student_id, chapter_id:chapter_id}).populate({path :'assignment_id',match:{type:'class_work_oral'}}).then((data)=>{
     const dataw1= data.toObject();
     console.log('get_notification'+dataw1)
     res.status(200).send({response: dataw1})
   }).catch((err)=>{
     res.status(500).send(err)
   })
})



app.get('/get_home_oral/:student_id/:chapter_id',multer().none(),async(req,res)=>{
  const {student_id, chapter_id } = req.params;
   assign_task.findOne({ student_id:student_id, chapter_id:chapter_id}).populate({path :'assignment_id',match:{type:'home_work_oral'}}).then((data)=>{
     const dataw1= data.toObject();
     console.log('get_notification'+dataw1)
     res.status(200).send({response: dataw1})
   }).catch((err)=>{
     res.status(500).send(err)
   })
})



//  app.get('/get_assignment_question_with_answer/:assignment_id',multer().none(),async(req,res)=>{
//     const {assignment_id} = req.params;
//     assign_question_Model.findOne({assignment_id:assignment_id}).populate('ge_answer').then((data)=>{
//       const dataw1= data.toObject();
//       console.log('get_assignment_question'+dataw1)
//       res.status(200).send({response:dataw1}) 
//     }).catch((err)=>{                                                                                  
//       res.status(500).send(err.message)
//     })
//  })



 app.post('/get_assignment_answer', multer().none(), async (req, res) => {
  const { answer, question_id, student_id } = req.body;

  const questionCheck = await assign_question_Model.findOne({_id:question_id});
  var markss = 0;
  var neg = 0;
  if(questionCheck.answer == answer){
      markss = questionCheck.marks;
  }else{
     neg = questionCheck.negative;
  }
  const existingAnswer = await assign_answer.findOne({
      question_id: question_id,
      student_id: student_id,
  });

  if (existingAnswer) {
    try {
      await assign_answer.updateOne(
        { question_id: question_id, student_id: student_id },
        { answer: answer, marks: markss, negetive: neg }
      );
    res.status(200).json({ response: 'Answer updated successfully' });

  } catch (error) {
    console.error("Error updating document:", error);
    res.status(500).send(error.message);
  }
  } else {

    await assign_answer.create({
      answer: answer,
      question_id: question_id,
      student_id: student_id,
      marks:markss,
      negetive:neg
    });
    res.status(200).json({ response: 'Answer created successfully' });
  }
});





app.post('/get_class_oral_answer', multer().none(), async (req, res) => {
  const { answer, question_id, student_id } = req.body;

  const questionCheck = await assign_question_Model.findOne({_id:question_id});
  var markss = 0;
  var neg = 0;
  if(questionCheck.answer == answer){
      markss = questionCheck.marks;
  }else{
     neg = questionCheck.negative;
  }
  const existingAnswer = await assign_answer.findOne({
      question_id: question_id,
      student_id: student_id,
  });

  if (existingAnswer) {
    try {
      await assign_answer.updateOne(
        { question_id: question_id, student_id: student_id },
        { answer: answer, marks: markss, negetive: neg }
      );
    res.status(200).json({ response: 'Answer updated successfully' });

  } catch (error) {
    console.error("Error updating document:", error);
    res.status(500).send(error.message);
  }
  } else {

    await assign_answer.create({
      answer: answer,
      question_id: question_id,
      student_id: student_id,
      marks:markss,
      negetive:neg
    });
    res.status(200).json({ response: 'Answer created successfully' });
  }
});




app.get('/get_assignment_history/:chapter_id',multer().none(),async(req,res)=>{
  const { chapter_id } = req.params;
   assign_task.find({chapter_id:chapter_id}).populate('student_id').populate('assignment_id').then((data)=>{
    console.log(data)
     const dataw1= data.map((doc) => doc.toObject())
     console.log('get_notification'+dataw1) 
     res.status(200).send({response: dataw1}) 
   }).catch((err)=>{
     res.status(500).send(err)
   })
})


app.get('/work_done_status/:assignment_id/:student_id',multer().none(),async(req,res)=>{
const {assignment_id,student_id} = req.params;

const check = await work.findOne({
  student_id:student_id,
  assignment_done:assignment_id,
});
if(!check){
work.create({
  student_id:student_id,
  assignment_done:assignment_id,
}).then((s)=>{
  res.status(200).send({response: 'data inserted!'})
}).catch((err)=>{
  console.log(err)
  res.status(500).send({response:err})
})
}else{

  res.status(200).send({response: 'data already inserted!'})

}
})



app.get('/student_attendance/:playlist_id/:student_id/:course_id',multer().none(),async(req,res)=>{
  const {playlist_id,student_id,course_id} = req.params;
  const now = new Date();
  const indianOffset = 5.5 * 60 * 60 * 1000; // IST offset is 5 hours 30 minutes ahead of UTC
  const indianTime = new Date(now.getTime() + indianOffset).toISOString().slice(0, -1);

  // Convert to ISO string format  
  //const isoDateTime = new Date(indianDateTime).toISOString();

  const check = await student_attendance.findOne({
    student_id:student_id,
    playlist_id:playlist_id,
  });
  if(!check){
    student_attendance.create({
    student_id:student_id,
    playlist_id:playlist_id,
    course_id:course_id,
    in_time:indianTime
  }).then((s)=>{
    res.status(200).send({  res: {
      status: 0,
      response: 'Attendance Marked Successfully'
    }
  })
  }).catch((err)=>{
    console.log(err)
    res.status(500).send({response:err})
  })
  }
  else
  {
  
    student_attendance.findOneAndUpdate(
      { student_id: student_id, playlist_id: playlist_id }, // Where clause
      { $set: { out_time: indianTime } }, // Update operation
      { upsert: true, new: true } // Options
    )
    .then((result) => {
      res.status(200).send({
        res: {
          status: 0,
          response: 'Attendance updated successfully'
        }
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ response: err });
    });
  
  }
  })


app.get('/class_work_oral_done_status/:assignment_id/:student_id',multer().none(),async(req,res)=>{
  const {assignment_id,student_id} = req.params;
  
  const check = await work.findOne({
    student_id:student_id,
    assignment_done:assignment_id,
  });
  if(!check){
  work.create({
    student_id:student_id,
    assignment_done:assignment_id,
  }).then((s)=>{
    res.status(200).send({response: 'data inserted!'})
  }).catch((err)=>{
    console.log(err)
    res.status(500).send({response:err})
  })
  }
  else
  {
  
    res.status(200).send({response: 'data already inserted!'})
  
  }
  })

app.get('/getnextid/:assignment_id/:question_id',multer().none(),async(req,res)=>{
  const { assignment_id,question_id } = req.params;
    const data = await assign_question_Model.find({assignment_id:assignment_id})
        console.log('8'+data,assignment_id);
  
     
       var val=0;
       var youNextID=0;
  
       data.map(element => {
     
        if(val == 1){
           youNextID = element._id;
           val=0;
           res.status(200).send({reponse:youNextID});
           return true; 
      
        }else if(element._id == question_id){
              val = 1
       }
     
     });
  
  })
  
module.exports= app;
