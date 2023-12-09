var express = require('express');
const app = express();
const ejs = require('ejs');
app.set('view engine', 'ejs');
const path = require('path');
const cors = require('cors')
require('dotenv').config();
const port = process.env.PORT;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const nocache = require('nocache');
app.use(nocache());

const session = require('express-session');
const flash = require('connect-flash');
app.use(cors())
app.use(cookieParser());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 3600000 } // Set cookie options here
}));
app.use(flash());

const corsOption = {
  origin: '*' // This allows requests from any origin
};
 


app.use(bodyParser.urlencoded({ extended: true }));


const localPath = path.join(__dirname,'./public/');
app.use(express.static(localPath));

const mcq = require(__dirname+'/App/Controllers/admin/Mcq');
const Index_controllers = require(__dirname+'/App/Controllers/admin/Index_controllers');
const dashboardController = require(__dirname+'/App/Controllers/admin/dashboard');
const userController = require(__dirname+'/App/Controllers/admin/userController');
const courseController = require(__dirname+'/App/Controllers/admin/courseController');
const levelCourse = require(__dirname+'/App/Controllers/admin/LevelController');
const chapterController = require(__dirname+'/App/Controllers/admin/chapterController');
const teacherController = require(__dirname+'/App/Controllers/admin/teacherController');
const taskController = require(__dirname+'/App/Controllers/admin/taskController');
const contactController = require(__dirname+'/App/Controllers/admin/contact');
const studentController = require(__dirname+'/App/Controllers/admin/studentController');
const attendance = require(__dirname+'/App/Controllers/admin/attendance.js');
const adminSessionAuth = require(__dirname+'/App/middleware/adminAuthCheck'); //middleware for session check
const todoController = require(__dirname+'/App/Controllers/admin/TodoController')
const PaymentPlan = require(__dirname+'/App/Controllers/admin/PaymentPlan')
const helper = require(__dirname+'/App/Helper/HelperClass'); //helper class
const assign = require(__dirname+'/App/Controllers/admin/assignment.js');

app.use(helper);



// Api
const inqueryController = require(__dirname+'/App/Controllers/api/Inquery');
const Register = require(__dirname+'/App/Controllers/api/register')
const course = require(__dirname+'/App/Controllers/api/chapter')
const profile = require(__dirname+'/App/Controllers/api/profile')
const teacher = require(__dirname+'/App/Controllers/api/teacher')
const mcq_api = require(__dirname+'/App/Controllers/api/mcq')
const payment_page = require(__dirname+'/App/Controllers/api/payment_page')
const LiveVideos = require(__dirname+'/App/Controllers/api/livevideos')
const techerLogin = require(__dirname+'/App/Controllers/api/teacherLogin')
const assignment_api = require(__dirname+'/App/Controllers/api/assignment')
const student_class = require(__dirname+'/App/Controllers/api/student_class')

const t = require(__dirname+'/App/Controllers/api/test')
app.use('/tt',t);

app.use('/inquery',inqueryController);
app.use('/api/register',Register);
app.use('/api/course',course)
app.use('/api/profile',profile)
app.use('/api/teacher',teacher)
app.use('/api/mcq',mcq_api)
app.use('/api/payment_page',payment_page)
app.use('/api/live',LiveVideos)
app.use('/api/teacher_auth_login',techerLogin)
app.use('/api/assignment',assignment_api)
app.use('/api/student',student_class)
// Api

app.get('/',(req,res)=>{
  res.send('working1 fine');     
})

app.use('/admin', Index_controllers);
app.use('/dashboard',adminSessionAuth,dashboardController);
app.use('/users',adminSessionAuth,userController);
app.use('/course',adminSessionAuth,courseController);
app.use('/level',adminSessionAuth,levelCourse);
app.use('/chapter',adminSessionAuth,chapterController);
app.use('/teacher',adminSessionAuth,teacherController);
app.use('/contact',adminSessionAuth,contactController);
app.use('/student',adminSessionAuth,studentController);
app.use('/task',adminSessionAuth,taskController);
app.use('/todo',adminSessionAuth,todoController);
app.use('/attendance',adminSessionAuth,attendance)
app.use('/payment',PaymentPlan);
app.use('/mcq',adminSessionAuth,mcq)
app.use('/assignments',adminSessionAuth,assign)


app.listen(3000);   

//how i can belevied that things which we dont love scr developer