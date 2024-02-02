//javaScript GlobalSetting

$.functionBar = $('#headerFunctionBar');

$.setInfo = function(s,u,k){
	$.session_key = k;

	if(s!=''){
		$.schoolInfo = $.evalJSON($.base64.decode(s));
	}else{
		$.schoolInfo = {};
	}

	if(u!=''){
		if(window.atob) {
			$.userInfo = $.evalJSON(decodeURIComponent(escape(atob(u))));
		} else {
			$.userInfo = $.evalJSON($.base64.decode(u));
		}
	}else{
		$.userInfo = {};
	}
}

$.addBottomFunction = function(options){
	var setting = {
		icon: null
		,label: null
		,execute: null
	};
	$.extend(setting,options);
	const btn = $('<button>').appendTo('#BottomFunctionBar').button({
		label: setting.label
		,icons: {primary: setting.icon}
	}).click(setting.execute);

	if(options.label == 'E-Mail')
		btn.addClass('imEmailBtn');

	return btn;
}

$.operator = {
	EQUAL: "eq"
	,NOT_EQUAL: "ne"
	,LESS_THEN: "lt"
	,LESS_EQUAL: "le"
	,GREATER_THEN: "gt"
	,GREATER_EQUAL: "ge"
	,BEGIN_WITH: "bw"
	,BEGIN_NEITHER: "bn"
	,IN: "in"
	,NOT_IN: "ni"
	,END_WITH: "ew"
	,END_NEITHER: "en"
	,CONTAIN: "cn"
	,NOT_CONTAIN: "nc"
};

$.ajaxSetup({
	contentType: 'application/x-www-form-urlencoded; charset=UTF-8'
	,dataType: 'json'
	,beforeSend: function(xhr,setting){
		if($.session_key == null || $.session_key == 'undefined' || $.session_key == '') return true;
		if(setting.type == 'GET'){
			if(setting.url.indexOf('session_key=')>0){
				return true;
			}else{
				setting.data = {"session_key": $.session_key};
				setting.beforeSend = null;
				$.ajax(setting);
				return false;
			}
		}else{
			var data = setting.data;
			if(data==null || data=='undefined'){
				data = "";
			}
			var type = typeof data;
			if(type == 'object'){
				$.extend(data,{
					"session_key": $.session_key
				});
			}else if(type == 'string'){
				if(data.indexOf('session_key=')>0){
					return true;
				}else{
					if(data.length>0){
						data += "&";
					}
					data += "session_key="+$.session_key;
				}
			}
			setting.data = data;
			setting.beforeSend = null;
			$.ajax(setting);
			return false;
		}
	}
	,cache: false
});


(function($) {
	$.fn.extend({
		setSessionKey : function(){
			return this.each(function(i,obj){
				if($('input[name="session_key"]',$(obj)).length==0){
					$(obj).append('<input type="hidden" name="session_key" value="'+$.session_key+'" />');
				}
			});
		}
	});
})(jQuery);