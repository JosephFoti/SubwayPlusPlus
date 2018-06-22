$(document).ready(function(){
  console.log('hello!!');
  var singles = $('.fav-single').children('.times-wrapper')


  $.ajax({
    url:'../data/favoriteStopTimes.json',
    success: function(result) {
      console.log(result);
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
      console.log(html);
    }
  });


  setInterval(function(){
    $.ajax({
      url:'../data/favoriteStopTimes.json',
      success: function(result) {
        console.log(result);
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
        console.log(html);
      }
    });
  },15000);



})
