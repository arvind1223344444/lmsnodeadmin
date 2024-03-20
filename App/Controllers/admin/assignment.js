const express = require('express');
const app = express.Router();
const assignmentModel = require(__dirname+'/../../Models/assignment');
const assign_question_Model = require(__dirname+'/../../Models/assignment_question');

const assign_assignment = require(__dirname+'/../../Models/assignment_assign');
const student_model = require(__dirname+'/../../Models/StudentModel');
const playModel = require(__dirname+'/../../Models/chapter');
const inArray = require('in-array'); 
const multer = require('multer');
const imgUploadImddleware = require(__dirname+'/../../middleware/uploadImage');
const xlsx = require('xlsx');
 
app.get('/show_assignment',async(req,res)=>{
    assignmentModel.find().populate('chapter_id').populate('get_question').then((data)=>{
       console.log(data);
       res.render('admin/assignmnt/show_assignment',{inArray:inArray,data:data})
    }).catch((err)=>{
       res.send(err)
    })
})


app.get('/show_assign_assignment',async(req, res)=>{

try{

  const data = await  assign_assignment.find();


  for(const record2 of data)
  {
    const chapter_data = await playModel.findOne({_id:record2.chapter_id});

    if(chapter_data)
    {
      record2.chapter_name =chapter_data.chapter_name;
    }
    else
    record2.chapter_name = "Unknown";


  }
  

  for(const record of data)
  {
const student = await student_model.findOne({_id:record.student_id});
if (student) {
  record.studentName = student.name; 
  record.studentMobile=student.mobile;
  record.studentemail = student.email;
  record.student_id = student._id;

} 
else
 {
  record.studentName = 'Unknown'; // Handle case where student is not found
}
  }


  const assignmentNames = [];

  (async () => {
    const assignmentData = []; // Define an array to hold assignment data along with student_id
    for (const record of data) {
      const assignmentNamesForRecord = [];
      for (const assignmnt_id of record.assignment_id) {
        try {
          const assignmentdata = await assignmentModel.findOne({ _id: assignmnt_id });
          if (assignmentdata) {
            assignmentNamesForRecord.push(assignmentdata.name);
            console.log(assignmentdata.name);
          }
        } catch (error) {
          console.error(error);
        }
      }
      assignmentData.push({ student_id: record.student_id, assignmentNames: assignmentNamesForRecord });
    }
  
    // Log the assignmentData array
    console.log("my data ", assignmentData);
  
    // Assuming this code snippet is outside the IIFE, you can use assignmentData here
    res.render('admin/assignmnt/show_assign_assignment', { data: data, data1: assignmentData, inArray: inArray });
  })();
  
  
}
catch(error){

  
}

})

app.get('/create',async(req,res)=>{
    const data = await playModel.find({});
    res.render('admin/assignmnt/create_assignment',{inArray:inArray,data:data});
})


app.post('/add_assignment', imgUploadImddleware.single('excelsheet'), async (req, res) => {
    const { title, playlist_id, type } = req.body;
  
    const newAssignment = new assignmentModel({
      name: title,
      type: type,
      chapter_id: playlist_id,
    });
  
    newAssignment.save()
      .then((assignment) => {
        const excelFile = `${__dirname}/../../../${req.file.path}`; // Replace with the path to your Excel file
  
        try {
          console.log(req.file)
          const workbook = xlsx.readFile(excelFile);
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
  
          const data = xlsx.utils.sheet_to_json(sheet);
  
          for (const row of data) {
            const questions = [];
  
            // Iterate through columns like Q1, Q2, Q3, etc.
            for (let i = 1; ; i++) {
              const questionKey = `Q${i}`;
              if (row[questionKey] === null || row[questionKey] === undefined) {
                break; // Exit the loop if a null or undefined value is encountered.
              }
  
              questions.push(row[questionKey]);
            }
  
            const { Answer, Marks, Negative, Position } = row;
  
            const newAssignQuestion = new assign_question_Model({
              assignment_id: assignment._id,
              answer: Answer,
              second_answer: row["Second Answer"], // Access "Second Answer" using square brackets
              marks: Marks,
              negative: Negative,
              position: Position,
              question: questions.join(', '), // Combine all non-null questions with ","
            });
  
            newAssignQuestion.save(); // Save the assignment question.
          }
  
          res.redirect('/assignments/show_assignment');
        } catch (error) {
          res.status(500).send('Error inserting data: ' + error.message);
        }
      })
      .catch((error) => {
        res.status(500).send('Error creating assignment: ' + error.message);
      });
  });
  
  app.get('/delete_assignment/:id',async(req,res)=>{

    const id = req.params.id;
    await assignmentModel.deleteOne({_id:id});
    await assign_question_Model.deleteMany({assignment_id:id})
    res.redirect('/assignments/show_assignment');

});


app.get('/view_assignment/:id', async(req,res)=>{
  const {id}=req.params;
  const question = await assign_question_Model.find({assignment_id:id}).populate('assignment_id');
  console.log(question);
  res.render('admin/assignmnt/show_question',{question:question,inArray:inArray})
})


app.get('/edit_assignment/:id',async(req,res)=>{
  let id=req.params.id;
  const data = await playModel.find();
   const assign = await assignmentModel.findOne({_id:id});
   res.render('admin/assignmnt/edit_questions',{assign:assign,inArray:inArray,data:data})
})

app.post('/edit_assignment',multer().none(), async (req, res) => {
  const { title, playlist_id, type, assign_id } = req.body;

  console.log(req.body);
  
  try {
    const data_update = await assignmentModel.updateOne(
      { _id: assign_id },
      {
        name: title,
        type: type,
        chapter_id: playlist_id
      }
    ); 
    res.redirect('/assignments/show_assignment');
     } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
    }
});  
                                               

module.exports= app;