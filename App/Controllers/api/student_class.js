const express = require('express');
const app = express.Router();
const student_present = require(__dirname+'/../../Models/student_present');
var multer = require("multer");
const chapter_view =  require(__dirname+'./../../Models/chapter');
const assignment =  require(__dirname+'./../../Models/assignment');
const student = require(__dirname+'./../../Models/StudentModel');
const assign = require(__dirname+'./../../Models/assignment_assign');
const work = require(__dirname+'/../../Models/assign_work_done_status');
 app.get('/student_class_attendence/:user_id/:chapter_id',multer().none(),async(req,res)=>{
    
    const { user_id, chapter_id} =  req.params;
    const check  = await student_present.findOne({ student_id:user_id,chapter_id:chapter_id})
    if(!check){
    student_present.create({
        student_id:user_id,
        chapter_id:chapter_id,
    }).then((data)=>{
          console.log('data insered')
          res.status(200).send({response:'inserted'})
    }).catch((err)=>{
        console.log(err);
        res.send(err)
    })
   }
 })

 app.get('/get_every_stundet_homework/:id', multer().none(), async (req, res) => {
    const { id } = req.params;

    try {
        const student1 = await assign.find({ student_id: id })
            .populate({
                path: 'assignment_id',
                match: { type: 'home_work' },
                populate: [
                    { path: 'chapter_id' },
                    { path: 'get_assignment_status' }
                ]
            });

        const data = student1.map(doc => doc.toObject());
        res.status(200).send({ response: data });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});


app.get('/get_every_stundet_classwork/:id',multer().none(),async(req,res)=>{
    const { id } = req.params;
    // const student1 = await student.findOne({_id:id}).populate({path: 'assign_course', populate:{ path: 'chapters', populate:{ path:'assignment', match:{ type:'home_work' } } }});

    const student1= await assign.find({ student_id: id}).populate({ path:'assignment_id', match:{type:'class_work'}, populate:[{path:'chapter_id'}, {path:'get_assignment_status'} ] });
    const data = student1.map(doc => doc.toObject());
    res.status(200).send({response: data});
})
app.get('/get_every_stundet_classwork_oral/:id',multer().none(),async(req,res)=>{
    const { id } = req.params;
    // const student1 = await student.findOne({_id:id}).populate({path: 'assign_course', populate:{ path: 'chapters', populate:{ path:'assignment', match:{ type:'home_work' } } }});

    const student1= await assign.find({ student_id: id}).populate({ path:'assignment_id', match:{type:'class_work_oral'}, populate:[{path:'chapter_id'}, {path:'get_assignment_status'} ] });
    const data = student1.map(doc => doc.toObject());
    res.status(200).send({response: data});
})






app.get('/get_every_stundet_orlas/:id',multer().none(),async(req,res)=>{
    const { id } = req.params;
    // const student1 = await student.findOne({_id:id}).populate({path: 'assign_course', populate:{ path: 'chapters', populate:{ path:'assignment', match:{ type:'home_work' } } }});

    const student1= await assign.find({ student_id: id}).populate({ path:'assignment_id', match:{type:'orlas'}, populate:[{path:'chapter_id'}, {path:'get_assignment_status'} ] });
    const data = student1.map(doc => doc.toObject());
    res.status(200).send({response: data});
})



module.exports=app;

//