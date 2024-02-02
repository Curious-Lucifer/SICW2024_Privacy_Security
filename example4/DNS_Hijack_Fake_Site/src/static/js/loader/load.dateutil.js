$.getCurrentDate = function(){
	var dt="";
	$.ajax({
		url: "TermUtil_getNowDtTm.action",
		type: "POST",
		async :	false,
		dataType: "json",
		complete: function(req, err){
			var json = $.parseJSON(req.responseText);
			var ret = json.data;
			if(ret!=undefined){
				dt = ret["YYYY/MM/DD"];
			}
		}
	});
	return dt;
};

$.getCurrentCHDate = function(){
	var dt="";
	$.ajax({
		url: "TermUtil_getNowDtTm.action",
		type: "POST",
		async :	false,
		dataType: "json",
		complete: function(req, err){
			var json = $.parseJSON(req.responseText);
			var ret = json.data;
			if(ret!=undefined){
				dt = ret["CHYY/MM/DD"];
			}
		}
	});
	return dt;
};

$.getCurrentHhmmss = function(timeStr){
	var dt="";
	$.ajax({
		url: "TermUtil_getNowDtTm.action",
		type: "POST",
		async :	false,
		dataType: "json",
		complete: function(req, err){
			var json = $.parseJSON(req.responseText);
			var ret = json.data;
			if(ret!=undefined){
				if (timeStr==":")
					dt = ret["HHMMSS"];
				else
					dt = ret["HH:MM:SS"];
			}
		}
	});
	return dt;
};

$.getHolidayYn = function(sCloseDt){
	if(sCloseDt=="") return false;
	var dt="";
	$.ajax({
		url: "TermUtil_getHolidayYN.action",
		type: "POST",
		data: "closeDt="+sCloseDt,
		async :	false,
		dataType: "json",
		complete: function(req, err){
			var json = $.parseJSON(req.responseText);
			var ret = json.data;
			if(ret!=undefined){
				dt = ret["holidayYn"];
			}
			//if (ret=="")dt=ret;
			//else dt=err;
		}
	});
	return dt;
};

$.checkNowBetweenTerm = function(sBeginDt,sBeginHm,sCloseDt,sCloseHm){
	if (sBeginDt=="") return false;
	if (sCloseDt=="") return false;
	var dt="";
	$.ajax({
		url: "TermUtil_getNowDtTm.action",
		type: "POST",
		async :	false,
		dataType: "json",
		complete: function(req, err){
			var json = $.parseJSON(req.responseText);
			var ret = json.data;
			if(ret!=undefined){
				dt = ret["CHYYMMDDHHMMSS"];
			}
		}
	});

	var sBegin = sBeginHm;
	if (sBegin!="") {
		if (sBegin.length <= 5)
			sBegin += ":00";
		sBegin = sBegin.replace(/\:/g,"");
	} else {
		sBegin = "000000"
	}
	sBegin = sBeginDt + sBegin;
	sBegin = sBegin.replace(/(\/)/g,"");
	var sClose = sCloseHm;
	if (sClose!="") {
		if (sClose.length <= 5)
			sClose += "00";
		sClose = sClose.replace(/\:/g,""); 
	} else {
		sClose = "000000"
	}
	sClose =sCloseDt + sClose;
	sClose = sClose.replace(/(\/)/g,"");
	if (parseInt(dt) >= parseInt(sBegin) && parseInt(dt) <= parseInt(sClose)) { 
		return true;
	} else
		return false;
};

$.date = {
	YEAR: "y"
	,MONTH: "M"
	,DATE: "d"
	,HOUR: "h"
	,MINUTE: "m"
	,SECOND: "s"
	,WEEK: "w"
	,parse: function(dateStr){
		return new Date(dateStr);
	}
	,parseCHDate: function(dateStr){
		var date = new Date(dateStr);
		return new Date(date.getFullYear()+1911,date.getMonth(),date.getDate(),date.getHours(),date.getMinutes(),date.getSeconds());
	}
	,getChDate: function(dateStr){
		var date;
		if(dateStr instanceof Date){
			date = dateStr;
		}else if(dateStr==null || dateStr==''){
			date = new Date();
		}else{
			if(dateStr.toString().indexOf('/')==4){
				date = $.date.parse(dateStr);
			}else{
				date = $.date.parseCHDate(dateStr);
			}
		}
		if(date.getFullYear()>1911){
			iY = date.getFullYear() - 1911;
		}else{
			iY = date.getFullYear();
		}

		sY = '0';
		if (iY < 100)
			sY += iY;
		else
			sY = iY;
		sM = '0';
		if (date.getMonth()+1 < 10)
			sM += (date.getMonth()+1);
		else
			sM = (date.getMonth()+1);
		sD = '0';
		if (date.getDate() < 10)
			sD += date.getDate();
		else
			sD = date.getDate();
		
		return sY+'/'+sM+'/'+sD;
	}
	,getDate: function(dateStr){
		var date;
		if(dateStr==null || dateStr=='')
			date = new Date();
		else
			date = $.date.parse(dateStr);
		
		iY = date.getFullYear();
		sY = '0';
		if (iY < 100)
			sY += iY;
		else
			sY = iY;
		sM = '0';
		if (date.getMonth()+1 < 10)
			sM += (date.getMonth()+1);
		else
			sM = (date.getMonth()+1);
		sD = '0';
		if (date.getDate() < 10)
			sD += date.getDate();
		else
			sD = date.getDate();
		
		return sY+'/'+sM+'/'+sD;
	}
	,add: function(field,date,amount){
		var dtTmp = new Date(date);
  		if(isNaN(dtTmp)) dtTmp = new Date();
  		switch(field){
  			case "s":
  				dtTmp = new Date(Date.parse(dtTmp) + (1000 * amount));
  				break;
  			case "m":
  				dtTmp = new Date(Date.parse(dtTmp) + (60000 * amount));
  				break;
  			case "h":
  				dtTmp = new Date(Date.parse(dtTmp) + (3600000 * amount));
  				break;
  			case "d":
  				dtTmp = new Date(Date.parse(dtTmp) + (86400000 * amount));
  				break;
  			case "w":
  				dtTmp = new Date(Date.parse(dtTmp) + (86400000 * 7 * amount));
  				break;
  			case "M":
  				dtTmp = new Date(dtTmp.getFullYear(), dtTmp.getMonth()+amount, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
  				break;
  			case "y":
  				dtTmp = new Date(dtTmp.getFullYear()+amount, dtTmp.getMonth(), dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
  				break;
  		}
  		
		return dtTmp;
	}
	,getHhmmss: function(timeStr){
		var dtTmp = new Date();
		var hh = dtTmp.getHours()+"";
		var mm = dtTmp.getMinutes()+"";
		var ss = dtTmp.getSeconds()+"";
		if (hh.length==1)
			hh = "0" + hh;
		if (mm.length==1)
			mm = "0" + mm;
		if (ss.length==1)
			ss = "0" + ss;
		if(timeStr==null)
			return hh+mm+ss;
		else
			return hh+timeStr+mm+timeStr+ss;
		
	}
}