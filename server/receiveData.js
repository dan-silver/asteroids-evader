/*
 * This node server receives POST requests to localhost:3000/
 * with data that's written to a CSV file
 */

var express    = require('express'),
    bodyParser = require('body-parser'),
    fs         = require('fs');

var app = express()
var wstream = fs.createWriteStream('../data.csv', {'flags': 'a'});

// parse application/json
app.use(bodyParser.urlencoded({ extended: false }))

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");

  next()
})

app.post('/', function(req, res, next) {
  console.log(req.body)
  var content = []
  for (var k in req.body) {
    content.push(req.body[k])
  }
  wstream.write(content.join(',')+'\n');
  res.status(200).end()
})

// When the server quits, close the file
process.on('SIGTERM', function () {
  console.log('closing write stream')
  wstream.end();
})

var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})