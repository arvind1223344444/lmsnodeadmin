const database = require(__dirname + '/../../config/Database');

const OralassignSchema = new database.Schema({
  student_id: {
    type: database.SchemaTypes.ObjectId,
    ref: 'studentModel',
    required: [true, 'student_id field is required'],
  },
  assignment_id: {
    type: [database.SchemaTypes.ObjectId],
    ref: 'assignment',
    required: [true, 'assignment_id field is required'],
  },

  chapter_id:{
    type: database.SchemaTypes.ObjectId,
    ref: 'chapter',
    required: [true, 'chapter field is required'],
  },
  added_on: {
    type: Date,
    default: Date.now(),
  },
});
//   this  is our personal mail oyeh
//   are searching altenative 
//   AssignmentAssignSchema.virtual('get_question',{
//   ref: 'assignment_question',
//   localField: '_id',
//   foreignField:'assignment_id',
//   justOne: false,
// });

// AssignmentAssignSchema.set('toObject', { virtuals: true });

const OralAssignModel = database.model('oral_assign', OralassignSchema);

module.exports = OralAssignModel;
