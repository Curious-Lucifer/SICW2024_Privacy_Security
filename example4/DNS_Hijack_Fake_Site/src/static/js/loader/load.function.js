jQuery.extend( {
	/**
	 * @see  將json字串轉換為物件
	 * @param   json字串
	 * @return 回傳object,array,string物件
	 */
	evalJSON : function(strJson) {
		if (strJson == null || strJson == "" || strJson.length < 1)
			return null;
		else if (strJson == 'undefined')
			return 'undefined';

		if(strJson.length > 10 && (strJson.substring(0,4) == '<pre' || strJson.substring(0,5) == '<body'))
			strJson = $(strJson).html();

		if(strJson.charCodeAt(0) > 127) strJson = '{}';

		if ("ActiveXObject" in window) {
			var xml = new ActiveXObject("Microsoft.XMLDOM");
			xml.loadXML(strJson);
			if (xml.text == "")
				return eval("(" + strJson + ")");
			else
				return eval("(" + xml.text + ")");
		} else {
			return eval("(" + strJson + ")");
		}
	},
	/**
	 * @see  將javascript數據類型轉換為json字串
	 * @param 待轉換對象,支援object,array,string,function,number,boolean,regexp
	 * @return 回傳json字串
	 */
	toJSON : function(object) {
		var type = typeof object;
		if ('object' == type) {
			if (Array == object.constructor)
				type = 'array';
			else if (RegExp == object.constructor)
				type = 'regexp';
			else
				type = 'object';
		}
		switch (type) {
		case 'undefined':
		case 'unknown':
			return;
			break;
		case 'function':
		case 'boolean':
		case 'regexp':
			return object.toString();
			break;
		case 'number':
			return isFinite(object) ? object.toString() : 'null';
			break;
		case 'string':
			return '"' + object.replace(/(\\|\")/g, "\\$1").replace(
					/\n|\r|\t/g,
					function() {
						var a = arguments[0];
						return (a == '\n') ? '\\n' : (a == '\r') ? '\\r'
								: (a == '\t') ? '\\t' : ""
					}) + '"';
			break;
		case 'object':
			if (object === null)
				return 'null';
			var results = [];
			for ( var property in object) {
				var value;
				if (object[property] == null) {
					value = 'null';
				} else {
					value = jQuery.toJSON(object[property]);
				}
				if (value !== undefined)
					results.push(jQuery.toJSON(property) + ':' + value);
			}
			return '{' + results.join(',') + '}';
			break;
		case 'array':
			var results = [];
			for ( var i = 0; i < object.length; i++) {
				var value = jQuery.toJSON(object[i]);
				if (value !== undefined)
					results.push(value);
			}
			return '[' + results.join(',') + ']';
			break;
		}
	},
	json2xml : function(o) {
		var toXml = function(v, name, ind) {
			var xml = "";
			if (v instanceof Array) {
				for ( var i = 0, n = v.length; i < n; i++)
					xml += toXml(v[i], name, ind + "");
			} else if (typeof (v) == "object") {
				var hasChild = false;
				xml += ind + "<" + name;
				for ( var m in v) {
					if (m.charAt(0) == "@")
						xml += " " + m.substr(1) + "=\"" + v[m].toString()
								+ "\"";
					else
						hasChild = true;
				}
				xml += hasChild ? ">\n" : "/>";
				if (hasChild) {
					for ( var m in v) {
						if (m == "#text")
							xml += makeSafe(v[m]);
						else if (m == "#cdata")
							xml += "<![CDATA[" + lines(v[m]) + "]]>";
						else if (m.charAt(0) != "@")
							xml += toXml(v[m], m, ind + "\t");
					}
					xml += (xml.charAt(xml.length - 1) == "\n" ? ind : "")
							+ "</" + name + ">\n";
				}
			} else { // added special-character transform, but this needs to be better handled [micmath]
				xml += ind + "<" + name + ">" + makeSafe((v||'').toString()) + "</"
						+ name + ">\n";
			}
			return xml;
		}, xml = "";

		for ( var m in o) {
			xml += toXml(o[m], m, "");
		}

		return xml;

		function lines(str) {
			// normalise line endings, all in file will be unixy
			str = str.replace(/\r\n/g, '\n');
			return str;
		}

		function makeSafe(str) {
			// xml special charaters
			str = str.replace(/</g, '&lt;').replace(/&/g, '&amp;');
			return lines(str);
		}
	},
	xml2json : function(xml, extended) {
		if (!xml) return {}; // quick fail

		function parseXML(node, simple) {
			if (!node) return null;
			var txt = '', obj = null, att = null;
			var nt = node.nodeType, nn = jsVar(node.localName || node.nodeName);
			var nv = node.text || node.nodeValue || '';

			if (node.childNodes) {
				if (node.childNodes.length > 0) {
					$.each(node.childNodes,function(n, cn) {
						var cnt = cn.nodeType, cnn = jsVar(cn.localName || cn.nodeName);
						var cnv = cn.text || cn.nodeValue || '';
						if (cnt == 8) {
							return;
						} else if (cnt == 3 || cnt == 4 || !cnn) {
							if (cnv.match(/^\s+$/)) {
								return;
							};
							txt += cnv.replace(/^\s+/,'').replace(/\s+$/,'');
						} else {
							obj = obj || {};
							if (obj[cnn]) {
								if (!obj[cnn].length) obj[cnn] = myArr(obj[cnn]);
								obj[cnn] = myArr(obj[cnn]);

								obj[cnn][obj[cnn].length] = parseXML(cn,true);
								obj[cnn].length = obj[cnn].length;
							} else {
								obj[cnn] = parseXML(cn);
							};
						};
					});
				};
			};
			if (node.attributes) {
				if (node.attributes.length > 0) {
					att = {};
					obj = obj || {};
					$.each(node.attributes,function(a, at) {
						var atn = jsVar(at.name), atv = at.value;
						att[atn] = atv;
						if (obj[atn]) {
							obj[cnn] = myArr(obj[cnn]);

							obj[atn][obj[atn].length] = atv;
							obj[atn].length = obj[atn].length;
						} else {
							obj[atn] = atv;
						}
						;
					});
				};
			};
			if (obj) {
				obj = $
						.extend((txt != '' ? new String(txt): {}),obj || {});
				txt = (obj.text) ? (typeof (obj.text) == 'object' ? obj.text : [ obj.text || '' ]).concat( [ txt ]) : txt;
				if (txt) obj.text = txt;
				txt = '';
			};
			var out = obj || txt;
			if (extended) {
				if (txt) out = {};
				txt = out.text || txt || '';
				if (txt) out.text = txt;
				if (!simple) out = myArr(out);
			};
			return out;
		};

		var jsVar = function(s) {
			return String(s || '').replace(/-/g, "_");
		};

		function isNum(s) {
			var regexp = /^((-)?([0-9]+)(([\.\,]{0,1})([0-9]+))?$)/
			return (typeof s == "number") || regexp.test(String((s && typeof s == "string") ? jQuery.trim(s): ''));
		};

		var myArr = function(o) {
			if (!$.isArray(o)) o = [ o ];
			o.length = o.length;
			return o;
		};
		if (typeof xml == 'string') xml = $.text2xml(xml);

		if (!xml.nodeType) return;
		if (xml.nodeType == 3 || xml.nodeType == 4) return xml.nodeValue;

		var root = (xml.nodeType == 9) ? xml.documentElement : xml;
		var out = parseXML(root, true /* simple */);

		xml = null;
		root = null;

		return out;
	},
	text2xml : function(str) {
		var out;

		try {
			if("DOMParser" in window){
				var xml = new DOMParser();
				xml.async = false;
				out = xml.parseFromString(str, "text/xml")
			}else if("ActiveXObject" in window){
				var xml = new ActiveXObject("Microsoft.XMLDOM");
				xml.async = false;
				out = (xml.loadXML(str)) ? xml : false;
			}
		} catch (e) {
			throw new Error("Error parsing XML string");
		};
		return out;
	},
	postJSON : function(url, data, callback) {
		return jQuery.post(url, data, callback, "json");
	},
	data2Form : function(data, formid) {
		if (data) {
			for ( var i in data) {
				if ($(formid).find("[name='" + i + "']").is("input:radio")
						|| $(formid).find("[name='" + i + "']").is("input:checkbox")) {
					$(formid).find("[name='" + i + "']").each(function() {
						if ($(this).val() == data[i]) {
							$(this).prop("checked", "checked");
						} else {
							$(this).prop("checked", "");
						}
					});
				} else if ($(formid).find("[name='" + i + "']").is("a")) {
					$(formid).find("[name='" + i + "']").text(data[i]);
				} else {
					$(formid).find("[name='" + i + "']").val(data[i]).change();
				}
			}
		}
	},
	log : function(msg, obj) {
		if (typeof console != "undefined") {
			if (obj != null && obj != "undefined")
				console.log("%s: %o", msg, obj);
			else
				console.log(msg);
		}
	},
	isNone : function(obj, val) {
		if (val == null) {
			if (typeof (obj) == 'undefined' || obj == null)
				return true;
			else
				return false;
		} else {
			if (typeof (obj) == 'undefined' || obj == null)
				return val;
			else
				return obj;
		}
	},
	toSelectOptions : function(select, options, clear) {
		if (clear == null || clear) {
			$(select).html('');
		}
		var type = typeof options;
		if (type == 'string') {
			var array = options.split(';');
			for ( var i in array) {
				var opt = $('<option></option>');
				var idx = array[i].indexOf(":");
				if (idx == -1) {
					$(opt).val(array[i]);
					$(opt).html(array[i]);
				} else {
					$(opt).val(array[i].substring(idx));
					$(opt).html(array[i].substring(idx + 1));
				}
				$(select).append(opt);
			}
		} else if (type == 'object') {
			for ( var i in options) {
				var opt = $('<option></option>');
				$(opt).val(i);
				$(opt).html(options[i]);
				$(select).append(opt);
			}
		}
	}
});
			
$.assembleKeyOptions = function(ary,def){
	const a = $('<select></select>');
	if(Array.isArray(ary)){
		ary.forEach(function(x){
			const o = $('<option>',{value:x,text:x});
			if((def || def == 0) && x == def){
				a.append(o.attr('selected',true));
			}else a.append(o);
		})
	}
	return a.html();
}

$.assembleKeyValOptions = function(ary,def){
	const a = $('<select></select>');
	if(Array.isArray(ary)){
		ary.forEach(function(x){
			const o = $('<option>',{value:x.a,text:x.b});
			if((def || def == 0) && x.a == def){
				a.append(o.attr('selected',true));
			}else a.append(o);
		})
	}
	return a.html();
}

$.afterSubmitFunc01 = function(res, postData) {
	var ct = res.getResponseHeader("content-type")||'';

	if (ct.indexOf('json') > -1) {
		var d = $.parseJSON(res.responseText).data;
		if(d && d["msg"] && d["msg"] != ""){
			return [false, d["msg"]];
		}else{
			if(postData != null && postData.oper == 'del' && d && d.status == 200)
				$.autoMsg('刪除成功');
			if(d && d.id) return [true,'',d.id];
			else return [true];
		}
	}else{
		var err = res.responseText||'error';
		if(err.length > 200) err = err.substring(0,200)+'...';
		$.showError(err);
		return [false];
	}
}

//物件X軸絕對位置(body)
$.GetAbsoluteX = function(obj, par) {
	var rtData = 0;
	if (obj != undefined) {
		while (obj != document.body && obj.offsetLeft != null) {
			rtData = rtData + obj.offsetLeft;
			obj = obj.offsetParent;
			if(par != undefined && obj==par)
				break;
		}
	}
	return rtData;
}

//物件X軸絕對位置(relative容器)
$.GetAbsoluteX2 = function(obj, par) {
	var rtData = 0;
	if (obj != undefined) {
		while (obj != document.body && obj.offsetLeft != null) {
			rtData = rtData + obj.offsetLeft;
			obj = obj.offsetParent;
			if((par != undefined && obj==par) || $(obj).css('position') == 'relative')
				break;
		}
	}
	return rtData;
}

//物件Y軸絕對位置(body)
$.GetAbsoluteY = function(obj, par) {
	var rtData = 0;
	if(obj != undefined) {
		while (obj != document.body && obj.offsetTop != null) {
			rtData = rtData + obj.offsetTop;
			obj = obj.offsetParent;
			if(par != undefined && obj==par)
				break;
		}
	}
	return rtData;
}

//物件Y軸絕對位置(relative容器)
$.GetAbsoluteY2 = function(obj, par) {
	var rtData = 0;
	if(obj != undefined) {
		while (obj != document.body && obj.offsetTop != null) {
			rtData = rtData + obj.offsetTop;
			obj = obj.offsetParent;
			if((par != undefined && obj==par) || $(obj).css('position') == 'relative')
				break;
		}
	}
	return rtData;
}

$.fn.log = function(msg) {
	$.log(msg, this);
	return this;
};

$.fn.setReadOnly = function(setting) {
	return this.each(function() {
		$('input,button,select,textarea,checkbox', this).setFieldReadOnly(
				setting);
	});
}

$.fn.setEditable = function(setting) {
	return this.each(function() {
		$('input,button,select,textarea,checkbox', this).setFieldEditable(
				setting);
	});
}

$.fn.setFieldEditable = function(setting) {
	setting = $.extend( {
		readonly : false
	}, setting);
	return this.each(function() {
		$(this).setFieldReadOnly(setting);
	});
}

$.fn.setFieldReadOnly = function(setting) {
	return this.each(function() {
		var t = this.type
		var tag = this.tagName.toLowerCase();
		setting = $.extend( {
			excludeAttr : '',
			excludeAttrVal : '',
			readonly : true
		}, setting);
		var bgColor = '#ffffff';
		if (setting.readonly)
			bgColor = '#dddddd';

		if (setting.excludeAttrVal == ''
				|| setting.excludeAttrVal.indexOf($(this).attr(
						setting.excludeAttr)) < 0) {
			if (t == 'text' || t == 'password' || tag == 'textarea') {
				this.style.backgroundColor = bgColor;
				this.readOnly = setting.readonly;
				this.disabled = setting.readonly;
			} else if (t == 'checkbox' || t == 'radio') {
				if ($(this).parent().attr('class') == 'ui-buttonset') {
					$(this).button('option', 'disabled', setting.readonly);
				} else {
					this.disabled = setting.readonly;
					this.style.backgroundColor = bgColor;
				}
			} else if (tag == 'select') {
				this.disabled = setting.readonly;
				this.style.backgroundColor = bgColor;
			} else if (tag == 'button' || t == 'submit') {
				if ($(this).attr('role') == 'button') {
					$(this).button('option', 'disabled', setting.readonly);
				} else {
					this.disabled = setting.readonly;
					this.style.backgroundColor = bgColor;
				}
			}
		}
	});
};

(function($) {
	$.fn.extend( {
		divStyle : function() {
			return this.each(function(i, obj) {
				$(obj).addClass(
						'ui-widget-content ui-corner-all').css(
						'padding', '2px');
				if ($(obj).attr('title') != "") {
					$(obj).prepend('<div class="ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix" style="padding:5px;"><span>' + $(obj).attr('title') + '</span></div>');
					$(obj).removeAttr('title');
				}
			});
		}
	});
})(jQuery);

//String Method
$.String = {
	format : function() {
		var s = arguments[0];
		for ( var i = 0; i < arguments.length - 1; i++) {
			var reg = new RegExp("\\{" + i + "\\}", "gm");
			s = s.replace(reg, arguments[i + 1]);
		}
		return s;
	}
};

String.prototype.format = function() {
	var s = this;
	for ( var i = 0; i < arguments.length; i++) {
		var reg = new RegExp("\\{" + i + "\\}", "gm");
		s = s.replace(reg, arguments[i]);
	}
	return s;
}

String.prototype.startsWith = function(prefix) {
	return (this.substr(0, prefix.length) === prefix);
}

String.prototype.endsWith = function(suffix) {
	return (this.substr(this.length - suffix.length) === suffix);
}

String.prototype.parseBool = function() {
	if (this == 'true' || this == true || this == 1 || this == '1')
		return true;
	else
		return false;
}

String.prototype.replaceAll = function(regex, replacement) {
	var index = 0;
	var ret = this;
	while (ret.indexOf(regex, index) != -1) {
		ret = ret.replace(regex, replacement);
		index = ret.indexOf(regex, index);
	}
	return ret;
}

$.remove = function (array,obj) {
	for(var i=0,n=0;i<array.length;i++){
		if(array[i]!=obj){
			array[n++]=array[i]
		}
	}
	array.length -= 1;
};

//載入頁面時避免ID重複時替換id用
$.replaceId = function(str, key) {
	var today = new Date();
	var hhmmss = today.getHours() * 10000 + today.getMinutes() * 100
			+ today.getSeconds();
	var identity = "_" + key + "_" + today.getTime();

	var regex = /id\s*=\s*[",'][a-z,A-Z,0-9,-,_,\\.]+[",']/ig;
	var s = str.match(regex);
	if (s != null) {
		for (i = 0; i < s.length; i++) {
			str = str.replace(s[i], s[i].substring(0, s[i].length - 1)
					+ identity + s[i].substring(s[i].length - 1));
		}
	}

	regex = /[",']#[a-z,A-Z,0-9,-,_,\\.]+[",']/ig;
	s = str.match(regex);
	if (s != null) {
		for (i = 0; i < s.length; i++) {
			str = str.replace(s[i], s[i].substring(0, s[i].length - 1)
					+ identity + s[i].substring(s[i].length - 1));
		}
	}

	regex = /formids\s*=\s*[",'][a-z,A-Z,0-9,-,_,\\.]+[",']/ig;
	var s = str.match(regex);
	if (s != null) {
		for (i = 0; i < s.length; i++) {
			str = str.replace(s[i], s[i].substring(0, s[i].length - 1)
					+ identity + s[i].substring(s[i].length - 1));
		}
	}

	regex = /targets\s*=\s*[",'][a-z,A-Z,0-9,-,_,\\.]+[".']/ig;
	var s = str.match(regex);
	if (s != null) {
		for (i = 0; i < s.length; i++) {
			str = str.replace(s[i], s[i].substring(0, s[i].length - 1)
					+ identity + s[i].substring(s[i].length - 1));
		}
	}

	regex = /"{_id}"+/ig;
	var s = str.match(regex);
	if (s != null) {
		for (i = 0; i < s.length; i++) {
			str = str.replace(s[i], '"' + identity + '"');
		}
	}

	regex = /'{_id}'+/ig;
	var s = str.match(regex);
	if (s != null) {
		for (i = 0; i < s.length; i++) {
			str = str.replace(s[i], "'" + identity + "'");
		}
	}

	return str;
};

//jQuery日曆轉成民國年
(function($) {
	$.extend($.datepicker, {
		formatDate : function(format, date, settings) {
			var d = date.getDate();
			var m = date.getMonth() + 1;
			var y = date.getFullYear();
			var fm = function(v) {
				return (v < 10 ? '0' : '') + v;
			};
			var iy = y;
			if (format != "yyyy/mm/dd") {
				iy = iy - 1911;
				if (iy < 100)
					iy = '0' + iy;
			} else {
				if (iy < 10)
					iy = '000' + iy;
				else if (iy < 100 && iy >= 10)
					iy = '00' + iy;
				else if (iy < 1000 && iy >= 100)
					iy = '0' + iy;
			}
			return iy + '/' + fm(m) + '/' + fm(d);
		},
		parseDate : function(format, value, settings) {
			if (format != "yyyy/mm/dd") {
				var v = (new String(value)).split('/');

				if (v.length == 3 && !isNaN(v[0]) && !isNaN(v[1])
						&& !isNaN(v[2])) {
					return new Date(v[0] - 0 + 1911, v[1] - 1, v[2]);
				} else {
					return new Date();
				}
			} else {
				var v = (new String(value)).split('/');

				if (v.length == 3 && !isNaN(v[0]) && !isNaN(v[1])
						&& !isNaN(v[2])) {
					return new Date(v[0], v[1] - 1, v[2]);
				} else {
					return new Date();
				}
			}
		},
		formatYear : function(v) {
			return '民國' + (v - 1911) + '年';
		},
		dateFormat : 'yyy/mm/dd'
	});
})(jQuery);