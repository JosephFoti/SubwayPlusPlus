
var pageRefresher = function(){
  setTimeout(function () {
    return location.reload();
  }, 500);
}

setTimeout(function(){
  $('.loader').fadeIn(500);
  TweenMax.staggerTo($('.northbound').children('li'),1,{marginTop:"100px",ease:Back.easeIn.config(.35)},.25);
  TweenMax.staggerTo($('.southbound').children('li'),1,{marginTop:"100px",ease:Back.easeIn.config(.35),onComplete:pageRefresher},.25);

},60000);
