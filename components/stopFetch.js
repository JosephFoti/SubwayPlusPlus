/*

Stopfetch takes the data received from the mta schedule module (the times of
expected trains) and parses them into readable minutes until arrival estimates.
estimates are pushed into a station array which is then applied into the data for
the favoried line to be written into

*/

var stopFetch = function(thisStop, thisFeed, result, estimateNumber = 3) {

  const station = {
    N: {
      schedule: result.schedule[thisStop].N || undefined,
      parsedArrivals: [],
    },
    S: {
      schedule: result.schedule[thisStop].S || undefined,
      parsedArrivals: [],
    }
  }

  const time = new Date().getTime();

  if (station.N.schedule) {
    for (let i = 0; i < estimateNumber; i++) {
      const train = station.N.schedule[i]
      if (!train || !train.departureTime) continue;

      const estimate = train.departureTime * 1000;
      const parsedEstimate = ((estimate - time) / 60000) > 0 ? Math.floor((estimate - time) / 60000) : 0;

      station.N.parsedArrivals.push({estimate: parsedEstimate, line: train.routeId});
      console.log('uptown ' + parsedEstimate);
    }
  }

  if (station.S.schedule) {
    for (let i = 0; i < estimateNumber; i++) {
      const train = station.S.schedule[i]
      if (!train || !train.departureTime) continue;

      const estimate = train.departureTime * 1000;
      const parsedEstimate = ((estimate - time) / 60000) > 0 ? Math.floor((estimate - time) / 60000) : 0;

      station.S.parsedArrivals.push({estimate: parsedEstimate, line: train.routeId});
      console.log('downtown ' + parsedEstimate);
    }
  }

  return station;
}

module.exports = {fetch:stopFetch}
