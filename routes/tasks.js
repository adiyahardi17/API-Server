var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var User = require('../models/userModel');
var Task = require('../models/taskModel');
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


// fitur create tugas
router.post('/add_task', checkAuth('operator'), async function(req, res, next) {
    const tasks = new Task({
        _id: mongoose.Types.ObjectId(),    
        id_pegawai: req.body.id_pegawai,
        task_name: req.body.task_name,
        description: req.body.description
    });
    tasks.save()
    res.send(tasks)
});




// fitur update tugas
router.patch('/update_task/:taskid', checkAuth('operator'), async function(req, res, next) {
    let id = await Task.findById(req.params.taskid)
    let update = {
        task_name: req.body.task_name,
        description: req.body.description,
        progress: req.body.progress
    }
    await Task.updateOne({_id: id}, {$set: update}, {returnOriginal: false})
    let newData = await Task.findOne({_id: id})
    res.send(newData)
})




// fitur delete tugas
router.delete('/delete_task/:taskid', checkAuth('operator'),  async (req,res,next) => {
    let id = await Task.findByIdAndDelete(req.params.taskid)
    res.send(id)
  })





// fitur detail tugas
router.get('/detail_task/:taskid', checkAuth(),  async (req,res,next) => {
    let id = await Task.findById(req.params.taskid)
    res.send(id)
  })




// fitur list tugas
router.get('/list_task', checkAuth('pegawai'),  async (req,res,next) => {
    let id = await Task.find({id_pegawai: req.userData._id})
    res.send(id)
  })





// fitur update tugas oleh pegawai
router.patch('/update_progress/:taskid', checkAuth('pegawai'), async function(req, res, next) {
    let id = await Task.findById(req.params.taskid)
    let update = {
        progress: req.body.progress
    }
    await Task.updateOne({_id: id}, {$set: update}, {returnOriginal: false})
    let newData = await Task.findOne({_id: id})
    res.send(newData)
})
module.exports = router ;