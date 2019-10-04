var requestURL = "https://cors-anywhere.herokuapp.com/https://mutemute.com/mutenews/ajax/app-news.php";
var HSIrequestURL = "https://cors-anywhere.herokuapp.com/http://www.aastocks.com/tc/Ajax/AjaxData.ashx?type=index&symbol=HSI";

$(function() {
    initHandlebar();

    var _success = function(result){
        var source  = document.getElementById("template").innerHTML;
        var data = {};

        var result = result.filter(function(item, index, array){
            return item.id != "promo";
        });
        
        $.each(result, function(index, value){
            this.createdAt = convertTime(value.createdAt);
        });

        data.d = result;
        var html = handlebar(source, data);
        $('#content').html(html);
    };
    HttpGet(requestURL, _success);
    
    var _hsi_success = function(result){
        var source  = document.getElementById("index_template").innerHTML;
        var html = handlebar(source, result);
        $('#index').html(html);
    };
    HttpGet(HSIrequestURL, _hsi_success, false);

    setInterval(function(){
        HttpGet(requestURL, _success);
    }, 60000);   


    setInterval(function(){
        HttpGet(HSIrequestURL, _hsi_success, false);
    }, 5000);   

});

function HttpGet(_url, _success, loading=true){
    $.ajax({
        url: _url,
        contentType: 'application/json',
        dataType: 'json',
        method: 'GET',
        beforeSend: function(){
            if(loading) showLoading();
        },
        complete: function(){
            if(loading) hideLoading();
        },
        error: function(xhr, ajaxOptions, thrownError){
            console.log(xhr.status);
            console.log(thrownError);
        },
        success: _success,
    });
}

function handlebar(template, data){
    var template = Handlebars.compile(template);
    return template(data);
}

function convertTime(timestamp){
    var date = new Date(timestamp*1000);
    return date.toLocaleTimeString("eh-HK");
}


function showLoading(){
    $('#loading').show();
}

function hideLoading(){
    $('#loading').hide();
}

function initHandlebar(){
    Handlebars.registerHelper('if_eq', function(a, b, opts) {
        if(a == b) // Or === depending on your needs
            return opts.fn(this);
        else
            return opts.inverse(this);
    });
}