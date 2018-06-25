$('document').ready(function(){

  let timestamp = new Date();


  function toPeriodFormat(date) {
    var hours = date.getHours(),
    minutes = date.getMinutes(),
    ampm = hours >= 12 ? 'pm' : 'am';

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;

    return strTime;
  }

  timestamp = toPeriodFormat(timestamp);
  console.log(timestamp);

  

    TweenMax.staggerTo($('.northbound').children('li'),1,{marginTop:"10px",delay:.7,ease:Back.easeOut.config(.35)},.25);
    TweenMax.staggerTo($('.southbound').children('li'),1,{marginTop:"10px",delay:1,ease:Back.easeOut.config(.35)},.25);

});
