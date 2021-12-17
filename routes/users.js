var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var bcrypt = require('bcryptjs');
var User = require('../models/userModel');
var Job = require('../models/jobModel');
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

// fitur registrasi dari admin untuk operator
router.post('/add_userbyadm', checkAuth('admin'), async function(req, res, next) {
  // hash digunakan untuk enkripsi password
  // req.body digunakan untuk request data dari frontend
  const users = await User.findOne({
    nohp: req.body.nohp,
  })
  if(users) {
    res.status(403).send({
      message: 'User sudah ada'
    })
    return
  }
  if(req.body.role != 'operator') {
    res.status(403).send({
      message:'admin hanya bisa membuatkan operator'
    })
    return
  }
  var enkripsi = await bcrypt.hash(req.body.pass, 10)
  const user = new User({
    _id: mongoose.Types.ObjectId(),
    name: req.body.name,
    nohp: req.body.nohp,
    pass: enkripsi,
    role: req.body.role,
    address: req.body.address,
    id_job: req.body.id_job
  });
  user.save()
  const job = await Job.findById(req.body.id_job)
  res.send({
    _id: user._id,
    name: user.name,
    nohp: user.nohp,
    pass: user.enkripsi,
    role: user.role,
    address: user.address,
    id_job: job.job_name
  })
});


// fitur registrasi dari operator untuk pegawai
router.post('/add_userbyop', checkAuth('operator'), async function(req, res, next) {
  // hash digunakan untuk enkripsi password
  // req.body digunakan untuk request data dari frontend
  const users = await User.findOne({
    nohp: req.body.nohp,
  })
  if(users) {
    res.status(403).send({
      message: 'User sudah ada'
    })
    return
  }
  if(req.body.role != 'pegawai') {
    res.status(403).send({
      message:'Operator hanya bisa membuatkan pegawai'
    })
    return
  }
  var enkripsi = await bcrypt.hash(req.body.pass, 10)
  const user = new User({
    _id: mongoose.Types.ObjectId(),
    name: req.body.name,
    nohp: req.body.nohp,
    pass: enkripsi,
    role: req.body.role,
    address: req.body.address,
    id_job: req.body.id_job
  });
  user.save()
  const job = await Job.findById(req.body.id_job)
  res.send({
    _id: user._id,
    name: user.name,
    nohp: user.nohp,
    pass: user.enkripsi,
    role: user.role,
    address: user.address,
    id_job: job.job_name
  })
});






// fitur login 
router.post('/login', async (req, res, next)=>{
  // untuk mencari user dari database lewat nohp
  var user = await User.findOne({nohp:req.body.nohp})
  console.log(user)
  // compare digunakan untuk dekripsi password
  if(!user) {
    res.status(403).send({
      message: 'Nomor HP tidak ditemukan'
    });
    return
  }
  var dekripsi = await bcrypt.compare(req.body.pass, user.pass)
  if(!dekripsi) {
    res.status(403).send({
      message: 'Password salah'
    });
    return 
  }
  const token = jwt.sign({
    nohp: user.nohp,
    _id: user._id
}, process.env.PASSWORD, 
{
    // expiresIn: "24h"
}
);
  return res.status(200).send({
    _id: user._id,
    name:user.name,
    nohp: user.nohp,
    pass: user.pass,
    role: user.role,
    address: user.address,
    token: token
  })



})






// fitur update user pribadi
router.patch('/update_user', checkAuth(), async (req,res,next) => {
  var enkripsi = await bcrypt.hash(req.body.pass, 10)
  let update = {
      name: req.body.name,
      nohp: req.body.nohp,
      pass: enkripsi,
      address: req.body.address
  }
  
  await User.updateOne({_id: req.userData._id}, {$set: update}, {returnOriginal: false})
  let newData = await User.findOne({_id:req.userData._id})
  res.send(newData)
})

// fitur update user operator dan pegawai yang dilakukan oleh admin
router.patch('/update_userbyadm/:userid', checkAuth('admin'), async (req,res,next) => {
  // var enkripsi = await bcrypt.hash(req.body.pass, 10)
  let id = await User.findById(req.params.userid)
  const job = await Job.findOne({id_job:req.body.id_job})
  let update = {
      name: req.body.name,
      nohp: req.body.nohp,
      // pass: enkripsi,
      address: req.body.address,
      id_job: job._id
  }
  
  await User.updateOne({_id: id._id}, {$set: update}, {returnOriginal: false})
  let newData = await User.findOne({_id: id._id})
  res.send({
      _id: newData._id,
      name: newData.name,
      nohp: newData.nohp,
      pass: newData.enkripsi,
      role: newData.role,
      address: newData.address,
      id_job: job.job_name
    })
})

