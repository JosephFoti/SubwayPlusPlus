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
      console.log(color);

      TweenMax.to($(this),.2,{color:color,backgroundColor:'white',ease:Power2.easeOut});

    })

  })


})
