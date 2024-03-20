const { populate } = require('dotenv');
const express = require('express');
const app = express.Router();
const teacherModel =  require(__dirname+'./../../Models/TeacherModel');
const playModel =  require(__dirname+'./../../Models/playList');
const chapter_view =  require(__dirname+'./../../Models/chapter');
const Agoramodel = require(__dirname+'./../../Models/AgoraModel');

const student_attendance = require(__dirname+'./../../Models/student_attendance');


const assignmentModel = require(__dirname+'/../../Models/assignment');
const assign_question_Model = require(__dirname+'/../../Models/assignment_question');
const assign_task = require(__dirname+'/../../Models/assignment_assign');
const payment_done = require(__dirname+'/../../Models/payment_done');




const assign_answer = require(__dirname+'/../../Models/assignment_answer');
const student_present = require(__dirname+'/../../Models/student_present');
const student = require(__dirname+'/../../Models/StudentModel');

const multer = require('multer');
 
app.post('/login', multer().none() , async (req, res) => {
    try {
      const { email, password } = req.body;
      var name = name;
      const user = await teacherModel.findOne({ email: email, password: password });
    if (user) {
        res.status(200).json({ response: user });
    } else {
        res.status(404).json({ response: 'User Details do not exist' , status:true });
    }
    } catch (err) {
      res.status(500).json({ response: 'Internal Server Error' });
    }
 });


 app.post('/add_agora', multer().none(), async (req, res) => {
  try {
    const { class_id, teacher_id, app_id, secret_key, agora_class_name } = req.body;

    // Check if the entry already exists
    const existingAgora = await Agoramodel.findOne({
      class_id: class_id
    });

    if (existingAgora) {
      
      const updatedAgora = await Agoramodel.findOneAndUpdate(
        { class_id: class_id },
        {
          teacher_id: teacher_id,
          app_id: app_id,
          secret_key: secret_key,
          agora_class_name: agora_class_name
        },
        { new: true }
      );
  
      if (updatedAgora) {
        res.status(200).json({ response: 'Agora updated successfully', updatedAgora });
      } 
      
      
      
      // If the entry already exists, send a response
    //  res.status(200).json({ response: 'This entry already exists' });
    } else {






      // If the entry does not exist, create a new one
      const add_agora = await Agoramodel.create({
        class_id: class_id,
        teacher_id: teacher_id,
        app_id: app_id,
        secret_key: secret_key,
        agora_class_name: agora_class_name
      });
      
      if (add_agora) {
        res.status(200).json({ response: 'Agora created successfully' });
      } else {
        res.status(500).json({ response: 'Error' });
      }
    }
  } catch (err) {
    res.status(500).json({ response: 'Internal Server Error' });
  }
});



app.get('/get_agora_details/:class_id', async(req , res)=>{

  const { class_id} = req.params;

  Agoramodel.findOne({ class_id: class_id }).then((data)=>{
    const response =  data.toObject();
   res.status(200).json({ response: response })
   }).catch((err)=>{
   console.log(err.message)
   })

})


app.get('/get_agora_details_update_fetch/:id', async(req , res)=>{

  const { id} = req.params;

  Agoramodel.findOne({ _id:id }).then((data)=>{
    const response =  data.toObject();
   res.status(200).json({ response: response })
   }).catch((err)=>{
   console.log(err.message)
   })

})



app.post('/agora_update', multer().none(), async (req, res) => {
  try {
    const { class_id, teacher_id, app_id, secret_key, agora_class_name } = req.body;

    // Find and update one document based on class_id
    const updatedAgora = await Agoramodel.findOneAndUpdate(
      { class_id: class_id },
      {
        teacher_id: teacher_id,
        app_id: app_id,
        secret_key: secret_key,
        agora_class_name: agora_class_name
      },
      { new: true }
    );

    if (updatedAgora) {
      res.status(200).json({ response: 'Agora updated successfully', updatedAgora });
    } else {
      res.status(404).json({ response: 'No Agora found with the provided class_id' });
    }
  } catch (err) {
    res.status(500).json({ response: 'Internal Server Error' });
  }
});

























 app.get('/get_teacher_details/:teacher_id' ,async(req,res)=>{
     const { teacher_id } = req.params; 
     console.log(teacher_id)
     teacherModel.findOne({ _id: teacher_id }).populate('assign_course').then((data)=>{
      const response =  data.toObject();
     res.status(200).json({ response: response })
     }).catch((err)=>{
     console.log(err.message)
     })
 })

 app.get('/get_teacher_chapter/:id', multer().none(), async(req,res)=>{
  const { id } = req.params; 
  console.log(id)
  playModel.findOne({ _id: id }).populate('chapters').then((data)=>{
   const response =  data.toObject();
  res.status(200).json({ response: response })
  }).catch((err)=>{
  console.log(err.message)
  })
})

