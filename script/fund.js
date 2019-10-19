'use strict';

var timeFormat = 'MM/DD/YYYY HH:mm';

$(function() {

    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
        $(this).toggleClass('active');
    });
    
    $('#ddlfund').select2({
        width: 'resolve',
        maximumInputLength: 5
    });

    $('#ddlfund').on('select2:select', function (e) { 
        plot();
    });
})


function plot(){
    var data = [];
    var calls = [];

    var _success = function(result){
        var vdata = {};
        var _d = csvJSON(result.contents);
        var _fund = Object.keys(_d[0])[0];
        var _value = Object.keys(_d[0])[1];

        $.each(_d, function(index, value){
             
            if (value[Object.keys(_d[0])[1]] != "undefined"){
                vdata[index] = { 
                    date : new Date(value[_fund]), 
                    BID : value[_value]
                };
            }
        });

        data.push({ name: _fund , value: vdata });
    };

    var funds = $('#ddlfund').val();
    $.each(funds, function(index, value){
        calls.push($.ajax(corsURL + encodeURIComponent(getFundUrl(value)), {
            success: _success
        }));
    });
    
    showLoading();
    $.when.apply($, calls)
    .done(function(){
        var dataset = [];
        $.each(data, function(index, value){
            var BID = $.map(value.value, function(item){
                if (item.BID != "undefined"){
                    return item.BID;
                }
            });

            dataset.push({ data: BID, label: value.name, borderColor: '#'+(Math.random()*0xFFFFFF<<0).toString(16), fill: false });
        });

        var ctx = document.getElementById('myChart').getContext('2d');
        var myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: $.map(data[0].value, function(item){
                    return item.date;
                }),
                datasets: dataset
            },
            options: {
                scales: {
                    xAxes: [{
                        type: 'time',
                        time: {
                            parser: timeFormat,
                            // round: 'day'
                            tooltipFormat: 'll HH:mm'
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Date'
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            // min: Math.round(Math.min.apply(this, dataset[0].data) - 2),
                            // max: Math.round(Math.max.apply(this, dataset[0].data) + 2),
                            // stepSize: 0.5
                            // beginAtZero: true
                        }
                    }]
                }
            }
        });
    })
    
    .always(function(){
        hideLoading();
    })
    .fail(function(){
        console.log('error');
    });
}


function csvJSON(csv){

    var lines=csv.split("\n");
  
    var result = [];
  
    var headers=lines[0].split(",");
  
    for(var i=1;i<lines.length;i++){
  
        var obj = {};
        var currentline=lines[i].split(",");
  
        for(var j=0;j<headers.length;j++){
            var temp  = currentline[j] + "";
            obj[headers[j]] = temp.trim();
        }
  
        result.push(obj);
  
    }
  
    return result; //JavaScript object
    // return JSON.stringify(result); //JSON
}


function getPreviousWorkday(){
    let workday = moment();
    let day = workday.day();
    let diff = 1;  // returns yesterday
    if (day == 0 || day == 1){  // is Sunday or Monday
      diff = day + 2;  // returns Friday
    }
    return workday.subtract(diff, 'days');
}


function getFundUrl(code){
    var enddate = moment(getPreviousWorkday().subtract(1, 'days')).format('YYYY-MM-DD');
    var startdate = moment(getPreviousWorkday().subtract(2, 'months')).format('YYYY-MM-DD');
    //GBA

    return 'https://rbwm-api.hsbc.com.hk/digital-pws-tools-mpf-eapi-prod-proxy/v1/mpf/unit-prices/download/HSBCTRUSTPLUS?' 
    + 'fund='+code+'&startDate='+startdate+'&endDate='+enddate+'&locale=zh_HK';
}