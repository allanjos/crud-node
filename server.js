'use strict';

var http = require("http");
var url = require("url");
var sqlite3 = require("sqlite3");

console.log("Starting the server...");

var pathname = '';
var sqlite3 = null;
var db = null;

var Server = {};

Server.onCreate = function(request, response)
{
  console.log('Server.onCreate()');

  pathname = url.parse(request.url).pathname;

  console.log("Request for " + pathname + " received.");

  response.writeHead(200, {'Content-type': 'text/html'});

  response.write('Node DB test<br/>');

  response.write('<button onclick="location.href=\'/query\'">Query</button>');
  response.write(' ');
  response.write('<button onclick="location.href=\'/insert\'">Insert</button>');
  response.write(' ');
  response.write('<button onclick="location.href=\'/delete\'">Delete</button>');
  response.write('<br/>');

  // Database

  sqlite3 = require('sqlite3').verbose();

  db = new sqlite3.Database('issues.db');

  db.serialize(function() {
    response.write('Serializing database instructions.<br/>');

    response.write('Create table<br/>');

    db.run("CREATE TABLE IF NOT EXISTS issues (name TEXT)");
  });

  response.write('Handling route<br/>');

  switch (pathname) {
    case '/insert':
      response.write('/insert route<br/>');
      Server.insert(db, response);
      break;
    case '/delete':
      response.write('/delete route<br/>');
      Server.delete(db, response);
      break;
    default:
      response.write('/query route<br/>');
      Server.query(db, response);
      break;
  }
};

Server.query = function(db, response)
{
  db.serialize(function() {
    response.write('Query data:<br/>');

    db.all("SELECT rowid AS id, name FROM issues", {}, function(err, rows){
      if (err)
        throw err;

      for (var j = 0; j < rows.length; j++){
        response.write("Issue name: " + rows[j].name + '<br/>');
      };

      response.end();
    });
  });

  db.close();
};

Server.insert = function(db, response)
{
  db.serialize(function() {
    response.write('Insert data<br/>');

    var stmt = db.prepare("INSERT INTO issues VALUES (?)");

    var date = new Date();

    stmt.run("Issue " + date.getTime());

    stmt.finalize();
  });

  this.query(db, response);
};

Server.delete = function(db, response)
{
  db.serialize(function() {
    response.write('Delete data<br/>');

    var stmt = db.prepare("DELETE FROM issues");

    stmt.run();

    stmt.finalize();
  });

  this.query(db, response);
};

var http = require('http');

var server = http.createServer(Server.onCreate);

server.listen(8080);