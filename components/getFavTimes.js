const fs = require('fs');
var Mta = require('mta-gtfs');
var mta = new Mta({
  key: '59226e4f5d3fa1244428c5b178a32d47', // only needed for mta.schedule() method
  feed_id: 1 // optional, default = 1
});

// gets parsed times from the MTA data
const stopFetch = require('./stopFetch.js');

const test = function() {
  console.log('getting the data.favorites!')
};

const getFavs = function(req) {


  /*

  Loop through each favorited stop stored in the database for a given user, get
  it's stopID and feedID and launch an ansynchronous call to the MTA. When/if data
  is received, run the stopFetch and assign the result to the station value of
  the matching favorited stop. Station will contain estimates of the next three
  trains. The timeout function will fire 13 seconds after this function is
  called and write whatever data has been recieved and defined to a static file
  for the user. Client side calls the static value and renders new information
  on a 15s interval.

  */


  // temp login to display username on page
  tempLogin = req.user.username;

  // User has a json object containing values and relevant information on which
  // stops have been designated favorite
  let data = JSON.parse(req.user.favorites);

  // if our static data file doesnt exist, write a baseline so that read function
  // does not throw error
  if (!fs.existsSync(`./public/data/${tempLogin}_favoriteStopTimes.json`)) {

    console.log('-------------------------------------- Favorites File NDE ------------------------------------------');
    // make static file for user so that each user can interact individually with their data
    fs.writeFile(`./public/data/${tempLogin}_favoriteStopTimes.json`, JSON.stringify(data), (err) => {
      console.log('-------------------------------------- New Favorites File written ------------------------------------------');
      if (err) {
        console.log(err);
      }
    });

  }


  if (data.favorites.length !== 0) {

    // Writes file
    setTimeout(function() {
      fs.writeFile(`./public/data/${tempLogin}_favoriteStopTimes.json`, JSON.stringify(data), (err) => {
        if (err) {
          console.log(err);
        }
        console.log('-------------------------------------- new file written ------------------------------------------');
      });
    }, 13000);

    for (var i = 0; i < data.favorites.length; i++) {

      const thisIndex = i
      const thisStop = data.favorites[thisIndex].stopId;
      console.log('-------------------------------------- check stop & feed for ' + thisStop + '------------------------------------------');
      console.log(data.favorites[thisIndex].stopId)
      console.log(data.favorites[thisIndex].feedId)

      // MTA data pull for stop times
      mta.schedule(data.favorites[thisIndex].stopId, data.favorites[thisIndex].feedId).then(function(result) {

        console.log(`favorite ${thisStop} has been pulled from the mta, about to be fetched`);

        if (Object.keys(result).length === 0) {
          console.log('MTA error on data.favorites[' + thisIndex + ']');
          data.favorites[thisIndex].errorReport = 'Alas! No times are available';
        }

        for (let favItem of data['favorites']) {
          if (favItem.stopId === data.favorites[thisIndex].stopId) {
            data.favorites[thisIndex].station = stopFetch.fetch(data.favorites[thisIndex].stopId, data.favorites[thisIndex].feedId, result, true);
            console.log('-------------------------------------- preparing to add ' + thisStop + ' to static data with the following --------------------------------------');
            console.log(data.favorites[thisIndex].station);
            console.log(JSON.stringify(data));
          }
        }

      }).catch(x => console.log(x));

    }


  }


}


module.exports = {
  test: test,
  getFavs: getFavs
}
