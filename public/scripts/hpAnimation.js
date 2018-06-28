$('document').ready(function(){


  var opener = new TimelineMax()

  TweenMax.staggerTo($('.line-name'),.25,{alpha:1,marginLeft:"0px"},.05);
  TweenMax.staggerTo($('.line-name'),.25,{borderWidth:'5px',delay:.3},.05);

  $('.line-name').each(function(){

    let dataColor = $(this).css('color');
    this.dataset.color = dataColor;

    $(this).mouseenter(function(){

      const color = $(this).data('color');
      TweenMax.to($(this),.2,{backgroundColor:color,color:'white',ease:Power2.easeOut});

    })

    $(this).mouseleave(function(){

      const color = $(this).data('color');
      TweenMax.to($(this),.2,{color:color,backgroundColor:'white',ease:Power2.easeOut});

    })

  })

  // Mobile Favorites Menus

  $('.fav-menu').click(function(){

    let color = $(this).siblings('.fav-line-name').css('border-color');

    $(this).siblings('.mobile-buttons-container').css('background-color',color);

    if ($(this).hasClass('open')) {
      $(this).removeClass('open');
      TweenMax.to($(this).siblings('.mobile-buttons-container'),.5,{height:"0px",ease:Power2.easeOut,delay:.25})
      TweenMax.to($(this),.25,{rotation:0,ease:Back.easeOut.config(1.2)});
    } else {
      $(this).addClass('open');
      TweenMax.to($(this).siblings('.mobile-buttons-container'),.5,{height:"50px",ease:Power2.easeOut,delay:.25})
      TweenMax.to($(this),.5,{rotation:90,ease:Back.easeOut.config(1.2)});
    }

  })



})
