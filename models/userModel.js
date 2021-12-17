const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        require: true
    },
    nohp: {
        type: String,
        require: true
    },
    pass: {
        type: String,
        require: true
    },
    role: {
        type: String,
        require: true
    },
    address: {
        type: String,
        require: true
    },
    id_job: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'Job'
    }
},
{
    versionKey: false
});

module.exports = mongoose.model('tb_user', userSchema)