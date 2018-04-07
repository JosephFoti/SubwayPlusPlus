var Mta = require('mta-gtfs');
const fs = require('fs');

var lineData;
let haveLineData;
let haveMTAData;

// Reads a json scraped from mta subway time listing the stops for the lines
fs.readFile('./eachLine.json','utf-8',function(err,res){
  res = JSON.parse(res);
  lineData = res;
  // console.log(lineData);
  haveLineData = true
})


var mta = new Mta({
  key: '59226e4f5d3fa1244428c5b178a32d47', // only needed for mta.schedule() method
  feed_id: 1                               // optional, default = 1
});

let clumps = [];
let lines = [[],[],[],[],[],[],[]];
// empty array for line clump object containing all relevant information, Master data store for each pull of
// same type objects


let regs = ['^[1234567]'];
// array containing clump call in RegExp ,'^[456]','^[ACE]','^[BDFM]'

function LineBuilder(name,data,stopNames,stopIds) {
  // build line clump object
  this.name = name;
  // name of lines contained
  this.data = data
  // station objects
  this.stopNames = stopNames;
  // stop names
  this.stopIds = stopIds;
  // stop Ids
}

function lineFilter(reg,data){
  let set1 = new Set();
  // unique stop names
  let set2 = new Set();
  // unique stop IDs
  let set3 = new Set();
  // NOTE shitty way of getting the name

  let x = data.filter(x=>{
    if(!x[0].search(reg)) {
      // get stop names and stop ids
      set1.add(x[1].stop_name);
      set2.add(x[0]);
      set3.add(x[0][0]);
      return x;
    };
  });

  let stopNames = [...set1];
  let stopIds = [...set2];
  let name = [...set3];
  name.join('');
  let lineClump =  new LineBuilder(name,x,stopNames,stopIds)
  // constructor
  clumps.push(lineClump);
  // collection
}



mta.stop().then(function (result) {
  let byStopId = Object.entries(result);
  // console.log(byStopId);
  for (let reg of regs) {
    lineFilter(reg,byStopId);
  }
  console.log('stop data!');
  haveMTAData = true;
  // Loops through all regexp strings to call clumps
  // let check = setInterval(function(){
  //   if (clumps.length == regs.length) {
  //     clearInterval(check);
  //     return;
  //   }
  // },200);

}).catch(function (err) {
  console.log(err);
}).then(x=>{
  // parse through clumps to create line subObjects

});

let promise = new Promise((resolve,reject)=>{

  let check1 = setInterval(function(){
    console.log(haveMTAData + ' ' + haveLineData);
    if (haveMTAData && haveLineData) {
      console.log('both data sets recieved');
      clearInterval(check1);
      resolve();
    }
  },200);

}).then(x=>{

  console.log('-----------------resolve!--------------------');
  // console.log(clumps);
  for (let i = 0; i<clumps.length;i++) {
    // console.log(clumps[i]['stopNames']);
    for (let j = 0 ; j<clumps[i]['stopNames'].length;j++) {
      if(lineData['line1'].includes(clumps[i]['stopNames'][j])) {
        lines[0].push(clumps[i]['data'][j]);
      }
      if(lineData['line2'].includes(clumps[i]['stopNames'][j])) {
        lines[1].push(clumps[i]['data'][j]);
      }
      if(lineData['line3'].includes(clumps[i]['stopNames'][j])) {
        lines[2].push(clumps[i]['data'][j]);
      }
      if(lineData['line4'].includes(clumps[i]['stopNames'][j])) {
        lines[3].push(clumps[i]['data'][j]);
      }
      if(lineData['line5'].includes(clumps[i]['stopNames'][j])) {
        lines[4].push(clumps[i]['data'][j]);
      }
      if(lineData['line6'].includes(clumps[i]['stopNames'][j])) {
        lines[5].push(clumps[i]['data'][j]);
      }
      if(lineData['line7'].includes(clumps[i]['stopNames'][j])) {
        lines[6].push(clumps[i]['data'][j]);
      }

      // if ()
    }

  }


  // console.log('------------------------ line 1 ---------------------------');
  // console.log(lines[0]);
  // console.log('------------------------ line 2 ---------------------------');
  // console.log(lines[1]);
  // console.log('------------------------ line 3 ---------------------------');
  // console.log(lines[2]);
  // console.log('------------------------ line 4 ---------------------------');
  // console.log(lines[3]);
  // console.log('------------------------ line 5 ---------------------------');
  // console.log(lines[4]);
  // console.log('------------------------ line 6 ---------------------------');
  // console.log(lines[5]);
  console.log('------------------------ export ---------------------------');
  // console.log(lines[6]);

  exports.lines = lines;
  exports.ready = true;
})
// module.exports = {lines};
