$(document).ready(function(){
  console.log('hello!! new string');
  var singles = $('.fav-single').children('.times-wrapper')
  var tempLogin = $('.tempLogin').text();
  console.log(singles);

  if (tempLogin) {

  $.ajax({
    url:`../data/${tempLogin}_favoriteStopTimes.json`,
    success: function(result) {
      var result = result['favorites'];
      let html = '';
      for (let i=0;i < result.length;i++) {
        if (!result[i]['station']) {
          break;
        }
         html += `<ul class="time-container uptown">`
        for (let j=0; j<3; j++) {
          html += `<li class="time-item">${result[i]['station'][0]['est'][j]}</li>`
        }
          html += `</ul>`

          html += `<ul class="time-container downtown">`
        for (let j=0; j<3; j++) {
          html += `<li class="time-item">${result[i]['station'][1]['est'][j]}</li>`
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
      url:'../data/favoriteStopTimes.json',
      success: function(result) {
        var result = result['favorites'];
        let html = '';
        for (let i=0;i < result.length;i++) {
          console.log('checking result '+i)
          if (!result[i]['station']) {
            break;
          }
           html += `<ul class="time-container uptown">`
          for (let j=0; j<3; j++) {
            html += `<li class="time-item">${result[i]['station'][0]['est'][j]}</li>`
          }
            html += `</ul>`

            html += `<ul class="time-container downtown">`
          for (let j=0; j<3; j++) {
            html += `<li class="time-item">${result[i]['station'][1]['est'][j]}</li>`
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
  },5000);


}

})
