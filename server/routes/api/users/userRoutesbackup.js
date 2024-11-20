var express = require('express');
var router = express.Router();

let users = require("../../../data/users.json");

/* FETCH ALL USERS */
router.get('/', function(req, res, next) {
  res.send(users);
});

/* FETCH BY ID */
router.get('/:username', function(req, res, next) {
  const user = users.find(element => element.username == req.params.username);
  res.send(user);
});

/* CREATE */
router.post('/', function(req, res, next) {
  let found = users.some(element => element.username == req.body.username || element.id == req.body.id);
  if (found) {
  res.send({ error : { message : "Duplicated Data." , result : req.body}});
  } else {
  users.push(req.body);
  res.send({ success : { message : "Inserted Successfully." , result : req.body}});
}
});

// UPDATE DATA
router.put('/:id',function(req, res, next) {
users.forEach((user, index) =>{
  if(user.id == req.params.id) {
    users[index] = req.body;
  }
});
  res.send({ success : { message : "Updated Successfully." , result : req.body}});

});

// UPDATE SOME DATA
router.patch('/:id', function(req, res, next) {
  users.forEach((user, index) =>{
    if(user.id == req.params.id) {
     let keys = Object.keys(req.body);
     keys.forEach(key => {
      user[key] = req.body[key];
     });
    }
  });
  res.send({ success : { message : "Patched Successfully." , result : req.body}});
});

// DELETE DATA
router.delete('/:id', function(req, res ,next) {
  let user = users.find( user => user.id == req.params.id);
  users = users.filter(user => user.id != req.params.id);
  res.send({ success : { message : "Deleted Successfully." , result : user}});

});

module.exports = router;
