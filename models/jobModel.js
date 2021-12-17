const mongoose = require('mongoose');

const jobSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    id_job: {
        type: String,
        require: true
    },
    job_name: {
        type: String,
        require: true
    },
    salary: {
        type: Number,
        require: true
    }
},
{
    versionKey: false
});

module.exports = mongoose.model('tb_job', jobSchema)