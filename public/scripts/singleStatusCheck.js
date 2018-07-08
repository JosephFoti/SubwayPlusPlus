console.log('are you single?');

let line = $('.subtitle').text()[0];
let count = 0;

function getStatus(){

  setTimeout(function(){
    $.ajax({
      url:`../data/${line}_statusReport.json`,
      success: report=>{

        $('.status-loader').fadeOut(500);

        setTimeout(function(){

          $('.stop-status-type').text('SERVICE STATUS: ' + report.status);
          $('.stop-status-text').html(report.text);

          $('.stop-status-text').children('br').remove();

        },500)

      },
      error: function(){
        count++;
        console.log('check '+count);
        if (count<10) {
          getStatus();
        } else {
          $('.stop-status-type').text('SERVICE STATUS: UNKNOWN');
        }
      }
    })
  },500);

}

getStatus();
