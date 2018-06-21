$(document).ready(function(){
  console.log('hello!!');
  setInterval(function(){
    $.ajax({
      url:'../data/favoriteStopTimes.json',
      success: function(result) {
        console.log(result.station);
      }
    });
  },1000);



})
