const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    id_pegawai: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'User'
    },
    task_name: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    progress: {
        type: Number,
        default: 0.0,
        require: true
    }
},
{
    versionKey: false
});

module.exports = mongoose.model('tb_task', taskSchema)