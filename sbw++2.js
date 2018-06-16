// NOTE NOTE NOTE  Test case for simple scrape data

const ejs = require('ejs')
const http = require('http');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
// const lineParse = require('./sbw_Line-parse');
const app = express();

// let linesCheck = setInterval(function(){
//   if(lineParse.lines) {
//     console.log('-=-=-=-=-=-=- got lines! -=-=-=-=-=-=-');
//     console.log(lineParse.lines[0][0][1]['stop_name']);
//     clearInterval(linesCheck);
//   }
// },150)

app.set('view engine', 'ejs')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(express.static('public'))


var Mta = require('mta-gtfs');
var mta = new Mta({
  key: '59226e4f5d3fa1244428c5b178a32d47', // only needed for mta.schedule() method
  feed_id: 1 // optional, default = 1
});

// Static list of posible train lines
let lineNames = ['1', '2', '3', '4', '5', '6', '7', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'J', 'L', 'M', 'N', 'Q', 'R', 'S', 'W', 'Z', 'SIR'];

// Home route displaying lines and user defined favoried stops
app.get('/', (req, res) => {
  return res.render('home', {
    lineNames
  });
})

// switch case for assigning lines to MTA Realtime API 'feeds'
var getFeedId = function(feedId) {
  switch (feedId) {
    case 'A':
    case 'C':
    case 'E':
      return 26;
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
      return 1;
    case 'N':
    case 'Q':
    case 'R':
    case 'W':
      return 16;
    case 'B':
    case 'D':
    case 'F':
    case 'M':
      return 21;
    case 'L':
      return 2;
    case 'J':
    case 'Z':
      return 36;
    case 'G':
      return 31;
    case '7':
      return 51;
    case 'SIR':
      return 11;
  }
}

// Reads json file with the lists of stopIds, on completion renders the line page 
var getStops = function(feedId, line, res) {
  console.log(`getting stops for ${feedId}`);
  fs.readFile(`StaticData/FullSimple.json`, 'utf-8', function(err, result) {
    let stops = JSON.parse(result);
    console.log(`readFile complete`);
    console.log(stops[`line${line}`]);
    return res.render('line', {
      line: line,
      stops: stops[`line${line}`],
      feedId: feedId
    });
  })

}


// route for registration page
app.get('/register', (req, res) => {
  res.send(`<div class='wrap'>Route!</div>`)
});

// route to call Line page w/ stops
app.get('/lines/:line', (req, res) => {
  var line = req.params.line;
  var feedId = getFeedId(line);
  getStops(feedId, line, res);


});

app.get('/stops/:stop&:feedId', (req, res) => {
  // let lineInt = (parseInt(req.params.line[4]) - 1);
  console.log(req.params.feedId);
  console.log(req.params.stop);

  var thisStop = req.params.stop.toString();
  var thisFeed = req.params.feedId.toString();

  // Get the stop and line from req params and use them to plug in the correct datapoint in the stops.json
  // data file. Use the data-tester to make a dictionary, use dictionary as href and call the stop.

  mta.schedule(thisStop, thisFeed).then(function(result) {
    console.log(result);
    let station = [];
    station[0] = {
      data: result['schedule'][thisStop]["N"] || null
    }
    station[1] = {
      data: result['schedule'][thisStop]["S"] || null
    }
    station[0].est = [];
    station[1].est = [];


    // let html1 = `<ul><h2>Northbound</h2>`
    // let html2 = `<ul><h2>Southbound</h2>`

    let time = new Date();
    time = time.getTime();
    console.log(station[0]['data']);
    if (station[0]['data']) {
      for (let i = 0; i < 3; i++) {
        if (station[0]['data'][i]) {
          let estCalc = (station[0]['data'][i]['departureTime']).toString() + '000';
          estCalc = Math.floor((parseInt(estCalc) - time) / 60000);
          if (estCalc < 0) {
            estCalc = 0;
          }
          console.log(estCalc);
          station[0].est.push(estCalc);
        }
      }
    }
    console.log(station[0]);


    if (station[1]['data']) {
      for (let i = 0; i < 3; i++) {
        if (station[1]['data'][i]) {
          let estCalc = (station[1]['data'][i]['departureTime']).toString() + '000';
          estCalc = Math.floor((parseInt(estCalc) - time) / 60000);
          if (estCalc < 0) {
            estCalc = 0;
          }
          console.log(estCalc);
          station[1].est.push(estCalc);
        }
      }
    }
    console.log(station[1]);

    console.log(thisStop);
    res.render('stop', {
      station: station,
      stop: thisStop
    });
  }).catch(x => console.log(x));



  // console.log(`clicked ${req.params.stop}, found id ${thisStop}`);


})

app.listen(8080, function(err) {
  if (err) throw err;
  console.log('server');
});


// getTime v1 ------------------- /
// app.get('/stops/:stop&:line',(req,res)=>{
//   let lineInt = (parseInt(req.params.line[4]) - 1);
//   console.log(req.params.line);
//   console.log(lineInt);
//   var thisStop;
//   for (let stop of lineParse.lines[lineInt]) {
//     console.log(`${stop[1]['stop_name']} and ${req.params.stop}`);
//     if (stop[1]['stop_name'] == req.params.stop) {
//       thisStop = stop[1]['stop_id'];
//       break;
//     }
//   }
//   let test = setInterval(function(){
//     if(thisStop) {
//       mta.schedule(thisStop).then(function (result) {
//         console.log(result);
//         clearInterval(test);
//       })
//     }
//   },500);
//
//
//   console.log(`clicked ${req.params.stop}, found id ${thisStop}`);
//
//
// })
// -------------------------------------- /
