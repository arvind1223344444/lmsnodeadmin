const { Schema, Types } = require('mongoose');
const database = require(__dirname+'/../../config/Database');

const AgoraSchema = database.Schema({

    class_id: {
        type: String,
        required: true
    },
    teacher_id: {
        type: String,
        required: true
    },
    app_id: {
        type: String,
        required: true
    },
    secret_key: {
        type: String,
        required: true
    },
    agora_class_name: {
        type: String,
        required: true
    },
    date_time: {
        type: Date,
        default: Date.now,
        required: true
    }

});

const AgoraModel = database.model('AgoraModel', AgoraSchema);

module.exports = AgoraModel;