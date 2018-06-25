$('document').ready(function(){


  function getLastRefresh() {

    let date = new Date();
    var hours = date.getHours(),
    minutes = date.getMinutes(),
    ampm = hours >= 12 ? 'pm' : 'am';

    hours = hours % 12;
    hours = hours ? hours : 12;

    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;

    $('.lastRefresh').text('Last refresh was at '+strTime);

  }

  getLastRefresh();

    setTimeout(function(){
        $('.loader').fadeOut(500);
    },1200)

    TweenMax.staggerTo($('.northbound').children('li'),1,{marginTop:"10px",delay:.7,ease:Back.easeOut.config(.35)},.25);
    TweenMax.staggerTo($('.southbound').children('li'),1,{marginTop:"10px",delay:1,ease:Back.easeOut.config(.35)},.25);

});