app.get('/course_enroll_student/:teacher_id', multer().none(), async(req,res)=>{
  const { teacher_id } = req.params; 
  teacherModel.findOne({ _id: teacher_id }).populate({path:'assign_course' ,populate:{path:'student'}}).then((data)=>{
   const response =  data.toObject();
   console.log(response)
  res.status(200).json({ response: response })
  }).catch((err)=>{
  console.log(err.message)
  })
})


app.get('/teacher_class_notification/:teacher_id', multer().none(), async (req, res) => {
  const { teacher_id } = req.params; 
  try {
    const teacherData = await teacherModel.findOne({ _id: teacher_id }).populate({ path: 'assign_course' });
    const response = teacherData.toObject();
    const total_assign_courses = response.assign_course;

    for (const course of total_assign_courses) {
      const course_id = course._id;
      const chapterData = await chapter_view.find({ playlist_id: course_id });
      
      const chapterNames = chapterData.map(chapter => chapter); // Extracting chapter names
      
      course.chapter_names = chapterNames; // Adding chapter names to the course object
    }

    res.status(200).json({ response: response });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: err.message });
  }
});

 // Added the closing bracket for the route definition


app.get('/teacher_assign_courses/:teacher_id', multer().none(), async(req,res)=>{
  const { teacher_id } = req.params; 
  teacherModel.findOne({ _id: teacher_id }).populate({path:'assign_course' ,populate:{path:'student'}}).then((data)=>{
   const response =  data.toObject();
   console.log(response)
  res.status(200).json({ response: response })
  }).catch((err)=>{
  console.log(err.message)
  })
})





