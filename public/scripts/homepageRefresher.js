$(document).ready(function(){
  console.log('hello!! new string');
  var singles = $('.fav-single').children('.times-wrapper')
  var tempLogin = $('.tempLogin').text();
  var tries = 0;
  console.log(singles);
  console.log(tempLogin);

  function getLastRefresh(favIndex) {

    let date = new Date();
    var hours = date.getHours(),
    minutes = date.getMinutes(),
    seconds = date.getSeconds(),
    ampm = hours >= 12 ? 'pm' : 'am';

    hours = hours % 12;
    hours = hours ? hours : 12;
    seconds = seconds<10 ? '0' + seconds : seconds;

    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ':' + seconds +' ' + ampm;

    if (favIndex > 0) {
      $('.fav-refresh').eq([favIndex]).text('Last refresh was at '+strTime);
    } else {
      $('.fav-refresh').text('Last refresh | '+strTime);
    }

  }

  if ($('.tempLogin').text() && !$('.hp-banner').hasClass('no-favorites')) {
    $.ajax({
      url:`../data/${tempLogin}_favoriteStopTimes.json`,
      success: function(result){
        console.log(result);
        var result = result['favorites'];
        timeCall(result)
      },
      failure: function(err) {
        console.log('something went wrong!');
        console.log(err);
      }
    });


var timeCall = function(result){
    console.log('Initial Call, on try '+tries);

    let html = '';
    for (let i=0;i < result.length;i++) {
      // console.log('checking result '+i)
      if (!result[i]['station']) {
        console.log('no station');
        if (tries < 3) {
          let delay = 750 * tries;
          console.log('no data, reseting on try '+tries);
          setTimeout(function(){
            console.log(result);
            timeCall(result)
          },delay);
          tries++;
          return;
        }

        html += '<h5 class="error-msg">Uh-oh! No data for this stop.</h5>'
        singles[i].classList.add("empty")
        singles[i].innerHTML = html;
        html = ''
        getLastRefresh(i);
        continue;
      }
      if ($(singles[i]).hasClass('empty')) {
        $(singles[i]).removeClass('empty');
      }
       html += `<ul class="time-container uptown"><h3 class="station-type">Northbound</h3>`
       if (!result[i]['station'][0]) {
         console.log('no northbound');
         html += '<h5 class="error-msg">No trains at the northbound station</h5></ul>'
         singles[i].innerHTML = html;
         html = ''
         getLastRefresh(i);
         continue;
       }

      for (let j=0; j<3; j++) {
        if (!result[i]['station'][0]['est'][j]) continue;
        html += `<li class="time-item line-type-${result[i]['station'][0]['est'][j][1]}"><span class="time-item-line">${result[i]['station'][0]['est'][j][1]}</span>${result[i]['station'][0]['est'][j][0]} Minutes</li>`
      }
        html += `</ul>`

        html += `<ul class="time-container downtown"><h3 class="station-type">Southbound</h3>`

      if (!result[i]['station'][1]) {
        console.log('no soutbound');

        html += '<h5 class="error-msg">No trains at the southbound station</h5>'
        singles[i].innerHTML = html;
        html = ''
        getLastRefresh(i);
        continue;
      }

      for (let j=0; j<3; j++) {
        if (!result[i]['station'][1]['est'][j]) continue;
        html += `<li class="time-item line-type-${result[i]['station'][1]['est'][j][1]}"><span class="time-item-line">${result[i]['station'][1]['est'][j][1]}</span>${result[i]['station'][1]['est'][j][0]} Minutes</li>`
      }
        html += `</ul>`
      // $(singles).eq(i).innerHTML(html);
    console.log(i + ' got data');
    // result.splice(i,1);
    singles[i].innerHTML = html;
    html = '';
    getLastRefresh(i);
}
}


  setInterval(function(){
    $.ajax({
      url:`../data/${tempLogin}_favoriteStopTimes.json`,
      success: function(result) {
        console.log('hello timeout!');
        var result = result['favorites'];

        let html = '';
        for (let i=0;i < result.length;i++) {
          console.log('checking result '+i)
          if (!result[i]['station']) {
            console.log('no station');

            if (singles[i].innerHTML.length > 0) {
              console.log('no new data for favorite '+i);
              continue;
            }

            html += '<h5 class="error-msg">Uh-oh! No data for this stop.</h5>'
            singles[i].innerHTML = html;
            html = ''
            continue;
          }
           html += `<ul class="time-container uptown"><h3 class="station-type">Northbound</h3>`
           if (!result[i]['station'][0]) {
             console.log('no northbound');
             html += '<h5 class="error-msg">No trains at the northbound station</h5></ul>'
             singles[i].innerHTML = html;
             html = ''
             continue;
           }

          for (let j=0; j<3; j++) {
            if (!result[i]['station'][0]['est'][j]) continue;
            html += `<li class="time-item line-type-${result[i]['station'][0]['est'][j][1]}"><span class="time-item-line">${result[i]['station'][0]['est'][j][1]}</span>${result[i]['station'][0]['est'][j][0]} Minutes</li>`
          }
            html += `</ul>`

            html += `<ul class="time-container downtown"><h3 class="station-type">Southbound</h3>`

          if (!result[i]['station'][1]) {
            console.log('no soutbound');

            html += '<h5 class="error-msg">No trains at the southbound station</h5>'
            singles[i].innerHTML = html;
            html = ''
            continue;
          }

          for (let j=0; j<3; j++) {
            if (!result[i]['station'][1]['est'][j]) continue;
            html += `<li class="time-item line-type-${result[i]['station'][1]['est'][j][1]}"><span class="time-item-line">${result[i]['station'][1]['est'][j][1]}</span>${result[i]['station'][1]['est'][j][0]} Minutes</li>`
          }
            html += `</ul>`
          // $(singles).eq(i).innerHTML(html);

        singles[i].innerHTML = html;
        html = '';
        getLastRefresh(i);
        }
      },
      failure: function(err) {
        console.log('something went wrong!');
        console.log(err);
      }
    });
  },15000);


}

})

window.onbeforeunload = function(){

  $.post( "/stopData", function( data ) {
    console.log('goodbye!')
  });


}

document.pagehide = function(){

  $.post( "/stopData", function( data ) {
    console.log('goodbye!')
  });

}
