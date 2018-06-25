$(document).ready(function(){
  console.log('hello!! new string');
  var singles = $('.fav-single').children('.times-wrapper')
  var tempLogin = $('.tempLogin').text();
  console.log(singles);
  console.log(tempLogin);

  function getLastRefresh(favIndex) {

    let date = new Date();
    var hours = date.getHours(),
    minutes = date.getMinutes(),
    ampm = hours >= 12 ? 'pm' : 'am';

    hours = hours % 12;
    hours = hours ? hours : 12;

    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;

    if (favIndex > 0) {
      $('.fav-refresh').eq([favIndex]).text('Last refresh was at '+strTime);
    } else {
      $('.fav-refresh').text('Last refresh | '+strTime);
    }

  }

  $.ajax({
    url:`../data/${tempLogin}_favoriteStopTimes.json`,
    success: function(result) {
      console.log('initiall ajax call');
      var result = result['favorites'];
      console.log(result['stopId'])
      let html = '';
      for (let i=0;i < result.length;i++) {
        if (!result[i]['station']) {
          break;
        }
         html += `<ul class="time-container uptown"><h3 class="station-type">Uptown</h3>`
        for (let j=0; j<3; j++) {
          html += `<li class="time-item line-type-${result[i]['stopId'][0]}">${result[i]['station'][0]['est'][j]}</li>`
        }
          html += `</ul>`

          html += `<ul class="time-container downtown"><h3 class="station-type">Downtown</h3>`
        for (let j=0; j<3; j++) {
          html += `<li class="time-item line-type-${result[i]['stopId'][0]}">${result[i]['station'][1]['est'][j]}</li>`
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
            break;
          }
           html += `<ul class="time-container uptown"><h3 class="station-type">Uptown</h3>`
          for (let j=0; j<3; j++) {
            html += `<li class="time-item line-type-${result[i]['stopId'][0]}">${result[i]['station'][0]['est'][j]}</li>`
          }
            html += `</ul>`

            html += `<ul class="time-container downtown"><h3 class="station-type">Downtown</h3>`
          for (let j=0; j<3; j++) {
            html += `<li class="time-item line-type-${result[i]['stopId'][0]}">${result[i]['station'][1]['est'][j]}</li>`
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
