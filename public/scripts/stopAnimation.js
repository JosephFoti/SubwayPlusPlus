$('document').ready(function(){


  function getLastRefresh(favIndex) {

    let date = new Date();
    var hours = date.getHours(),
    minutes = date.getMinutes(),
    seconds = date.getSeconds(),
    ampm = hours >= 12 ? 'pm' : 'am';

    hours = hours % 12;
    hours = hours ? hours : 12;

    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ':' + seconds +' ' + ampm;


    $('.lastRefresh').text('Last refresh | '+strTime);

  }

  getLastRefresh();

    setTimeout(function(){
        $('.loader').fadeOut(500);
    },1200)

    if ($(window).width() > 767) {
      TweenMax.staggerTo($('.northbound').children('li'),1,{marginTop:"10px",delay:.7,ease:Back.easeOut.config(.35)},.25);
      TweenMax.staggerTo($('.southbound').children('li'),1,{marginTop:"10px",delay:1,ease:Back.easeOut.config(.35)},.25);
    } else {
      $('.times-wrapper').children('li').css('opacity','0');
      TweenMax.staggerTo($('.northbound').children('li'),1,{alpha:1,delay:.5},.25)
      TweenMax.staggerTo($('.southbound').children('li'),1,{alpha:1,delay:.5},.25)
    }



});