app.get('/student_enroll_list/:course_id', multer().none(), async (req, res) => {
  try {
    const { course_id } = req.params;

    // Find students enrolled in the specified course
    const students = await student.find({ assign_course: course_id });

    if (students.length === 0) {
      return res.status(404).json({ error: 'No students enrolled in this course.' });
    }

    res.json({ students });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// app.get('/present_student/:chapter_id',multer().none(),async(req, res)=>{

//   try{

//     const { chapter_id }= req.params;
    
//     const presentStudent = await student_attendance.find({playlist_id:chapter_id});
//    // console.log(presentStudent.student_id);
   
//    presentStudent.forEach(async (studentdata) => {
//     // console.log(studentdata.playlist_id);
  
//     const playlist_id = studentdata.playlist_id;
   
//     try {
//       const chapter_Details = await chapter_view.findOne({ _id: playlist_id }, 'chapter_name');
//       const chapter_name = chapter_Details.chapter_name;

//       //console.log(chapter_name);
//     } catch (error) {
//       console.error("Error:", error);
//     }

  
//   });

//     res.json({presentStudent})
//   }
//   catch(error){
//     console.error("Error:", error);
//     res.status(500).json({error:"Server Error"});
//   }
// })


app.get('/present_student/:chapter_id', multer().none(), async (req, res) => {
  try {
    const { chapter_id } = req.params;
    
    let presentStudent = await student_attendance.find({ playlist_id: chapter_id });

    const chapterDetailsPromises = presentStudent.map(async (studentdata) => {
      const playlist_id = studentdata.playlist_id;
      try {
        const chapter_Details = await chapter_view.findOne({ _id: playlist_id }, 'chapter_name');
        return chapter_Details ? chapter_Details.chapter_name : null;
      } catch (error) {
        console.error("Error fetching chapter name:", error);
        return null;
      }
    });


    

    const chapterDetails = await Promise.all(chapterDetailsPromises);

    presentStudent = presentStudent.map((studentdata, index) => ({
      ...studentdata.toObject(),
      chapter_name: chapterDetails[index]
    }));

    res.json({ presentStudent });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
});










app.get('/get_chapter_details/:chapter_id', multer().none(), async(req,res)=>{
  const { chapter_id, } = req.params; 
  
  const student1 = await student_present.find({chapter_id:chapter_id});
  const studentIds = student1.map(record => record.student_id);
  chapter_view.findOne({ _id: chapter_id }).populate({path:'playlist' ,populate:{path:'student',  match: { _id: { $in: studentIds } }    }}).then((data)=>{
   const response =  data.toObject();
   console.log('chapte'+response)
  res.status(200).json({ response: response })
  }).catch((err)=>{
  console.log(err.message)
  }) 
  
})

app.get('/view_absence/:chapter_id', multer().none(), async (req, res) => {
  try {
    const { chapter_id } = req.params;

    // Extract Chapter Information
    const chapter = await chapter_view.findOne({ _id: chapter_id });

    // Find Present Students for the Chapter
    const student1 = await student_present.find({ chapter_id: chapter_id });
    const studentIds = student1.map(record => record.student_id);

    // Find Absent Students for the Chapter
    const data = await student.find({ _id: { $nin: studentIds }, assign_course: chapter.playlist_id });

    // Logging and Sending the Response
    const chapterResponse = chapter ? chapter.toObject() : null;
    const absentStudentsResponse = data.map(doc => doc.toObject());

    console.log('Chapter:', chapterResponse);
    console.log('Absent Students:', absentStudentsResponse);

    res.status(200).json({
      response: absentStudentsResponse
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/view_all_assignment/:student_id/:chapter_id',multer().none(), (req,res)=>{
   const { student_id, chapter_id } = req.params;
   assign_task.find({ student_id : student_id, chapter_id:chapter_id }).populate('assignment_id').then((data)=>{
   console.log(data);
   const response = data.map((doc) => doc.toObject());
    res.status(200).send({response : response})
 }).catch((err)=>{
    res.send(err)
 }) 
})

app.get('/view_all_assignment_allquestion/:assign_id',multer().none(), (req,res)=>{
  const { assign_id } = req.params;
  assignmentModel.findOne({ _id: assign_id  }).populate({path:'get_question', populate:{path:'get_answer'}}).then((data)=>{
  console.log(data);
  const response = data.toObject();
   res.status(200).send({response : response})
}).catch((err)=>{
   res.send(err)
}) 
})

// app.get('/get_assignment_question_answer/:assignment_id/:student_id',multer().none(),(req,res)=>{
//   const { assignment_id , student_id} = req.params;
//   assign_question_Model.find({assignment_id:assignment_id}).populate({  path: 'get_answer',
//   match: { student_id: student_id }}).then((data)=>{
//       console.log(data);
//       const response = data.map((doc) => doc.toObject());
//       res.status(200).send({response : response})
//    }).catch((err)=>{
//       res.send(err)
//    }) 
// })  

app.get('/get_all_student/:chapter_id',multer().none(),(req,res)=>{

  const {chapter_id} = req.params;

  student.find({ assign_course : chapter_id }).then((data)=>{
          console.log(data);
          const response = data.map((doc) => doc.toObject());
          res.status(200).send({response : response})
       }).catch((err)=>{
          res.send(err)
       }) 
})


// app.get('/get_class_work_status_report/:student_id/:chapter_id', multer().none(), async (req, res) => {
//   try {
//     const { student_id, chapter_id } = req.params;
//     const data = await student.findOne({ _id: student_id })
//       .populate({
//         path: 'assign_course',
//         match: { _id: chapter_id },
//         populate: {
//           path: 'chapters',
//           populate: {
//             path: 'assignment',
//             match: { type: 'class_work' },
//             populate: [
//               { path: 'get_question', populate: { path: 'get_answer' } },
//               { path: 'get_assignment_status' }
//             ]
//           }
//         }
//       });

//     const response = data.toObject();
//     console.log(response);
//     res.status(200).send({ response });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send({ error: 'Internal Server Error' });
//   }
// });



// app.get('/get_home_work_status_report/:student_id/:chapter_id', multer().none(), async (req, res) => {
//   try {
//     const { student_id, chapter_id } = req.params;
//     const data = await student.findOne({ _id: student_id })
//       .populate({
//         path: 'assign_course',
//         match: { _id: chapter_id },
//         populate: {
//           path: 'chapters',
//           populate: {
//             path: 'assignment',
//             match: { type: 'home_work' },
//             populate: [
//               { path: 'get_question', populate: { path: 'get_answer' } },
//               { path: 'get_assignment_status' }
//             ]
//           }
//         }
//       });
//     const response = data.toObject();
//     console.log(response);
//     res.status(200).send({ response });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send({ error: 'Internal Server Error' });
//   }
// });

app.get('/get_playlist/:student_id', multer().none(), async (req, res) => {
   const { student_id } = req.params;  
   student.findOne({ _id: student_id }).populate('assign_course').then((data)=>{
    console.log(data);
    const response = data.toObject();
    res.status(200).send({response : response})
  }).catch((err)=>{
    res.send(err)
  }) 
  })

  app.get('/get_chapter/:playlist_id', multer().none(), async (req, res) => {
     const { playlist_id } = req.params;     
     chapter_view.find({ playlist_id: playlist_id }).then((data)=>{
     console.log(data);
     const response = data;
     res.status(200).send({response : response})
   }).catch((err)=>{
     res.send(err)
   }) 
   })





//mycode start

// app.get('/get_student_attendance/:student_id/:chapter_id?',multer().none(),async(req,res)=>{
//   const { student_id,chapter_id } = req.params;
//   let data=''
//   let response=''

//   const data34ss24 = await student_attendance.find({ playlist_id: chapter_id,student_id:student_id })
 
//    response = data34ss24.toObject();

// });


// app.get('/get_student_attendance/:student_id?/:chapter_id?', multer().none(), async (req, res) => {





// app.get('/get_payment_details/:student_id',multer().none(),async (req, res)=>{
// const {student_id} = req.params;

// try {
//   const payment_data = await  payment_done.find({student_id:student_id});
//   const response = payment_data.map(doc => doc.toObject());
// }
// catch (error) {
//   // Handle any errors that occur during the execution of the query
//   console.error(error);
//   res.status(500).json({ error: 'Internal server error' });
// }
// });



app.get('/get_payment_details/:student_id', multer().none(), async (req, res) => {
  const { student_id } = req.params;     
  try {
    const data = await payment_done.find({ user_id: student_id });
   const student_name = await student.findOne({_id:student_id});
   //console.log(student_name.name);
   std_name = student_name.name;
    // Array to store promises for fetching playlist names
    const promises = data.map(item => {
      return playModel.findOne({ _id: item.playlist_id }).then((detail) => {
        if (detail) {
          return detail.playlist;
        }
        return null;
      });
    });

    // Wait for all promises to resolve
    const playlistNames = await Promise.all(promises);

    // Combine data with playlist names
    const response = data.map((item, index) => {
      return {
        ...item.toJSON(),
        playlist_name: playlistNames[index],
        student_name :std_name
      };
    });

    // Send the response
    res.status(200).send({ response: response });
  } catch (err) {
    res.status(500).send(err);
  }
});


app.get('/get_chapter_name/:chapter_id', multer().none(), async (req, res) => {
  const { chapter_id } = req.params;     
  chapter_view.findOne({ _id: chapter_id },'chapter_name').then((data)=>{
  console.log(data);
  const response = data;
  res.status(200).send({response : response})
}).catch((err)=>{
  res.send(err)
}) 
});


app.get('/get_course_name/:course_id',multer().none(),async(req, res)=>{
const {course_id} = req.params;
playModel.findOne({_id: course_id} , "playlist").then((data)=>{
  console.log(data);
  const response = data;
  res.status(200).send({response : response})
}).catch((err)=>{
  res.send(err)
}) 

})






app.get('/student_attendance_for_profile/:student_id', multer().none(), async (req, res) => {
  const {student_id} = req.params;

  try {
    // Use find() to get all matching documents



      const student_name = await  student.findOne({ _id: student_id }, 'name');    
      
      const data34ss24 = await student_attendance.find({ student_id:student_id});
      

     // console.log();
    // Check if data34ss24 is not empty
    if (data34ss24.length > 0) {
      // Convert the array of documents to plain JavaScript objects
      const response = data34ss24.map(doc => doc.toObject());
      //const playlistIds = response.map(item => item.playlist_id);

      const playlistIds = response.map(item => item.playlist_id);
  

      const playlistsIds = await playModel.find({ _id: playlistIds }, 'playlist_id');
      
      const playlists = await chapter_view.find({ _id: playlistIds }, 'chapter_name');
      async function processData(response) {
        for (const item of response) {
            const playlyst_id = item.playlist_id;
            const course_iid = item.course_id
   // console.log(item.course_id);
            try {

              const cour_name = await  playModel.findOne({_id: course_iid}, 'playlist');
                const playname = await chapter_view.findOne({_id: playlyst_id}, 'chapter_name');
                console.log(playname);
                item.student_name = student_name.name;
                item.chapter_name = playname ? playname.chapter_name : null;

                item.playlist_name = cour_name ? cour_name.playlist :null ;
                // Handle any further processing here
            } catch (error) {
                console.error(error);
                // Handle error if necessary
            }
        }
    
        // After processing all items in response, you can send the response
        res.json(response);
    }
    
    processData(response);
    
    } 
    else
     {
      // Handle case where no documents are found
      res.status(404).json({ error: 'No data found for the provided parameters' });
    }

  
  
  } catch (error) {
    // Handle any errors that occur during the execution of the query
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});






  app.get('/get_student_attendance/:student_id/:course_id', multer().none(), async (req, res) => {
  const { course_id,student_id} = req.params;

  try {
    // Use find() to get all matching documents


if(course_id!=null)
    {

      const student_name = await  student.findOne({ _id: student_id }, 'name');    
      const playlist_name = await playModel.findOne({ _id:course_id}, 'playlist')
      const data34ss24 = await student_attendance.find({ course_id: course_id , student_id:student_id});
    
    // Check if data34ss24 is not empty
    if (data34ss24.length > 0) {
      // Convert the array of documents to plain JavaScript objects
      const response = data34ss24.map(doc => doc.toObject());
      const playlistIds = response.map(item => item.playlist_id);
      const playlistsIds = await playModel.find({ _id: { $in: playlistIds } }, 'playlist_id');
      
     
      async function processData(response) {
    try {
        const processedResponse = []; // Array to store processed items

        for (const item of response) {
            const playlist_iid = item.playlist_id;
            
            try {
                const playlists = await chapter_view.find({_id: playlist_iid}, 'chapter_name');
                console.log(playlist_iid);

                // Assuming playlists is an array of chapters
                item.student_name = student_name.name;
                item.playlist_name = playlist_name.playlist;
                item.chapter_name = playlists.length > 0 ? playlists[0].chapter_name : null;

                processedResponse.push(item); // Add processed item to the array
            } catch (error) {
                console.error(error);
                // Handle error if necessary
            }
        }

        // After processing all items in response, send the processed response
        res.json(processedResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Call processData function with response as parameter
processData(response);

    //  res.json(response);
    } else {
      // Handle case where no documents are found
      res.status(404).json({ error: 'No data found for the provided parameters' });
    }
  
  }
  
  } catch (error) {
    // Handle any errors that occur during the execution of the query
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//mycode end





   app.get('/get_all_report/:student_id/:chapter_id?/:type?',multer().none(),async(req,res)=>{
    const { student_id,chapter_id,type } = req.params;
    let data=''
    let response=''
    if(student_id !=null && chapter_id !=null && type != null){
    const data3424 = await chapter_view.findOne({ _id: chapter_id })
    .populate({
      path:'get_assignment_assign',
      match:{student_id:student_id},
      populate:{
        path:'assignment_id',
        match:{type:type},
        populate: [
          { path: 'get_question', populate: { path: 'get_answer' } },
          { path: 'get_assignment_status' }
         ]
      }
    })
     response = data3424.toObject();
  }else if(student_id != null && chapter_id == null && type == null){

    const ee = await chapter_view.find()
    .populate({
      path:'get_assignment_assign',
      match:{student_id:student_id},
      populate:{
        path:'assignment_id',
 
        populate: [
          { path: 'get_question', populate: { path: 'get_answer' } },
          { path: 'get_assignment_status' }
         ]
      }
    })
    response = ee.map(doc => doc.toObject());
  }else if(student_id != null && chapter_id != null && type == null){

  const   data23 = await chapter_view.findOne({ _id: chapter_id })
    .populate({
      path:'get_assignment_assign',
      match:{student_id:student_id},
      populate:{
        path:'assignment_id',
 
        populate: [
          { path: 'get_question', populate: { path: 'get_answer' } },
          { path: 'get_assignment_status' }
         ]
      }
    })
     response = data23.toObject();
  }
      
      console.log(response);
      res.status(200).send({response : response})
   })
   module.exports = app;

