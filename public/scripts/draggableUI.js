
$('.favorites-container').sortable();


function getNewOrder() {
  let order = [];
  $('.favorites-container').children().each(function(){
    order.push($(this).data('stopid').toString());
  });
  return order
}


$('#editSubmit').click(function(){
  let data = {order:getNewOrder()}

  $.post('/edit',data);
});
