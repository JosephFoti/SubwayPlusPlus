const http = require('http');
const fs = require('fs');
const express = require('express');
const lineParse = require('./sbw_Line-parse');
const app = express();

let linesCheck = setInterval(function(){
  if(lineParse.lines) {
    console.log('=--=-=-=-=-=- got lines! =--=-=-=-=-=-');
    console.log(lineParse.lines[0][0][1]['stop_name']);
    clearInterval(linesCheck);
  }
},150)

app.use(express.static('public'));

var Mta = require('mta-gtfs');
var mta = new Mta({
  key: '59226e4f5d3fa1244428c5b178a32d47', // only needed for mta.schedule() method
  feed_id: 1                               // optional, default = 1
});

// let lineCall = new RegExp('^.','g');
// get a regexp that can filter though array of line data and collect possible stations

// [ '1','2','3','4','5','6','7','9','1','2','3','4','5','6','7','9','A','B','D','E','F','G','H','J','L','M','N','Q','R','S' ];
// [ '1','2','3','4','5','6','7','9','A','B','D','E','F','G','H','J','L','M','N','Q','R','S' ];
let lineNames = [ '1','2','3','4','5','6','7'];
let dataOfTheLines = '';


function LineUp(line) {
  this.line = line;
  this.stop = [];
}

var eachLine;

fs.readFile('eachLine.json','utf-8',function(err,res){
  eachLine = JSON.parse(res);
})



for (let name of lineNames) {
  dataOfTheLines += `<a href="/lines/line${name}"><button type="button" class="btn">${name}</button></a>`;
}


fs.writeFile('./public/index.html',dataOfTheLines,(err)=>{
  if (err) throw err;
  console.log('index writen');
})

app.get('/register',(req,res)=>{
  res.send(`<div class='wrap'>Route!</div>`)
});

app.get('/lines/:line',(req,res)=>{

  let html = `<div class="lineWrap" data-line="${req.params.line}"><h1 class="title" style="text-align:center;">${req.params.line} contains ${eachLine[req.params.line].length} lines </h1></div>`;
  html += `</ul>`;
  for (let stop of eachLine[req.params.line]) {
    html += `<a href="/stops/${stop}&${req.params.line}"><li class='stop'>${stop}</li></a>`;
  }
  html += `</ul>`;
  res.send(html);

});

app.get('/stops/:stop&:line',(req,res)=>{
  let lineInt = (parseInt(req.params.line[4]) - 1);
  console.log(req.params.line);
  console.log(lineInt);
  var thisStop;
  for (let stop of lineParse.lines[lineInt]) {
    console.log(`${stop[1]['stop_name']} and ${req.params.stop}`);
    if (stop[1]['stop_name'] == req.params.stop) {
      thisStop = stop[1]['stop_id'];
      break;
    }
  }
  let test = setInterval(function(){
    if(thisStop) {
      mta.schedule(thisStop).then(function (result) {
        console.log(result);
        clearInterval(test);
      })
    }
  },500);


  console.log(`clicked ${req.params.stop}, found id ${thisStop}`);


})

app.listen(8080,function(err){
  if (err) throw err;
  console.log('server');
});

//
// http.createServer(function(req,res){
//
//
// }).listen(8080,function(){
//   console.log('running!');
// })



// module.exports = lines;

// Object.entries(result)[0][1]['stop_name']
