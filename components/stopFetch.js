var stopFetch = function(thisStop, thisFeed, result) {

  var station = [];
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
  if (station[0]['data']) {
    for (let i = 0; i < 3; i++) {
      if (station[0]['data'][i]) {
        let estCalc = (station[0]['data'][i]['departureTime']).toString() + '000';
        estCalc = Math.floor((parseInt(estCalc) - time) / 60000);
        if (estCalc < 0) {
          estCalc = 0;
        }
        // console.log(estCalc);
        station[0].est.push(estCalc);
      }
    }
  }
  console.log(station[0]['data']);


  if (station[1]['data']) {
    for (let i = 0; i < 3; i++) {
      if (station[1]['data'][i]) {
        let estCalc = (station[1]['data'][i]['departureTime']).toString() + '000';
        estCalc = Math.floor((parseInt(estCalc) - time) / 60000);
        if (estCalc < 0) {
          estCalc = 0;
        }
        // console.log(estCalc);
        station[1].est.push(estCalc);
      }
    }
  }
  console.log(station[1]['data']);

  console.log('--------------------------- Stop Fetch Ran ---------------------------');
  console.log(station);
  return station;

}

module.exports = {fetch:stopFetch}
