function cronCalculate(zeroAllowed, max, values) {
	if(zeroAllowed == false)
		values.push(0);
	if(values.length > max || values.length == 0)
		return "*";
	values.sort(function(a, b){return a-b});
	// teiler
	out:
	for(var d=2; d <= Math.ceil(max/2); d++) {
		var tmp = values.slice();
		for(x=0; x*d <= max; x++) {
			if(tmp.indexOf(x*d) == -1)
				continue out;
			else
				tmp.splice(tmp.indexOf(x*d), 1);
		}
		if( tmp.length == 0 )
			return "*/"+d;
	}
	// if not allowed, remove 0
	if(zeroAllowed == false)
		values.splice(values.indexOf(0), 1);
	// ranges
	output = values[0] + "";
	var range = false;
	for(var i=1; i < values.length; i++) {
		if(values[i-1]+1 == values[i]) {
			range = true;
		}else{
			if(range) 
				output = output + "-" + values[i-1];
			range = false;
			output = output + "," + values[i];
		}
	}
	if(range)
		output = output + "-" + values[values.length-1];
	return output;	
}

// Werte auslesen:
function getSelectedElements(id) {
	return $.map($('#'+id+' > option:selected'), function(element) {
		if(parseInt(element.value) != "NaN")
			return parseInt(element.value);
	});
}

function updateField(id) {
	zeroAllowed = true;
	switch(id) {
		case "hours":
			max = 23;
			break;
		case "minutes":
			max = 59;
			break;
		case "dom":
			zeroAllowed = false;
			max = 31;
			break;
		case "months":
			zeroAllowed = false;
			max = 12;
			break;
		case "dow":
			max = 6;
			break;
		default:
			return;
	}
	document.getElementById("cron-output-" + id).innerHTML = cronCalculate(zeroAllowed, max, getSelectedElements("cron-" + id));
}

function cronTemplate(id) {
	// select all:
	cronHelperSelectAll("cron-dom");
	cronHelperSelectAll("cron-months");
	cronHelperSelectAll("cron-dow");
	switch(id) {
		case 1: //Alle 5 Minuten
			cronHelperSelectList("cron-minutes", [0,5,10,15,20,25,30,35,40,45,50,55]);
			cronHelperSelectAll("cron-hours");
			break;
		case 2: //Alle 15 Minuten
			cronHelperSelectList("cron-minutes", [0,15,30,45]);
			cronHelperSelectAll("cron-hours");
			break;
		case 3: //Alle 30 Minuten
			cronHelperSelectList("cron-minutes", [0,30]);
			cronHelperSelectAll("cron-hours");
			break;
		case 4: //Jede Stunde
			cronHelperSelectList("cron-minutes", [0]);
			cronHelperSelectAll("cron-hours");
			break;
		case 5: //Alle 3 Stunden
			cronHelperSelectList("cron-minutes", [0]);
			cronHelperSelectList("cron-hours", [0,3,6,9,12,15,18,21]);
			break;
		case 6: //Alle 4 Stunden
			cronHelperSelectList("cron-minutes", [0]);
			cronHelperSelectList("cron-hours", [0,4,8,12,16,20]);
			break;
		case 7: //Alle 6 Stunden
			cronHelperSelectList("cron-minutes", [0]);
			cronHelperSelectList("cron-hours", [0,6,12,18]);
			break;
		case 8: //Alle 12 Stunden
			cronHelperSelectList("cron-minutes", [0]);
			cronHelperSelectList("cron-hours", [0,12]);
			break;
		case 9: //Jeden Tag um 0:30 Uhr
			cronHelperSelectList("cron-minutes", [30]);
			cronHelperSelectList("cron-hours", [0]);
			break;
		case 10: //Jeden Sonntag um 0:10 Uhr
			cronHelperSelectList("cron-minutes", [10]);
			cronHelperSelectList("cron-hours", [0]);
			cronHelperSelectList("cron-dow", [0]);
			break;
		default: // select all
			cronHelperSelectAll("cron-minutes");
			cronHelperSelectAll("cron-hours");
	}
	$("#cron-minutes").change();
	$("#cron-hours").change();
	$("#cron-dom").change();
	$("#cron-months").change();
	$("#cron-dow").change();
}

function cronHelperSelectList(id, list) {
	$("#"+id).val(list);
}
function cronSelectAll(id) {
	cronHelperSelectAll(id);
	$("#"+id).change();
}
function cronHelperSelectAll(id) {
	$('#'+id+' > option').prop('selected',true);
}
