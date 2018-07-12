$('.favorites-container').sortable();

var lastSavedOrder = getNewOrder().toString();
console.log(lastSavedOrder);

function getNewOrder() {

  // Loop through the favorited objects and collect their stop ids in order
  let order = [];
  $('.favorites-container').children().each(function() {
    if ($(this).data('stopid')) order.push($(this).data('stopid').toString());
  });
  return order

}

function checkOrder() {

  // short delay to ensure dom rerenders for the new getOrder
  return lastSavedOrder === getNewOrder().toString() ? true : false;

}

$('.favorites-container').children().mouseup(function(){

  setTimeout(function(){
    console.log(lastSavedOrder + ' -last saved');
    console.log(getNewOrder().toString()+ ' -new order');
    if (!checkOrder()) {
      console.log('order different');
      TweenMax.to($('#editSubmit'),.5,{alpha:1});
      $('#editSubmit').css('cursor','pointer');
    } else {
      console.log('order same');
      TweenMax.to($('#editSubmit'),.5,{alpha:.3});
      $('#editSubmit').css('cursor','default');
    }
  },250)

})

let alertReturn = null;

function getAlert(text, color, height='60px') {

  if (alertReturn !== null) {
    clearTimeout(alertReturn);
    alertReturn = null;
  }

  $('.alert-box').text(text).css({'color':color,'borderColor':color});

  TweenMax.to($('.alert-box'), .5, {
    height: height,
    padding: '20px',
    borderWidth: '1px'
  });

  alertReturn = setTimeout(function(){
    TweenMax.to($('.alert-box'), .5, {
      delay: 10,
      height: '0px',
      padding: '0px',
      borderWidth: '1px'
    });
  },10000);


}

$('#editSubmit').click(function() {
  console.log('submit');
  let newOrder = getNewOrder()
  let data = {
    order: newOrder
  };

  $.post('/edit', data, function(data2) {
    console.log(data2);
  },'json').done(function(){
    getAlert('Order updated successfully','#7EBF8F');
    lastSavedOrder = getNewOrder().toString;
  }).fail(function(){
    getAlert('Yikes, something went wrong. Could not set new order.','#FA9B80')
  })

});

$('.remove-button').click(function(){
  let index = $(this).data('index');
  let stopName = $(this).siblings('.fav-stop-name').text();
  console.log(index);

  $('#deleter-target').attr('value',index);
  getAlert(`Remove ${stopName} from your favorites?`,'#798BC6','72px')
  $('.alert-box').append('<button type="button" class="double-check" onClick=submitDelete()>Confirm</button>');
})

function submitDelete() {
  $('.hidden-deleter').submit();
};
