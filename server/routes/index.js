var express = require('express');
var router = express.Router();
var path = require('path');
var pg = require('pg');
var connectionString = require(path.join(__dirname, '../', '../', 'config'));

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// CREATE
router.post('/api/v1/todos', function(req, res) {
  var results = [];

  // grab data from http request
  var data = {
    text: req.body.text,
    complete: false
  };

  // get a postgres client from the connection pool
  pg.connect(connectionString, function(err, client, done) {
    // handle connection errors
    if (err) {
      done();
      console.log(err);
      return res.status(500).
        json({
          success: false,
          data: err
        });
    }

    // sql query > insert data
    client.query(
      'INSERT INTO items(text, complete) values($1, $2)',
      [data.text, data.complete]
    );

    // sql query > select data
    var query = client.query('SELECT * FROM items ORDER BY id ASC');

    // stream results back one row at a time
    query.on('row', function(row) {
      results.push(row);
    });

    // after all data is returned, close connection and return results
    query.on('end', function() {
      done();
      return res.json(results);
    });

  });

});

// READ
router.get('/api/v1/todos', function(req, res) {
  var results = [];

  // get a postgres client from the connection pool
  pg.connect(connectionString, function(err, client, done) {
    // handle connection errors
    if (err) {
      done();
      console.log(err);
      return res.status(500).
      json({
        success: false,
        data: err
      });
    }

    // sql query > select data
    var query = client.query('SELECT * FROM items ORDER BY id ASC;');

    // stream results back one row at a time
    query.on('row', function(row) {
      results.push(row);
    });

    // after all data is returned, close connection and return results
    query.on('end', function() {
      done();
      return res.json(results);
    });

  });
});

// UPDATE
router.put('/api/v1/todos/:todo_id', function(req, res) {
  var results = [];

  // grab data from url params
  var id = req.params.todo_id;

  // grab data from http request
  var data = {
    text: req.body.text,
    complete: req.body.complete
  };

  // get postgres client from connection pool
  pg.connect(connectionString, function(err, client, done) {
    // handle connection errors
    if (err) {
      done();
      console.log(err);
      return res.status(500).
        send(
          json({
            success: false,
            data: err
          })
        );
    }

    // sql query > update data
    client.query(
      'UPDATE items SET text=($1), complete=($2) WHERE id=($3)',
      [
        data.text,
        data.complete,
        id
      ]
    );

    // sql query > select data
    var query = client.query('SELECT * FROM items ORDER BY id ASC');

    // stream results back one row at a time
    query.on('row', function(row) {
      results.push(row);
    });

    // after all data is returned, close connection and return results
    query.on('end', function() {
      done();
      return res.json(results);
    });

  });
});

// DELETE
router.delete('/api/v1/todos/:todo_id', function(req, res) {
  var results = [];

  // grab data from url params
  var id = req.params.todo_id;

  // get a postgres client from connection pool
  pg.connect(connectionString, function(err, client, done) {
    // handle connection errors
    if (err) {
      done();
      console.log(err);
      return res.status(500).
        json({
          success: false,
          data: err
        });
    }

    // sql query > delete data
    client.query(
      'DELETE FROM items WHERE id=($1)',
      [id]
    );

    // sql query > select data
    var query = client.query('SELECT * FROM items ORDER BY id ASC');

    // stream results back one row at a time
    query.on('row', function(row) {
      results.push(row);
    });

    // after all data is returned, close connection and return results
    query.on('end', function() {
      done();
      return res.json(results);
    });

  });
});

module.exports = router;
