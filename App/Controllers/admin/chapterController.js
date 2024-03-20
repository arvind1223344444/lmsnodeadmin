const express = require('express');
const app = express.Router();
const loginModel = require(__dirname+'/../../Models/admin_login');
const courseModel = require(__dirname+'/../../Models/course');
const levelModel = require(__dirname+'/../../Models/level');
const videosModel = require(__dirname+'/../../Models/videos_chapter');
const chapterModel = require(__dirname+'/../../Models/chapter');
const playListModel = require(__dirname+'/../../Models/playList');
const rolePermission = require(__dirname+'/../../middleware/PermissionCheck'); //middleware for session check
const multer = require('multer');
const upload = multer();
const imageUpload = require(__dirname+'/../../middleware/uploadImage');
const { populate } = require(__dirname+'/../../Models/admin_login');
const inArray = require('in-array'); 

app.get('/addchapter',rolePermission('addChapter'), async (req,res)=>{
  
   const course = await courseModel.find({status:1});
   const lavel = await levelModel.find();

   res.render('admin/chapter/add_chapter',{course:course,lavel:lavel,inArray:inArray});
})


app.post('/addchapter',rolePermission('addChapter'),imageUpload.any(), async (req, res) => {

      const { course_id ,level_id ,desc, playlist ,startDate,endDate ,play_List_discription, mode_playlist} = req.body;
      const { chapter_name, chapterDscription, mode, lesstionStartDate,lessionEndDate ,url } = req.body;
      const arrayLength = chapter_name.length;
      var thambnail;
    
   for(var i=0; i < req.files.length; i++){
      if(req.files[i].fieldname == 'thumbnail'){
         thambnail = req.files[i].path.replace('public','');
      } 
   }

   const files_array = req.files;
   console.log(req.files)
   const note = files_array.filter(obj => obj.fieldname === 'notes[]');
   const thumb = files_array.filter(obj => obj.fieldname === 'lessionThumbnail[]');
   const videos = files_array.filter(obj => obj.fieldname === 'lession_video[]')
   console.log(thumb)
   const thumbPath = thumb.length > 0 ? thumb[0].path.replace('public', '') : ''; // Access path of the first element in thumb array
   const play = await playListModel({
      user_id:req.session.user._id,
      course_id:course_id,
      level_id:level_id,
      play_List_discription:play_List_discription,
      playlist:playlist,
      desc:desc,
      thumbnail:thambnail,
      mode_playlist:mode_playlist,
      startDate:startDate,
      endDate:endDate
   }).save();



   for (let i = 0; i < arrayLength; i++) {
      const name = chapter_name[i];
      const description = chapterDscription[i];
      const modeValue = mode[i];
      const startDate = lesstionStartDate[i];
      const endDate = lessionEndDate[i];
      const urlValue = url[i];
      const thumbPath = thumb.length > 0 ? thumb[i].path.replace('public', '') : ''; 
      try {
          const chapterData = {
             playlist_id: play._id,
              chapter_name: name,
              chapterDscription: description,
              mode: modeValue,
              lesstionStartDate: startDate,
              lessionEndDate: endDate,
              lessionThumbnail : thumbPath,
              url: urlValue
          };
  
          const chapter_insert = await chapterModel(chapterData).save();
          console.log("Chapter inserted successfully:", chapter_insert);
      } catch (error) {
          console.error("Error inserting chapter:", error);
      }
  }






   //      const chapterData = {
   //       playlist_id: play._id,
   //       chapter_name: chapter_name,
   //       chapterDscription: chapterDscription,
   //       mode: mode,
   //       url: url,
   //       lessionThumbnail : thumbPath,
   //       lesstionStartDate: lesstionStartDate,
   //       lessionEndDate: lessionEndDate,
   //    };


   // //   console.log(chapterData);

      
   //    // if (thumb) { // If a thumbnail image is provided, insert it
   //    //    chapterData.lessionThumbnail = thumb.path;
   //    // }
   //    const chapter_insert = await chapterModel(chapterData).save();

      if(mode === 'upload'){
      await videosModel({
         chapter_id:chapter_insert._id,
         lession_video: typeof videos !== 'undefined' &&  videos !== null ? videos.path : '',
      }).save();
   }

res.redirect('/chapter/show_chapter');

})     

