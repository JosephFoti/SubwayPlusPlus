const fs = require('fs');
var Mta = require('mta-gtfs');
var mta = new Mta({
  key: '59226e4f5d3fa1244428c5b178a32d47', // only needed for mta.schedule() method
  feed_id: 1 // optional, default = 1
});

const stopFetch = require('./stopFetch.js');

const test = function(){console.log('getting the data.favorites!')};

const getFavs = function(req) {

  // temp login to display username on page
  tempLogin = req.user.username;

  // User has a json object containing values and relevant information on which
  // stops have been designated favorite
  let data = JSON.parse(req.user.favorites);

  // if our static data file doesnt exist, write a baseline so that read function
  // does not throw error
  if (!fs.existsSync(`./public/data/${tempLogin}_favoriteStopTimes.json`)) {

    // NOTE: We can use this to set a temporary loader on start

    console.log('base favorite file did not exist!');

    // make static file for user so that each user can interact individually with their data
    fs.writeFile(`./public/data/${tempLogin}_favoriteStopTimes.json`, JSON.stringify(data), (err) => {
      console.log('-------------------------------------- new file written ------------------------------------------');
      if (err) {
        console.log(err);
      }
    });

  }


  if (data.favorites.length !== 0) {
    for (var i = 0; i < data.favorites.length; i++) {
      const thisIndex = i

      console.log('-------------------------------------- check stop & feed ------------------------------------------');
      console.log(data.favorites[thisIndex].stopId)
      console.log(data.favorites[thisIndex].feedId)

      mta.schedule(data.favorites[thisIndex].stopId, data.favorites[thisIndex].feedId).then(function(result) {

        console.log(`favorite ${thisIndex} has been pulled from the mta, about to be fetched`);

        if (Object.keys(result).length === 0) {
          console.log('error on data.favorites[' + thisIndex + ']');
          data.favorites[thisIndex].errorReport = 'Alas! No times are available';
        }

        fs.readFile(`./public/data/${tempLogin}_favoriteStopTimes.json`, 'utf-8', (err,data)=>{
          console.log('-------------------------------------- server reads file --------------------------------------');

          if (err) {
            console.log(`error in readFile: ${err}`);
          }
          // BUG: if the async events line up such that a read runs simultaneously with a unended write what happens?
          console.log('-------------------------------------- Bug starts here --------------------------------------');
          console.log(data);
          data = JSON.parse(data)

          // console.log(data['favorites']);
          if (data['favorites'] === undefined) {
            console.log(`-- error at favorite ${thisIndex} with type ${typeof data}`);
            console.log(data)

            return;
          } else {
            console.log(`++ success at favorite ${thisIndex} with type ${typeof data}`);
            console.log(data)
          }

          for (let favItem of data['favorites']) {
            if (favItem.stopId === data.favorites[thisIndex].stopId) {
              data.favorites[thisIndex].station = stopFetch.fetch(data.favorites[thisIndex].stopId, data.favorites[thisIndex].feedId, result, true);
              console.log('-------------------------------------- preparing to write static file with fav '+ thisIndex +' --------------------------------------');
              // console.log(data.favorites);
              fs.writeFile(`./public/data/${tempLogin}_favoriteStopTimes.json`, JSON.stringify(data), (err)=>{
                if (err) {
                  console.log(err);
                }
                console.log('-------------------------------------- new file written in loop ------------------------------------------');
              });
            }
          }
        });

      }).catch(x => console.log(x));


    }
  }



}


module.exports = {test:test,getFavs:getFavs}
