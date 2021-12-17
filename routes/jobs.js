var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var User = require('../models/userModel');
var Job = require('../models/jobModel');
const mongoose = require('mongoose');
require("dotenv").config()

const checkAuth = (...role) => {
  return async function (req, res, next) {
      try {
          const token = req.headers.authorization.split(" ")[1];
          const decoded = jwt.verify(token, process.env.PASSWORD);
          req.userData = await User.findById(decoded._id);
          if (!role.includes(req.userData.role) && role.length) { // aksen nanya
              return res.status(401).json({
                  message: 'No access'
              });
          }
          next();
      } catch (error) {
          return res.status(401).json({
              message: 'Authentication failed'
          });
      }
  }
};





// fitur create pekerjaan
router.post('/add_job', checkAuth('admin'), async function(req, res, next) {
    const jobs = await Job.findOne({
        id_job: req.body.id_job
    })
    if(jobs) {
        res.status(403).send({
          message: 'id_job sudah ada'
        })
        return
      }
    const job = new Job({
        _id: mongoose.Types.ObjectId(),
        id_job: req.body.id_job,
        job_name: req.body.job_name,
        salary: req.body.salary
    });
    job.save()
    res.send(job)
});





// fitur update pekerjaan
router.patch('/update_job/:jobid', checkAuth('admin'), async function(req, res, next) {
    let id = await Job.findById(req.params.jobid)
    let update = {
        job_name: req.body.job_name,
        salary: req.body.salary
    }
    await Job.updateOne({_id: id}, {$set: update}, {returnOriginal: false})
    let newData = await Job.findOne({_id: id})
    res.send(newData)
})






// fitur delete pekerjaan
router.delete('/delete_job/:jobid', checkAuth('admin'),  async (req,res,next) => {
    let id = await Job.findByIdAndDelete(req.params.jobid)
    res.send(id)
  })




// fitur list pekerjaan
router.get('/list_job', checkAuth('admin'),  async (req,res,next) => {
    let id = await Job.find(req.params.jobid)
    res.send(id)
  })


module.exports = router ;