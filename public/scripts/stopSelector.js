$('document').ready(function(){

  // set container for global storage
  var stopData;

  // get json from ajax
  $.ajax({
    url:'./get-stops',
    success:function(result){
      console.log('i got the stops');
      stopData = JSON.parse(result);
    },
    failure:function(result){
      // console.log('no stop information');
      stopData = undefined;
    }
  });



  // set onchange for line selector
  $('.line-selector').change(e=>{

    if ($('.line-selector').hasClass('alert')) {
      $('.line-selector').removeClass('alert');
    }

    let lineName = e.target.value;

    // console.log(stopData);
    if (stopData) {
      console.log('stops checked');
      let newStops = stopData[`line${lineName}`];
      let html = '';
      for (stop of newStops) {
        let stopName = stop[1].split(' ').join('%20');
        html += `<option value=${stop[0]},${stopName}>${stop[1]}</option>`;
      }
      document.body.getElementsByClassName('stops')[0].innerHTML = html
    }
  })

  $('.stops').change(function(event) {
    if ($('.stops').hasClass('alert')) {
      $('.stops').removeClass('alert');
    }
  });

});

$('.favorite-selector').children('button').click(e=>{

  e.preventDefault();

  let lineName = $('.line-selector').val();
  let stopName = $('.stops').val();

  if (lineName === null && lineName === null) {
    $('.line-selector').addClass('alert');
    $('.stops').addClass('alert');
    return
  }
  if (lineName === null) return $('.line-selector').addClass('alert');
  if (stopName === null) return $('.stops').addClass('alert');
  console.log(lineName);
  console.log(stopName);
  $('.favorite-selector').submit();
  return true;

})
