const fs = require('fs');
var Mta = require('mta-gtfs');
var mta = new Mta({
  key: '59226e4f5d3fa1244428c5b178a32d47', // only needed for mta.schedule() method
  feed_id: 1 // optional, default = 1
});

const stopFetch = require('./stopFetch.js');

const test = function(){console.log('getting the favs!')};

const getFavs = function(req) {

  tempLogin = req.user.username;
  let data = JSON.parse(req.user.favorites);
  // console.log('--------------------------------------------------------------------------------');
  // console.log('data.favorites');
  //
  // console.log(data.favorites);
  // console.log('--------------------------------------------------------------------------------');
  let favs = data.favorites

  fs.writeFile(`./public/data/favoriteStopTimes.json`, JSON.stringify(data), (err) => {
    console.log('-------------------------------------- new file written ------------------------------------------');
    if (err) {
      console.log(err);
    }
  });

  if (favs.length !== 0) {
    for (var i = 0; i < favs.length; i++) {
      const thisIndex = i
      mta.schedule(favs[thisIndex].stopId, favs[thisIndex].feedId).then(function(result) {

        console.log(`favorite ${thisIndex} has been pulled from the mta, about to be fetched`);

        if (Object.keys(result).length === 0) {
          console.log('error on favs[' + thisIndex + ']');
          favs[thisIndex].errorReport = 'Alas! No times are available';
        }

        fs.readFile(`./public/data/favoriteStopTimes.json`, 'utf-8', (err,data)=>{
          console.log('-------------------------------------- server reads file --------------------------------------');
          console.log(err);
          data = JSON.parse(data)
          // console.log(data['favorites']);
          if (data['favorites'] === undefined) {
            console.log(`error at favorite ${thisIndex}`);
            return;
          }
          for (let favItem of data['favorites']) {
            if (favItem.stopId === favs[thisIndex].stopId) {
              favs[thisIndex].station = stopFetch.fetch(favs[thisIndex].stopId, favs[thisIndex].stopId, result);
              console.log('-------------------------------------- preparing to write file with --------------------------------------');
              // console.log(favs);
              fs.writeFile(`./public/data/favoriteStopTimes.json`, JSON.stringify(favs), (err)=>{
                if (err) {
                  console.log(err);
                }
                console.log('-------------------------------------- new file written in loop ------------------------------------------');
              });
            }
          }
        })

      }).catch(x => console.log(x));


    }
  }



}


module.exports = {test:test,getFavs:getFavs}