// fitur update user pegawai yang dilakukan oleh operator
router.patch('/update_userbyop/:userid', checkAuth('operator'), async (req,res,next) => {
  var enkripsi = await bcrypt.hash(req.body.pass, 10)
  let id = await User.findById(req.params.userid)
  const job = await Job.findById(req.body.id_job)
  if(id.role != 'pegawai') {
    res.status(403).send({
      message: 'Operator hanya bisa melakukan update pegawai'      
    });
    return
  }
  let update = {
      name: req.body.name,
      nohp: req.body.nohp,
      pass: enkripsi,
      address: req.body.address,
      id_job: req.body.id_job
  }
  
  await User.updateOne({_id: id}, {$set: update}, {returnOriginal: false})
  let newData = await User.findOne({_id: id})
  res.send({
      _id: newData._id,
      name: newData.name,
      nohp: newData.nohp,
      pass: newData.enkripsi,
      role: newData.role,
      address: newData.address,
      id_job: job.job_name
    })
})





// fitur detail user pribadi (profile)
router.get('/detail_user', checkAuth(),  async (req,res,next) => {
  let users = await User.findOne({_id:req.userData._id})
  let job = await Job.findOne({_id: users.id_job})
  res.send({
    _id: users._id,
    name: users.name,
    nohp: users.nohp,
    pass: users.enkripsi,
    role: users.role,
    address: users.address,
    id_job: job.job_name,
    salary: job.salary
  })
})

// fitur detail user operator dan pegawai yang dilakukan oleh admin
router.get('/detail_userbyadm/:userid', checkAuth('admin'),  async (req,res,next) => {
  let id = await User.findById(req.params.userid)
  let job = await Job.findById(id.id_job)
  let task = await Task.find({id_pegawai: id._id})
  res.send({
    data: {
      _id: id._id,
      name: id.name,
      nohp: id.nohp,
      pass: id.enkripsi,
      role: id.role,
      address: id.address,
      id_job: job.job_name,
      salary: job.salary
    },
    tugas: {
      task
    }
  })
})

// fitur detail user pegawai yang dilakukan oleh operator
router.get('/detail_userbyop/:userid', checkAuth('operator'),  async (req,res,next) => {
  let id = await User.findById(req.params.userid)
  let job = await Job.findById(id.id_job)
  let task = await Task.find({id_pegawai: id._id})
  if(id.role != 'pegawai') {
    res.status(403).send({
      message: 'Operator hanya bisa melihat detail pegawai'      
    });
    return
  }
  res.send({
    data: {
      _id: id._id,
      name: id.name,
      nohp: id.nohp,
      pass: id.enkripsi,
      role: id.role,
      address: id.address,
      id_job: job.job_name,
      salary: job.salary
    },
    tugas: {
      task
    }
  })
})





// fitur list operator yang dapat dilihat oleh admin
router.get('/detail_listoperator', checkAuth('admin'),  async (req,res,next) => {
  let users = await User.find({role: 'operator'})
  users = await Promise.all(users.map(async(user)=>{
    let job = await Job.findById(user.id_job)
    console.log(job)
    let newuser = {
      _id: user._id,
      name: user.name,
      nohp: user.nohp,
      pass: user.enkripsi,
      role: user.role,
      address: user.address,
      job_name: job.job_name,
      salary: job.salary
    }
    return newuser
  }))
  res.send(users)
})
// fitur list pegawai yang dapat dilihat oleh admin dan operator
router.get('/detail_listpegawai', checkAuth('admin', 'operator'),  async (req,res,next) => {
  let users = await User.find({role: 'pegawai'})
  users = await Promise.all(users.map(async(user)=>{
    let job = await Job.findById(user.id_job)
    console.log(job)
    let newuser = {
      _id: user._id,
      name: user.name,
      nohp: user.nohp,
      pass: user.enkripsi,
      role: user.role,
      address: user.address,
      job_name: job.job_name,
      salary: job.salary
    }
    return newuser
  }))
  res.send(users)
})
  




// fitur delete user operator dan pegawai yang dilakukan oleh admin
router.delete('/delete_userbyadm/:userid', checkAuth('admin'),  async (req,res,next) => {
  let id = await User.findByIdAndDelete(req.params.userid)
  res.send(id)
})
// fitur delete user pegawai yang dilakukan oleh operator
router.delete('/delete_userbyop/:userid', checkAuth('operator'),  async (req,res,next) => {
  let id = await User.findById(req.params.userid)
  if(id.role != 'pegawai') {
    res.status(403).send({
      message: 'Operator hanya bisa menghapus pegawai'      
    });
    return
  }
  let hapus = await User.remove({_id: id})
  res.send(hapus)
})

module.exports = router;
 