app.get('/show_chapter',rolePermission('viewChapter'), async(req,res) =>{
   var playlist;
    if(req.session.user.roles_id.roles === 'admin'){
      playlist = await playListModel.find().sort('-_id').populate('user_id').populate('course_id').populate('level_id').populate({ path:'chapters',populate: {path: 'videos'}}).exec();
    }else{
       playlist = await playListModel.find({user_id: req.session.user._id}).sort('-_id').populate('user_id').populate('course_id').populate('level_id').populate({ path:'chapters',populate: {path: 'videos'}}).exec();
     }
   res.render('admin/chapter/show_chapter',{playlist:playlist,inArray:inArray}); 
})


app.get('/delete_chapter/:id',rolePermission('deleteChapter'),async (req,res)=>{
   
   const {id} = req.params;
   const data = await playListModel.deleteOne({_id:id});
   res.redirect('/chapter/show_chapter');
})

app.get('/status_chapter/:id/:status',rolePermission('statusChapter'),async (req,res)=>{
   const id = req.params.id;
   const status = req.params.status;
   await playListModel.updateOne({_id:id},{status:status});
   res.redirect('/chapter/show_chapter');
})


app.get('/show_videos_list/:id',async(req,res)=>{
  const {id} = req.params;
  const chapter = await chapterModel.find({playlist_id:id}).populate('videos')
  res.render('admin/chapter/show_chapter_videos',{chapter_videos:chapter,path_:id,inArray:inArray})
})

app.get('/delete_videos_chapter/:id/:path', async(req,res)=>{
   const {id,path} = req.params;
   await chapterModel.deleteOne({_id:id})
      const data = await videosModel.findOne({chapter_id:id})
   if(data){
      await videosModel.deleteOne({chapter_id:id})
   }
      res.redirect('/chapter/show_videos_list/'+path);
}),

app.get('/edit_chapter/:id',rolePermission('editChapter'),async (req,res)=>{
   const {id} = req.params;
   const course = await courseModel.find();
   const lavel = await levelModel.find();
   const playlist = await playListModel.findOne({_id:id}).populate('user_id').populate('course_id').populate('level_id').populate({ path:'chapters',populate: {path: 'videos'}}).exec();
   console.log(playlist)
   res.render('admin/chapter/edit_chapter',{playlist:playlist,course:course,lavel:lavel,inArray:inArray})
})



////////////////////////////////////////////////////////////////////////////////////////////////

//const multer = require('multer');
///const upload = multer(); // Initialize multer

