$(function() {

    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
        $(this).toggleClass('active');
    });

    $('#tag').select2({
        width: 'resolve',
        tags: true,
        maximumInputLength: 5,
        "language": {
            "noResults": function(){
                return "@";
            }
        },  
        createTag: function (params) {
            var term = $.trim(params.term);
        
            if (term === '') {
              return null;
            }
        
            return {
              id: pad(term, 5),
              text: pad(term, 5),
              newTag: true
            }
        }
    });

    var local = localStorage["tag"].split(',');

    console.log(local);
    $.each(local, function(index, value){
        var newOption = new Option(value, value, false, true);
        $('#tag').append(newOption).trigger('change');
    });

    $('#tag').on('select2:select', function (e) { 
        localStorage["tag"] = $('#tag').val();
        GetStock();
    });

    initHandlebar();
    
    GenIndex();
    GetStock();
    setInterval(function(){
        GetStock();
    }, 10000); 

})

var _M18 = {};
function GetStock(){

    var M18 = {};
    var calls = [];
    var tags = $('#tag').val();
    // var value = "00700";
    // tags = ["00700","01299"];
    $.each(tags, function(index, value){
        var d_url = "http://money18.on.cc/js/daily/hk/quote/" + value + "_d.js";
        var r_url = "http://money18.on.cc/js/real/hk/quote/" + value + "_r.js";

        var _success = function(result){
            eval(result.contents);
        };
    
        calls.push($.ajax(corsURL + encodeURIComponent(d_url), {
                success: _success
            })
        );
        calls.push($.ajax(corsURL + encodeURIComponent(r_url), {
                success: _success
            })
        );
    });

    $.when.apply($, calls)
    .done(function(){
        
        var result = {};
        $.each(tags, function(index, value){
            var sign, direction = "unchange";
            if(M18["r_" + value].ltp > M18["d_" + value].preCPrice) sign = "+";
            else if(M18["r_" + value].ltp < M18["d_" + value].preCPrice) sign = "-";

            if (typeof _M18["r_" + value] !== "undefined"){
                if(M18["r_" + value].ltp > _M18["r_" + value].ltp) direction = "up";
                else if(M18["r_" + value].ltp < _M18["r_" + value].ltp) direction = "down";
            }

            result[index] = { 
                code: value, 
                name: M18["d_" + value].name,
                rsi10: M18["d_" + value].rsi10,
                rsi14: M18["d_" + value].rsi14,
                rsi20: M18["d_" + value].rsi20,
                dyh: M18["r_" + value].dyh,
                dyl: M18["r_" + value].dyl,
                ltp: M18["r_" + value].ltp,
                tvr: unit(M18["r_" + value].tvr),
                vol: M18["r_" + value].vol,
                preCPrice: M18["d_" + value].preCPrice,
                change: parseFloat(Math.round((M18["r_" + value].ltp - M18["d_" + value].preCPrice) * 100) / 100).toFixed(3),
                sign: sign,
                changeP: (Math.round(((M18["r_" + value].ltp - M18["d_" + value].preCPrice) / M18["d_" + value].preCPrice) * 10000) / 100) + '%',
                direction: direction
            }
        });

        var data = {};
        data.result = result;
        var source  = document.getElementById("stock_template").innerHTML;
        var html = handlebar(source, data);
        $('#stock-content').html(html);
        _M18 = M18;
    })
    .fail(function(){
        console.log('error');
    });

}

function unit(value){
    if(value / 1000000000 > 1){
        value = Math.round(value / 1000000000 * 100) /100 + 'B';
    }
    else if(value / 1000000 > 1){
        value = Math.round(value / 1000000 * 100) /100 + 'M';
    }
    else if(value / 1000 > 1){
        value = Math.round(value / 1000 * 100) /100 + 'K';
    }
    return value;
}

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
