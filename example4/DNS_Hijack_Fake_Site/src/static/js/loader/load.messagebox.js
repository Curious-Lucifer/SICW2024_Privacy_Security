$(function(){
	$.parseHtmlMessageTag = function(a){
		var x = $('<div></div>');
		if(typeof(a) == 'string' || typeof(a) == 'number'){
			x.append($('<div>',{text:a}));
		}else if($.isPlainObject(a)){
			//var tags = ['br','div','span','a'];
			var atts = ['id','name','value','text','style','class'];
			//var tag = tags[$.inArray(a.tag,tags)]||'div';
			var tag = 'div';
			if(a.tag == 'br') tag = 'br';
			else if(a.tag == 'span') tag = 'span';
			else if(a.tag == 'a') tag = 'a';

			var p = {};
			atts.forEach(function(x){
				if(x in a) p[x] = a[x];
			})
			var o = $('<'+tag+'>',p).appendTo(x);
			if('item' in a)
				o.append($.parseHtmlMessageTag(a.item));
		}else if(Array.isArray(a)){
			for(var i in a)
				x.append($.parseHtmlMessageTag(a[i]));
		}
		return x.html();
	}
	
	//$.showMsg = function(msg,callback){
//		if(!msg)
//			return;
//
//		var alertMessage = '<div title="訊息"><p class="msgBody" style="font-size: 1.1em;">'
//			+ msg.replace(/\n/g,'<br/>')
//			+ '</p></div>';
//
//		if(callback==null || callback=='undifined'){
//			callback = function(){};
//		}
//
//		return $(alertMessage).dialog({
//			width: 400
//			,modal: true
//			,buttons: {
//				"確定": function(){
//					$(this).dialog('close');
//				}
//			}
//			,close: function(e,ui){
//				$(this).remove();
//				callback();
//			}
//		});
	//};
	
	$.showMsg = function(msg,callback){
		if($.trim(msg) == '' || !('ui' in $)) return;
		msg=$.parseHtmlMessageTag(msg);
		if(msg.length==0) return;

		let alertMessage = $('<div>',{'class':'msgBody',style:'font-size: 1.1em;margin: 10px 0;'}).html(msg);
		const h = document.documentElement.clientHeight;
		if(h && h > 150)
			alertMessage.css('max-height',''+(h-150)+'px');
		alertMessage = $('<div title="訊息"></div>').append(alertMessage);

		if(callback==null || callback=='undifined')
			callback = function(){};

		return alertMessage.dialog({
			width: 400
			,modal: true
			,buttons: [
				{
					text: "確定",
					"class":'btn btn-info',
					click: function() {
						$(this).dialog('close');
					}
				}
			]
			,close: function(e,ui){
				$(this).remove();
				callback();
			}
		});
	};

	$.confirm = function(msg,callback){
		if(!msg)
			return;

		if(callback==null){
			callback = function(yes){
				if(yes) return true;
				else return false;
			}
		}

		var confirmMessage = '<div title="確認"><p class="msgBody" style="font-size: 1.1em;">'
			+ msg.replace(/\n/g,'<br/>')
			+ '</p></div>';

		var yesno = false;
		return $(confirmMessage).dialog({
			width: 400
			,modal: true
			,buttons: {
				"確定": function(){
					yesno = true;
					$(this).dialog('close');
				},
				"取消": function(){
					yesno = false;
					$(this).dialog('close');
				}
			}
			,close: function(e,ui){
				$(this).remove();
				callback(yesno);
			}
		});
	};

	$.showError = function(msg,errorStatus,callback){
		if(!msg)
			return;

		if(errorStatus!='' && errorStatus!=null && errorStatus!='undefined'){
			errorStatus = ":"+errorStatus;
		}else{
			errorStatus = '';
		}

		var errorMessage = '<div title="錯誤'+errorStatus+'"><p class="msgBody" style="font-size: 1.1em;">'
			+ msg.replace(/\n/g,'<br/>')
			+ '</p></div>';

		if(callback==null || callback=='undifined'){
			callback = function(){};
		}

		return $(errorMessage).dialog({
			width: 400
			,modal: true
			,buttons: {
				"關閉": function(){
					$(this).dialog('close');
				}
			}
			,close: function(e,ui){
				$(this).remove();
				callback();
			}
		});
	};

	$.autoMsg = function(msg,options){
		if(!msg)
			return;

		var o = options || {};
		var div = $('<div style="position: fixed;border-radius: 6px;padding: 8px 15px 5px;display: none">'+msg.replace(/\n/g,'<br/>')+'</div>').appendTo('body');
		div.css({'left':o.left || '47%'
			,'top':o.top || '48%'
			,'background-color':o.bgcolor || 'black'
			,'color':o.color || 'white'
			,'font-size':o.fsize || '16px'
			,'font-family':o.ffamily || '微軟正黑體'
			,'font-weight':o.fweight || 'bold'});

		div.show();
		setTimeout(function(){
			div.fadeOut(o.speed || "slow",function(){
				$(this).remove();
			});
		},o.timeout || 500)
	};

	$(document).bind('ajaxSuccess',function(event, xhr, options){
		if(options.dataType=='json'){
			var req = $.evalJSON(xhr.responseText);
			if($.isPlainObject(req)){
				if(req.message!=null && req.message!="")
					$.showMsg(req.message);
			}
		}
	}).bind('ajaxError',function(err, xhr, st){
		if(xhr.readyState == 4){
			var c = document.body.clientHeight;
			if(c){
				if(c > 100) c-= 100;
				c = ''+c+'px';
			}else c = 'auto';

			$.showError(xhr.responseText,"狀態:"+st+"; 描述: "+ xhr.status + " "+xhr.statusText).css("max-height",c);
			//.parent().css({"max-width":"84%","max-height":"84%","top":"8%"});
		}
	}).bind('ajaxComplete',function(event,xhr){
		if(xhr.readyState == 4)
			if(xhr.status=="0"){
				var c = document.body.clientHeight;
				if(c){
					if(c > 100) c -= 100;
					c = ''+c+'px';
				}else c = 'auto';

				$.showError("伺服器無回應","狀態:"+xhr.status).css("max-height",c);
				//.parent().css({"max-width":"84%","max-height":"84%","top":"8%"});
			}
	});
	
	$.alertMessage = function(msg,sec,style){
		if($.trim(msg) == '') return;
		msg=$.parseHtmlMessageTag(msg);
		if(msg.length==0) return;

		//var ss = ['primary','secondary','success','danger','warning','info','light','dark'];
		//style = $.inArray(style,ss);
		//style = 'alert-'+(style < 0?'primary':ss[style]);
		if(style == 'secondary') style = 'secondary';
		else if(style == 'success') style = 'success';
		else if(style == 'danger') style = 'danger';
		else if(style == 'warning') style = 'warning';
		else if(style == 'info') style = 'info';
		else if(style == 'light') style = 'light';
		else if(style == 'dark') style = 'dark';
		else style = 'primary';

		$('.messagebox-alertMessage').remove();
		var alert = '<div class="messagebox-alertMessage alert alert-'+style+' alert-dismissible fade show" role="alert">'
			+'<strong>'+msg+'</strong>'
			//+'<strong>'+msg.replace(/\n/g,'<br/>')+'</strong>'
			+'<button type="button" class="close" data-dismiss="alert" aria-label="Close">'
			+'<span aria-hidden="true">&times;</span>'
			+'</button></div>';

		alert = $(alert).appendTo('body').css({'position':'fixed','min-width':'240px','z-index':'9999'});
		alert.css({
			'top': 'calc(50% - '+(alert.outerHeight()/2)+'px)',
			'left': 'calc(50% - '+(alert.outerWidth()/2)+'px)'
		});

		if(sec){
			setTimeout(function(){
				alert.alert('close');
			},sec);
		}

		return alert;
	}
});