$('document').ready(function(){

  var stop = $('.lineWrap').children().children();
  console.log(stop);
  TweenMax.staggerTo($(stop),.25,{alpha:1,marginTop:"5px"},.05);
  TweenMax.to($('.hp-banner'),.75,{delay:2,height:"63px",borderBottomColor:"#828282",ease:Circ.easeOut});

  $(stop).each(function(){

    $(this).mouseenter(function(){

      TweenMax.to($(this),.25,{boxShadow:"0px 0px 10px -1px #b6b6b6",scale:1.05});

    })

    $(this).mouseleave(function(){

      const color = $(this).data('color');
      console.log(color);

      TweenMax.to($(this),.25,{boxShadow:"0px 0px 0px 0px white",scale:1});

    })

  })


})
