const fs = require('fs');
var Mta = require('mta-gtfs');
var mta = new Mta({
  key: '59226e4f5d3fa1244428c5b178a32d47', // only needed for mta.schedule() method
  feed_id: 1 // optional, default = 1
});

var connectionTest = function(){
  console.log('helloWord')
}

var status = function(tempLogin = false, single = false) {
    console.log('|--|--|--|--|--|--|--|--|--| Status Update Fired |--|--|--|--|--|--|--|--|--|');

    let badLines = [];
    let singleResult;

    mta.status('subway').then(function(status){
      // console.log(status);

      // push all lines that have a status that is not good service to array
      for (statusItem of status) {
        if (statusItem.status !== 'GOOD SERVICE') {
          badLines.push(statusItem)
        }
      }

      // Fire if their are lines with service updates
      if (badLines.length>0) {

      // Service updates come in line bundles, we need to parse out the individual
      // lines to be checked one by one
      var effectedGroups = badLines.map(x=>{
        return x.name
      });

      effectedLines = effectedGroups.join('').split('');

      let parsedStatusUpdates = {};

      var errorsForLines = effectedLines.map((x,i)=>{

        for (var j = 0; j < effectedGroups.length; j++) {
          let splitGroup = effectedGroups[j].split('');
          if (splitGroup.includes(x)) {
            // ES6 adds object into an object as a dictionary not an array of obejcts
            Object.assign(parsedStatusUpdates, { [`${x}`]:badLines[j]})
          }
        }
        return x;

      });

      // console.log(errorsForLines);


      // if request is for a stop page / single request
      if (single) {

        if (errorsForLines.includes(single)) {
          console.log(`found status update for single ${single}`);
          console.log(parsedStatusUpdates[single]);
          return singleResult = parsedStatusUpdates[single];
        } else {
          return singleResult = false;
        }

      }

      fs.writeFile(`./public/data/${tempLogin}_favoriteStatusUpdates.json`, JSON.stringify(parsedStatusUpdates), err=>{
        if (err) console.log(err);
        console.log('|--|--|--|--|--|--|--|--|--| new status file written for '+effectedLines.toString()+' |--|--|--|--|--|--|--|--|--|');

      })

    } else {
      let content = '{noStatus:true}'
      fs.writeFile(`./public/data/${tempLogin}_favoriteStatusUpdates.json`, content, err=>{
        if (err) console.log(err);
        console.log('|--|--|--|--|--|--|--|--|--| No new status, blank status file written |--|--|--|--|--|--|--|--|--|');

      })
    }

      // for (favorite of favorites) {
      //   if (parsedStatusUpdates[favorite.line]) {
      //     favorite.status = parsedStatusUpdates[favorite.line]
      //   }
      // }

    });

    if (singleResult) {
      return singleResult;
    }

}

var statusSingle = function(singleValue) {
  console.log('single fires');
  let singleResult;
  let badLines = [];


  mta.status('subway').then(function(status){
    console.log(status);
  })



  // mta.status('subway').then(function(status){
  //   // console.log(status);
  //   console.log('status check');
  //
  //   // push all lines that have a status that is not good service to array
  //   // for (statusItem of status) {
  //   //   if (statusItem.status !== 'GOOD SERVICE') {
  //   //     badLines.push(statusItem)
  //   //   }
  //   // }
  //   //
  //   // // Fire if their are lines with service updates
  //   // if (badLines.length>0) {
  //   //   console.log('bad lines exist');
  //   //   // Service updates come in line bundles, we need to parse out the individual
  //   //   // lines to be checked one by one
  //   //   var effectedGroups = badLines.map(x=>{
  //   //     return x.name
  //   //   });
  //   //
  //   //   effectedLines = effectedGroups.join('').split('');
  //   //
  //   //   let parsedStatusUpdates = {};
  //   //
  //   //   var errorsForLines = effectedLines.map((x,i)=>{
  //   //
  //   //     for (var j = 0; j < effectedGroups.length; j++) {
  //   //       let splitGroup = effectedGroups[j].split('');
  //   //       if (splitGroup.includes(x)) {
  //   //         // ES6 adds object into an object as a dictionary not an array of obejcts
  //   //         Object.assign(parsedStatusUpdates, { [`${x}`]:badLines[j]})
  //   //       }
  //   //     }
  //   //     return x;
  //   //
  //   //   });
  //
  //   //   console.log('lines with errors');
  //   //   console.log(errorsForLines);
  //   //
  //   //   if (errorsForLines.includes(singleValue)) {
  //   //     console.log(`found status update for singleValue ${singleValue}`);
  //   //     console.log(parsedStatusUpdates[singleValue]);
  //   //     singleResult = parsedStatusUpdates[singleValue];
  //   //   } else {
  //   //     singleResult = false;
  //   //   }
  //   //
  //   //
  //   //
  //   // } else {
  //   //    singleResult = false;
  //   // }
  //   //
  //   // console.log('single result');
  //   // console.log(singleResult);
  //
  //   // if (singleResult) {
  //   //   fs.writeFile(`./public/data/${singleValue}_statusReport.json`, JSON.stringify(singleResult), err=>{
  //   //     if (err) {
  //   //       console.log(err);
  //   //     }
  //   //     console.log(`|--|--|--|--|--|--|--|--|--| Single Status File Written for ${singleValue} |--|--|--|--|--|--|--|--|--|`);
  //   //
  //   //   })
  //   //
  //   // } else {
  //   //
  //   //   fs.writeFile(`./public/data/${singleValue}_statusReport.json`, JSON.stringify({status: "GOOD SERVICE"}), err=>{
  //   //     if (err) {
  //   //       console.log(err);
  //   //     }
  //   //     console.log(`|--|--|--|--|--|--|--|--|--| EMPTY Single Status File Written for ${singleValue} |--|--|--|--|--|--|--|--|--|`);
  //   //
  //   //   });
  //   //
  //   // }
  //
  // }).catch(err => throw err);



}

module.exports = { connectionTest, status, statusSingle }