// Assuming you have your route set up like this
app.post('/edit_chapter_submit/', multer().none(), async (req, res) => {
    try {
        // Access form fields from req.body
        const { course_id ,level_id , playlist, desc ,startDate,endDate,chapter_id,mode_playlist,playListId } = req.body;
        const { chapter_name, chapterDscription, mode, lesstionStartDate,lessionEndDate ,url } = req.body;
        const { achapter_name, achapterDscription, amode, alesstionStartDate,alessionEndDate ,aurl } = req.body;

        var arsrayLength = achapter_name?.length;
        if(arsrayLength){

        }else{
         arsrayLength=0;
        }
if(arsrayLength > 0)
{
for (let i = 0; i < arsrayLength; i++) {




const localstrtt_date = req.body.alesstionStartDate[i];


 // Create a Date object from the local date and time string
 const localedsfatDateTime = new Date(localstrtt_date);
       
 // Extract individual date and time components
 const strtnyear = localedsfatDateTime.getFullYear();
 const srtrnmonth = ('0' + (localedsfatDateTime.getMonth() + 1)).slice(-2);
 const strtsnday = ('0' + localedsfatDateTime.getDate()).slice(-2);
 const strtsnhours = ('0' + localedsfatDateTime.getHours()).slice(-2);
 const srtrsnminutes = ('0' + localedsfatDateTime.getMinutes()).slice(-2);
 const strtsnseconds = ('0' + localedsfatDateTime.getSeconds()).slice(-2);
 
 // Formatted date and time string in the desired format
 const formatstartDateTime = `${strtnyear}-${srtrnmonth}-${strtsnday}T${strtsnhours}:${srtrsnminutes}:${strtsnseconds}.000Z`;
//new code end

//new code start

const localenddateTime= req.body.alessionEndDate[i];

 // Create a Date object from the local date and time string
 const localedndDateTime = new Date(localenddateTime);
       
 // Extract individual date and time components
 const enyear = localedndDateTime.getFullYear();
 const enmonth = ('0' + (localedndDateTime.getMonth() + 1)).slice(-2);
 const enday = ('0' + localedndDateTime.getDate()).slice(-2);
 const enhours = ('0' + localedndDateTime.getHours()).slice(-2);
 const enminutes = ('0' + localedndDateTime.getMinutes()).slice(-2);
 const enseconds = ('0' + localedndDateTime.getSeconds()).slice(-2);
 
 // Formatted date and time string in the desired format
 const formatstedenDateTime = `${enyear}-${enmonth}-${enday}T${enhours}:${enminutes}:${enseconds}.000Z`;
//new code end





         const name = achapter_name[i];
         const description = achapterDscription[i];
         const modeValue = amode[i];
         const startDate = formatstartDateTime;
         const endDate = formatstedenDateTime;
         const urlValue = aurl[i];
        
         try {
             const chapterData = {
                playlist_id: playListId,
                 chapter_name: name,
                 chapterDscription: description,
                 mode: modeValue,
                 lesstionStartDate: startDate,
                 lessionEndDate: endDate,
                 url: urlValue
             };
     
             const chapter_insert = await chapterModel(chapterData).save();
             console.log("Chapter inserted successfully:", chapter_insert);
         } catch (error) {
             console.error("Error inserting chapter:", error);
         }
     }
   }


//console.log(achapter_name.length);


       //console.log(playListId);
       
       //const statDate = new Date(req.body.startDate);


       const localDateTimeString = req.body.startDate;


const localenddateTime= req.body.endDate;

 // Create a Date object from the local date and time string
 const localedndDateTime = new Date(localenddateTime);
       
 // Extract individual date and time components
 const enyear = localedndDateTime.getFullYear();
 const enmonth = ('0' + (localedndDateTime.getMonth() + 1)).slice(-2);
 const enday = ('0' + localedndDateTime.getDate()).slice(-2);
 const enhours = ('0' + localedndDateTime.getHours()).slice(-2);
 const enminutes = ('0' + localedndDateTime.getMinutes()).slice(-2);
 const enseconds = ('0' + localedndDateTime.getSeconds()).slice(-2);
 
 // Formatted date and time string in the desired format
 const formattedenDateTime = `${enyear}-${enmonth}-${enday}T${enhours}:${enminutes}:${enseconds}.000Z`;



       // Create a Date object from the local date and time string
       const localDateTime = new Date(localDateTimeString);
       
       // Extract individual date and time components
       const year = localDateTime.getFullYear();
       const month = ('0' + (localDateTime.getMonth() + 1)).slice(-2);
       const day = ('0' + localDateTime.getDate()).slice(-2);
       const hours = ('0' + localDateTime.getHours()).slice(-2);
       const minutes = ('0' + localDateTime.getMinutes()).slice(-2);
       const seconds = ('0' + localDateTime.getSeconds()).slice(-2);
       
       // Formatted date and time string in the desired format
       const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;





       
const enDate = new Date(req.body.endDate);
      var  arrayLength = chapter_name.length;
        const play = await playListModel.updateOne({_id:playListId},{
             course_id:course_id,
            level_id:level_id,
          playlist:playlist,
        startDate:formattedDateTime,
      mode_playlist:mode_playlist,
            endDate:formattedenDateTime
         });
       
         for (let i = 0; i < arrayLength; i++) {
            if (chapter_id[i]) {

               
const localendd_Date = new Date(lessionEndDate[i]);

 // Extract individual date and time components
 const endyear = localendd_Date.getFullYear();
 const endmonth = ('0' + (localendd_Date.getMonth() + 1)).slice(-2);
 const endday = ('0' + localendd_Date.getDate()).slice(-2);
 const enhdours = ('0' + localendd_Date.getHours()).slice(-2);
 const enmdinutes = ('0' + localendd_Date.getMinutes()).slice(-2);
 const ensdeconds = ('0' + localendd_Date.getSeconds()).slice(-2);
 
 // Formatted date and time string in the desired format
 const formattesendDateTime = `${endyear}-${endmonth}-${endday}T${enhdours}:${enmdinutes}:${ensdeconds}.000Z`;






               const localstatDateTime = new Date(lesstionStartDate[i]);
       
 // Extract individual date and time components
 const enyear = localstatDateTime.getFullYear();
 const enmonth = ('0' + (localstatDateTime.getMonth() + 1)).slice(-2);
 const enday = ('0' + localstatDateTime.getDate()).slice(-2);
 const enhours = ('0' + localstatDateTime.getHours()).slice(-2);
 const enminutes = ('0' + localstatDateTime.getMinutes()).slice(-2);
 const enseconds = ('0' + localstatDateTime.getSeconds()).slice(-2);
 
 // Formatted date and time string in the desired format
 const formattestartrsDateTime = `${enyear}-${enmonth}-${enday}T${enhours}:${enminutes}:${enseconds}.000Z`;










                const chapter_insert = await chapterModel.updateOne({ _id: chapter_id[i] }, {
                    playlist_id: play._id,
                    chapter_name: chapter_name[i],
                    chapterDscription: chapterDscription[i],
                    mode: mode[i],
                    url: url[i],
                    lesstionStartDate: formattestartrsDateTime,
                    lessionEndDate: formattesendDateTime
                });
        
                if (mode[i] === 'upload') {
                    await videosModel({
                        chapter_id: chapter_id[i],
                        lession_video: typeof videos[i] !== 'undefined' && videos[i] !== null ? videos[i].path : '',
                    }).save();
                }
            }
        }
        
        // Log the playlist
       // console.log('Playlist:', chapter_name.length);

        // Now you can do whatever you want with the playlist data

        // Send response if needed
       //res.send('Form submitted successfully');
       res.send(`
       <script>
           alert('Form submitted successfully');
           window.location="/chapter/show_chapter";
       </script>
   `);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

// app.post('/edit_chapter_submit',rolePermission('addChapter'), async(req,res)=>{
//    // const id = req.params.id;
//     const { course_id ,level_id , playlist, desc ,startDate,endDate,chapter_id,mode_playlist,playListId } = req.body;
//     const { chapter_name, chapterDscription, mode, lesstionStartDate,lessionEndDate ,url } = req.body;
//     var thambnail;
//     //const chapter_names = req.body['chapter_name[]'];

//    console.log(playlist);
//     //const arrayLength = chapter_name.length;
// //   if(req.files && req.files.length> 0)
// //   {
// //  for(var i=0; i < req.files.length; i++){
// //     if(req.files[i].fieldname == 'thumbnail'){
// //        thambnail = req.files[i].path;
// //     } 
// //  }
// //   }

//  //const files_array = req.files;

//  //console.log(files_array);
// //  const note = files_array.filter(obj => obj.fieldname === 'notes[]');
// //  const thumb = files_array.filter(obj => obj.fieldname === 'lessionThumbnail[]');
// //  const videos = files_array.filter(obj => obj.fieldname === 'lession_video[]')
 

// //  const play = await playListModel.updateOne({_id:playListId},{
// //     course_id:course_id,
// //     level_id:level_id,
// //     playlist:playlist,

// //     startDate:startDate,
// //     mode_playlist:mode_playlist,
// //     endDate:endDate
// //  });
// //  for (let i=0; i < arrayLength; i++){
// //  if(chapter_id[i]){ 
// //  const chapter_insert = await chapterModel({ _id:chapter_id[i] },{
// //        playlist_id:play._id,
// //        chapter_name:chapter_name[i],
// //        chapterDscription:chapterDscription[i],
// //        mode:mode[i],
// //        url:url[i],
       
// //        lesstionStartDate:lesstionStartDate[i],
// //        lessionEndDate:lessionEndDate[i]
// //     })


// //     if(mode[i] === 'upload'){
// //       await videosModel({
// //          chapter_id:chapter_insert._id,
// //          lession_video: typeof videos[i] !== 'undefined' &&  videos[i] !== null ? videos[i].path : '',
// //       }).save();
// //     }
   

// //    }

 
// // }

// })

app.post('/inserted', rolePermission('editChapter'), imageUpload.fields([{ name: 'lessionThumbnail', maxCount: 1 }, { name: 'notes', maxCount: 1 }]), async (req, res) => {
   console.log(req.body);

   const { chapter_name, playlist_id, chapterDscription, mode, lesstionStartDate, lessionEndDate, url } = req.body;

   const chapterData = {
      playlist_id: playlist_id,
      chapter_name: chapter_name,
      chapterDscription: chapterDscription,
      mode: mode,
      url: url,
      lessionThumbnail: req.files.lessionThumbnail ? req.files.lessionThumbnail[0].path : '',
      notes: req.files.notes ? req.files.notes[0].path : '',
      lesstionStartDate: lesstionStartDate,
      lessionEndDate: lessionEndDate,  
   };

   const chapter_insert = await chapterModel(chapterData).save();

   res.redirect('/chapter/edit_chapter/' + playlist_id);
});


app.get('/delete_chapter/:id/:playlist_id', async (req, res) => {
   const { id, playlist_id } = req.params;
 
   try {
     const deletedChapter = await chapterModel.findByIdAndDelete(id);
 
     if (!deletedChapter) {
       // Handle the case where the chapter is not found
       res.status(404).send('Chapter not found');
     } else {
       // Redirect to the edit page for the associated playlist
       res.redirect(`/chapter/edit_chapter/${playlist_id}`);
     }
   } catch (error) {
     // Handle errors, such as database errors
     console.error(error);
     res.status(500).send('Internal Server Error');
   }
 });
 

module.exports=app;

 