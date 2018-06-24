$(document).ready(function(){
  console.log('hello!! new string');
  var singles = $('.fav-single').children('.times-wrapper')
  var tempLogin = $('.tempLogin').text();
  console.log(singles);
  console.log(tempLogin);

  if (tempLogin) {

  $.ajax({
    url:`../data/${tempLogin}_favoriteStopTimes.json`,
    success: function(result) {
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
    console.log(data);
  });


}
