/*

Stopfetch takes the data received from the mta schedule module (the times of
expected trains) and parses them into readable minutes until arrival estimates.
estimates are pushed into a station array which is then applied into the data for
the favoried line to be written into

*/

var stopFetch = function(thisStop, thisFeed, result, simple=false) {

  var station = [];
  var estimates = [{"est":[]},{"est":[]}];
  station[0] = {
    data: result['schedule'][thisStop]["N"] || null
  }
  station[1] = {
    data: result['schedule'][thisStop]["S"] || null
  }
  station[0].est = [];
  station[1].est = [];
  console.log(thisStop);

  let time = new Date();
  time = time.getTime();
  if (station[0]['data']) {
    for (let i = 0; i < 3; i++) {
      if (station[0]['data'][i] && station[0]['data'][i]['departureTime']) {

        let estCalc = (station[0]['data'][i]['departureTime']).toString() + '000';
        estCalc = Math.floor((parseInt(estCalc) - time) / 60000);
        if (estCalc < 0) {
          estCalc = 0;
        }
        station[0].est.push(estCalc);
        estimates[0].est.push(estCalc);
      }
    }
    console.log('uptown ' + estimates[0].est)
  }


  if (station[1]['data']) {
    for (let i = 0; i < 3; i++) {
      if (station[1]['data'][i] && station[1]['data'][i]['departureTime']) {

        let estCalc = (station[1]['data'][i]['departureTime']).toString() + '000';
        estCalc = Math.floor((parseInt(estCalc) - time) / 60000);
        if (estCalc < 0) {
          estCalc = 0;
        }
        station[1].est.push(estCalc);
        estimates[1].est.push(estCalc);
      }
    }
    console.log('downtown ' + estimates[1].est)
  }

if (simple) {
  return estimates;
}

return station;

}

module.exports = {fetch:stopFetch}
