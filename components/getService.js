const fs = require('fs');
var Mta = require('mta-gtfs');
var mta = new Mta({
  key: '59226e4f5d3fa1244428c5b178a32d47', // only needed for mta.schedule() method
  feed_id: 1 // optional, default = 1
});

var connectionTest = function(){
  console.log('helloWord')
}

var status = function(favorites,tempLogin) {
    console.log('|--|--|--|--|--|--|--|--|--| Status Update Fired |--|--|--|--|--|--|--|--|--|');

    let badLines = [];
    mta.status('subway').then(function(status){
      console.log(status);

      for (statusItem of status) {
        if (statusItem.status !== 'GOOD SERVICE') {
          badLines.push(statusItem)
        }
      }

      console.log(badLines.length);
      
      if (badLines.length>0) {

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



}


module.exports = {connectionTest, status}
