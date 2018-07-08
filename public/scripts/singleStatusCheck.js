console.log('are you single?');

let line = $('.subtitle').text()[0];

$.ajax({
  url:`../data/${line}_statusReport.json`,
  success: report=>{

    $('.stop-status-type').text('SERVICE STATUS: ' + report.status);
    $('.stop-status-text').html(report.text);

    $('.stop-status-text').children('br').remove();

  }
})
