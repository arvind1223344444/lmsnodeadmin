const mongoose =  require('mongoose');


// mongodb://localhost:27017
//my link
//mongodb+srv://arvindrawatdeveloper:epzF7Vu9CfnHQfBQ@mydatabase.fe33rty.mongodb.net/?retryWrites=true&w=majority&appName=mydatabase
// mongodb+srv://webdeveloper1:IK9ez3LQ91YwQU7F@cluster0.6qnw3vh.mongodb.net/myDatabase?retryWrites=true&w=majority'
mongoose.connect('mongodb+srv://webdeveloper1:IK9ez3LQ91YwQU7F@cluster0.6qnw3vh.mongodb.net/myDatabase?retryWrites=true&w=majority',{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(() => {
  console.log('Connected to database!');
}).catch((error) => {
    console.log('Connection failed!', error);
});

module.exports = mongoose;
 