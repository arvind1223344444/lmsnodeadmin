const mongoose =  require('mongoose');


// mongodb://localhost:27017
// mongodb+srv://webdeveloper1:IK9ez3LQ91YwQU7F@cluster0.6qnw3vh.mongodb.net/myDatabase?retryWrites=true&w=majority'
mongoose.connect('mongodb://localhost:27017/mydatabase',{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(() => {
  console.log('Connected to database!');
}).catch((error) => {
    console.log('Connection failed!', error);
});

module.exports = mongoose;
