
var requestURL = "https://mutemute.com/mutenews/ajax/app-news.php";
var HSIrequestURL = "http://www.aastocks.com/tc/Ajax/AjaxData.ashx?type=index&symbol=HSI";
var stockrequestRUL = "http://money18.on.cc/js/real/hk/quote/01299_r.js";

var last_uid = "";
var notification = true;

// Money18
// index
// http://realtime-money18-cdn.on.cc/js/real/index/index_all_r.js
// stock
// http://money18.on.cc/securityQuote/genStockXMLHKWithDelay.php?stockcode=00700,01299,00175
// http://money18.on.cc/js/real/hk/quote/01521_r.js



$(function() {

    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
        $(this).toggleClass('active');
    });


    initHandlebar();

    GenNews();
    GenIndexFigure();
    GenStockFigure();

    // GetStock();

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


function GenIndexFigure(Interval = 5000){
    var _success = function(result){
        var source  = document.getElementById("index_template").innerHTML;
        var html = handlebar(source, result);
        $('#index-content').html(html);
    };

    HttpGet(HSIrequestURL, _success, loading = false);
    setInterval(function(){
        HttpGet(HSIrequestURL, _success, loading = false);
    }, Interval);   
}


function GenNews(Interval = 60000){
    var _success = function(result){
        var source  = document.getElementById("news_template").innerHTML;
        var data = {};

        var result = result.filter(function(item, index, array){
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

    HttpGet(requestURL, _success);
    setInterval(function(){
        HttpGet(requestURL, _success);
    }, Interval);   
}


function GenStockFigure(Interval = 5000){
    var code = GetQueryString("code");
    var requestURL = "http://money18.on.cc/securityQuote/genStockXMLHKWithDelay.php?stockcode=" + code;

    var _success = function(result){
        var source  = document.getElementById("stock_template").innerHTML;
        var data = xmlToJson(result);
        $.each(data.quote.stock, function(index, value){
            if(this.change.text < 0)
                this.Sign = "-";
            else if (this.change.text > 0)
                this.Sign = "+";
        });
        var html = handlebar(source, data);
        $('#stock-content').html(html);
    };

    HttpGet(requestURL, _success, loading = false, dataType = "xml");
    setInterval(function(){
        HttpGet(requestURL, _success, loading = false, dataType = "xml");
    }, Interval);   
}
