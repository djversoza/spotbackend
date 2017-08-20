var express = require('express');
var router = express.Router();
const knexfile = require('../knexfile.js');
const knex = require('knex')({client: 'pg', database : 'spotographer', connection: 'postgres://localhost/spotographer'});
const bcrypt = require('bcrypt');
const saltRounds = 10;

router.post('/NewUser', (req, res, next) =>{
  knex.raw('SELECT username FROM users where username = ?', [req.body.username]).then(data =>{
    if (req.body.username && req.body.password) {
      if (data.rowCount < 1) {
          bcrypt.genSalt(saltRounds, (err, salt) =>{
            bcrypt.hash(req.body.password, salt, (err, hash) =>{
              knex('users').insert({
                                    username: req.body.username,
                                    password: hash
                                    })
                                    .then(function(data){
                                      if(data) {
                                      res.send({'success': true, 'message': 'Account created'})
                                    } else {
                                      res.send({'success': false, 'message': 'Username taken'})
                                    }

                                    });
            });
          });
      } else {
        res.send({'success': false, 'message': 'Username taken'});
      }
    } else {
      res.send({'success': false, 'message': 'Fill in all fields'});
    }
  })


});

router.post('/LoginUser', function(req, res, next) {
  let username = req.body.username;
  let password = req.body.password ;
  knex.raw('SELECT * FROM users where username = ?', [username])
  .then((data) =>{
    if (data.rowCount > 0) {
      console.log(req.body.password)
      bcrypt.compare(password, data.rows[0].password, (err, result) => {
        if (result) {
          res.send({'success': true, 'message': data.rows[0]});
        } else {
          res.send({'success': false, 'message': 'wrong username or password'})
        }
      })
    } else {
      res.send({'success': false, 'message': 'wrong username or password'});
    }
  })
});

router.post('/NewMarker', function(req, res, next) {
  let lat = req.body.latitude;
  let long = req.body.longitude;
  let id = req.body.id;
  let place = req.body.place;
  console.log('you typed in ' + place)
  knex.raw(`INSERT INTO markers VALUES (DEFAULT, ?, ?, ?, ?)`, [lat, long, id, place]).then(() =>{
    knex.raw("SELECT * FROM markers").then(data =>{
      res.send(data.rows)
    })
  })
});

router.post('/GetMarkers', function(req, res, next) {
  let id = req.body.id;
  console.log(id)
  knex.raw(`SELECT * FROM markers`).then((data) =>{
    res.send(data.rows);
  })
});

router.post('/UploadPhotos', (req, res, next) =>{
  let marker = req.body.marker;
  let url = req.body.url ;
  console.log(url.substr(0,url.indexOf('?')))
  console.log(url.substr(url.indexOf('?')+ 1))
  let url1 = url.substr(0,url.indexOf('?'))
  let url2 = url.substr(url.indexOf('?')+ 1)
  urlDone = "'" + url1 + "$" + url2 + "'";
  console.log(urlDone)

  // console.log(url)
  knex.raw(`INSERT INTO photos VALUES (DEFAULT, ${urlDone}, ${marker})`).then();
});

router.post('/GetPhotos', (req, res, next) =>{
  let marker = req.body.id;
  console.log(marker)
  knex.raw(`SELECT url from photos where post_id = ${marker}`).then(data =>{
    res.send(data.rows)
  });
});

router.post('/GetComments', (req, res, next) =>{
  let marker = req.body.marker;
  knex.raw('SELECT * FROM comments where post_id = ?', [marker]).then(data =>{
    res.send(data.rows)
  })
});

router.post('/AddComment', (req, res, next) =>{
  let marker = req.body.marker;
  let comment = req.body.comment;
  let poster = req.body.poster;
  knex.raw('INSERT INTO comments VALUES (DEFAULT, ?, ?, ?)', [comment, poster, marker]).then(() =>{
    knex.raw('SELECT * FROM comments where post_id = ?', [marker]).then(data =>{
      res.send(data.rows);
    })
  })
});

router.post('/DeleteAccount', (req, res, next) =>{
  let id = req.body.id;
  let password = req.body.password;

  knex.raw('SELECT * FROM users where id = ?', [id])
  .then((data) =>{
    if (data.rowCount > 0) {
      console.log(data.rows)
      bcrypt.compare(password, data.rows[0].password, (err, result) => {
        if (result) {
          knex.raw('DELETE FROM markers where user_id = ?', [id]).then(() =>{
            knex.raw('DELETE FROM users where id = ?', [id]).then(() =>{
              res.send({'success': true})
            })
          })
        } else {
          res.send({'success': false, 'message': 'wrong password'})
        }
      })
    } else {
      res.send({'success': false, 'message': 'wrong password'});
    }
  })
});

router.post('/ChangePass', (req, res, next) =>{
  let id = req.body.id;
  let password = req.body.password;
  let newPass = req.body.newPass;

  knex.raw('SELECT * FROM users where id = ?', [id])
  .then((data) =>{
    if (data.rowCount > 0) {
      console.log(data.rows)
      bcrypt.compare(password, data.rows[0].password, (err, result) => {
        if (result) {
          bcrypt.genSalt(saltRounds, (err, salt) =>{
            bcrypt.hash(newPass, salt, (err, hash) =>{
              knex.raw('UPDATE users set password = ? where id = ?', [hash, id]).then(() =>{
                res.send({'success': true, 'message': 'Password successfully changed'})
              })
            });
          });
        } else {
          res.send({'success': false, 'message': 'wrong password'})
        }
      })
    } else {
      res.send({'success': false, 'message': 'wrong password'});
    }
  })
});

module.exports = router;
