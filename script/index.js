// mutemute
// https://mutemute.com/mutenews/ajax/app-news.php

// Money18
// index
// http://realtime-money18-cdn.on.cc/js/real/index/index_all_r.js
// stock
// http://money18.on.cc/securityQuote/genStockXMLHKWithDelay.php?stockcode=00700,01299,00175
// http://money18.on.cc/js/real/hk/quote/01521_r.js
// http://money18.on.cc/js/daily/hk/quote/01521_d.js

// AAStock
// index
// http://www.aastocks.com/tc/Ajax/AjaxData.ashx?type=index&symbol=HSI


var last_uid = "";
var notification = true;

$(function() {

    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
        $(this).toggleClass('active');
    });


    initHandlebar();

    GenNews();
    GenIndex();
    GenStock();

    // var call1 = function fn1(){
    //     var deferred = $.Deferred();
    //     setTimeout(function(){
    //         console.log("1000 done");
    //         deferred.resolve();
    //     }, 1000);
    //     return deferred.promise();
    // };
    // var call2 = function fn1(){
    //     var deferred = $.Deferred();
    //     setTimeout(function(){
    //         console.log("1500 done");
    //         deferred.resolve();
    //     }, 1000);
    //     return deferred.promise();
    // };

    // var calls = [call1, call2];


    //     // $.when(fn1(), fn2()).done(function(){
    //     $.when.apply($, calls)
    //     .done(function(){
    //         console.log('success'); // 都resolve() success
    //     })
    //     .fail(function(){
    //         console.log('error'); // 有一個reject() error
    //     });



})


// var _stock_success = [];
// function GetStock(){

//     var url = new URL(document.location.href);
//     var searchParams = url.searchParams.get('code');
//     if(searchParams == null) return;
//     var params = searchParams.split(",");

//     var _calls = [];
//     $.each(params, function(index, value){
//         _calls.push(GetStockByCode(value));
//     });

//     $.when.apply($, _calls)
//     .done(function(){
//         console.log('success');
//         console.log(_stock_success);
//     })
//     .fail(function(){
//         console.log('error');
//     });

// }

// function GetStockByCode(code){

//     var stockrequestRUL = "http://money18.on.cc/js/real/hk/quote/{code}_r.js";
//     var $d = $.Deferred();

//     var result = AsyncHttpGet(stockrequestRUL, code);
//     _stock_success.push(result);
//     $d.resolve();

//     return $d.promise();
// }


// var M18 = {};
// function AsyncHttpGet(_url, code){
//     // M18["r_" + code];
//     // $.ajax({
//     //     url: _url.replace("{code}", code),
//     //     dataType: 'script',
//     //     method: 'GET',
//     //     success: function(data){
//     //         eval(data);
//     //         return M18["r_" + code];
//     //     },
//     // });

//     $.ajax({
//         url: corsURL + _url.replace("{code}", code),
//         dataType: 'text',
//         method: 'GET',
//         success: function(data){
//             return data;
//         },
//     });

// }

function GenIndex(Interval = 10000){
    var M18 = {};
    var _url = "http://realtime-money18-cdn.on.cc/js/real/index/index_all_r.js";
    var _success = function(result){
        eval(result.contents);
        $.each(M18, function(index, value){
            if(index == "r_HSI" || index == "r_SSECI"){
                if(value.difference >= 0) value.Sign = "+";
                else value.sign = "-";

                value.change = (Math.round(value.difference / value.pc * 10000) / 100) + "%" ;
            }
        });
        
        var source  = document.getElementById("index_template").innerHTML;
        var html = handlebar(source, M18);
        $('#index-content').html(html);
    };

    HttpGet(_url, _success, loading = false);
    setInterval(function(){
        HttpGet(_url, _success, loading = false);
    }, Interval); 
}


function GenNews(Interval = 60000){
    var _url = "https://mutemute.com/mutenews/ajax/app-news.php";
    var _success = function(result){
        var source  = document.getElementById("news_template").innerHTML;
        var data = {};

        result = JSON.parse(result.contents);
        result = result.filter(function(item, index, array){
            return item.id != "promo";
        });
        
        $.each(result, function(index, value){
            this.createdAt = convertTime(value.createdAt);
        });

        if(last_uid != "" && last_uid != result[0].uid){
            if(notification) PushMessage(result[0].content);
        }

        last_uid = result[0].uid;
        data.d = result;
        var html = handlebar(source, data);
        $('#news-content').html(html);
    };

    HttpGet(_url, _success);
    setInterval(function(){
        HttpGet(_url, _success);
    }, Interval);   
}


function GenStock(Interval = 10000){
    var code = GetQueryString("code");
    if (code == null) return;
    var _url = "http://money18.on.cc/securityQuote/genStockXMLHKWithDelay.php?stockcode=" + code;

    var _success = function(result){
        var source  = document.getElementById("stock_template").innerHTML;

        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(result.contents, "text/xml");
        var data = xmlToJson(xmlDoc);
        $.each(data.quote.stock, function(index, value){
            if(this.change.text < 0)
                this.Sign = "-";
            else if (this.change.text > 0)
                this.Sign = "+";
        });
        var html = handlebar(source, data);
        $('#stock-content').html(html);
    };

    HttpGet(_url, _success, loading = false);
    setInterval(function(){
        HttpGet(_url, _success, loading = false);
    }, Interval);   
}
