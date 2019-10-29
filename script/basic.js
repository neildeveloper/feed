var corsURL = "https://crossorigin.me/";

function handlebar(template, data){
    var template = Handlebars.compile(template);
    return template(data);
}

function convertTime(timestamp){
    var date = new Date(timestamp * 1000);
    return date.toLocaleTimeString("eh-HK");
}

function showLoading(){
    $('#loading').show();
}

function hideLoading(){
    $('#loading').hide();
}

function GetQueryString(param){
    var url = new URL(document.location.href);
    return url.searchParams.get(param);
}

function initHandlebar(){
    Handlebars.registerHelper('if_eq', function(a, b, opts) {
        if(a == b) // Or === depending on your needs
            return opts.fn(this);
        else
            return opts.inverse(this);
    });
}

function xmlToJson(xml) {
    'use strict';
    // Create the return object
    var obj = {}, i, j, attribute, item, nodeName, old;

    if (xml.nodeType === 1) { // element
        // do attributes
        if (xml.attributes.length > 0) {
            obj["@attributes"] = {};
            for (j = 0; j < xml.attributes.length; j = j + 1) {
                attribute = xml.attributes.item(j);
                obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
            }
        }
    } else if (xml.nodeType === 3) { // text
        obj = xml.nodeValue;
    }
    	else if (xml.nodeType == 4) { // cdata section
		obj = xml.nodeValue
	}

    // do children
    if (xml.hasChildNodes()) {
        for (i = 0; i < xml.childNodes.length; i = i + 1) {
            item = xml.childNodes.item(i);
            nodeName = item.nodeName.replace(/[^a-zA-Z ]/g, "");;
            if ((obj[nodeName]) === undefined) {
                obj[nodeName] = xmlToJson(item);
            } else {
                if ((obj[nodeName].push) === undefined) {
                    old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJson(item));
            }
        }
    }
    return obj;
};

function PushMessage(msg) {
    // Let's check if the browser supports notifications
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
    }
  
    // Let's check whether notification permissions have already been granted
    else if (Notification.permission === "granted") {
      // If it's okay let's create a notification
      var notification = new Notification(msg);
    }
  
    // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(function (permission) {
        // If the user accepts, let's create a notification
        if (permission === "granted") {
          var notification = new Notification(msg);
        }
      });
    }
  
    // At last, if the user has denied notifications, and you 
    // want to be respectful there is no need to bother them any more.
}

function HttpGet(_url, _success, loading=true, dataType='json'){
    $.ajax({
        url: corsURL + encodeURIComponent(_url),
        dataType: dataType,
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

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}