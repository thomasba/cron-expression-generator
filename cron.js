// {{{ variables
var cron_minutes    = "*";
var cron_hours      = "*";
var cron_dom        = "*";
var cron_months     = "*";
var cron_dow        = "*";

var cron_minutes_id = "#cron-minutes";
var cron_hours_id   = "#cron-hours";
var cron_dom_id     = "#cron-dom";
var cron_months_id  = "#cron-months";
var cron_dow_id     = "#cron-dow";
var cron_output_id  = "#cron-output";
/// }}}
/** {{{ Convert a list of values to cron-syntax
 * @param bool zeroAllowed  weather the number zero is allowed (true) or not
 *                          (false)
 * @param  int              max the maximum value (eg. 59 for minutes)
 * @param  int[]            values a list of selected values
 * @return string
 */
function cronCalculate(zeroAllowed, max, values) {
	if(zeroAllowed == false)
		values.push(0);
	if(values.length > max || values.length == 0)
		return "*";
	values.sort(function(a, b){return a-b});
	// divider ("*/n")
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
	// ranges ("2,8,20,25-35")
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
} // }}}
/** Convert a cron-expression (one item) to a list of values {{{
 * @param bool zeroAllowed  weather the number zero is allowed (true) or not
 *                          (false)
 * @param  int              max the maximum value (eg. 59 for minutes)
 * @param  string           the cron expression (eg. "*")
 * @return int[]
 */
function cronValueItemToList(allowZero,maxValue,value) {
	var list = [];
	if(value == "*") {
		for(var i = allowZero ? 0 : 1; i <= maxValue; i++) {
			list.push(i);
		}
	}else if(value.match(/^\*\/[1-9][0-9]?$/)) {
		var c = parseInt(value.match(/^\*\/([1-9][0-9]?)$/)[1]);
		for(var i = allowZero ? 0 : 1; i <= maxValue; i++) {
			if(i%c == 0)
				list.push(i);
		}
	}else if(value.match(/^([0-9]+|[0-9]+-[0-9]+)(,[0-9]+|,[0-9]+-[0-9]+)*$/)) {
		var a = value.split(",");
		for(var i=0; i<a.length; i++) {
			var e = a[i].split("-");
			if(e.length == 2) {
				for(var j = parseInt(e[0]); j <= parseInt(e[1]); j++)
					list.push(j);
			}else{
				list.push(parseInt(e[0]));
			}
		}
	}else{
		return [];
	}
	return list;
} // }}}
/** Import the value of a given field to the variables {{{
 * @param source the input field containing the string
 */
function importCronExpressionFromInput(source) {
	importCronExpression($(source).val());
} // }}}
/** Import value of a given string to the variables {{{
 * @param expression The string
 */
function importCronExpression(expression) {
	if(!expression.match(/^((\*(\/[1-9][0-9]?)?|([0-9]{1,2}(-[0-9]{1,2})?)(,[0-9]{1,2}(-[0-9]{1,2})?)*)( |$)){5}$/))
		return;
	var parts = expression.split(" ");
	var tmp;
	if(parts[0] != cron_minutes) {
		cron_minutes = parts[0];
		cronHelperSelectList(cron_minutes_id,cronValueItemToList(true, 59,parts[0]));
	}
	if(parts[1] != cron_hours) {
		cron_hours   = parts[1];
		cronHelperSelectList(cron_hours_id,cronValueItemToList(true, 23,parts[1]));
	}
	if(parts[2] != cron_dom) {
		cron_dom     = parts[2];
		cronHelperSelectList(cron_dom_id,cronValueItemToList(false,31,parts[2]));
	}
	if(parts[3] != cron_months) {
		cron_months  = parts[3];
		cronHelperSelectList(cron_months_id,cronValueItemToList(false,12,parts[3]));
	}
	if(parts[4] != cron_dow) {
		cron_dow     = parts[4];
		cronHelperSelectList(cron_dow_id,cronValueItemToList(true, 6 ,parts[4]));
	}
} // }}}
/** Returns a string containing the current cron-expression {{{
 * @return string
 */
function getCronExpression() {
	return cron_minutes + " " + cron_hours + " " + cron_dom + " " +
			cron_months + " " + cron_dow;
} // }}}
/** Get a list of all selected items {{{
 * @param id The select-ID
 * @return int[]
 */
function getSelectedElements(id) {
	return $.map($(id +' > option:selected'), function(element) {
		if(parseInt(element.value) != "NaN")
			return parseInt(element.value);
	});
} // }}}
/** Update the variables {{{
 * @param source Source identifier
 * @param type hours/minutes/dom/months/dow
 * @return nothing
 */
function updateField(type) {
	zeroAllowed = true;
	switch(type) {
		case "hours":
			cron_hours = cronCalculate(true, 23, getSelectedElements(cron_hours_id));
			break;
		case "minutes":
			cron_minutes = cronCalculate(true, 59, getSelectedElements(cron_minutes_id));
			break;
		case "dom":
			cron_dom = cronCalculate(false, 31, getSelectedElements(cron_dom_id));
			break;
		case "months":
			cron_months = cronCalculate(false, 12, getSelectedElements(cron_months_id));
			break;
		case "dow":
			cron_dow = cronCalculate(true, 6, getSelectedElements(cron_dow_id));
			break;
	}
	$(cron_output_id).val(getCronExpression);
} // }}}
/** Set the fields to a given template {{{
 * @param id the templates ID (see comments)
 */
function cronTemplate(id) {
	// select all:
	cronHelperSelectAll(cron_dom_id);
	cronHelperSelectAll(cron_months_id);
	cronHelperSelectAll(cron_dow_id);
	switch(id) {
		case 1: // every 5 minutes
			cronHelperSelectList(cron_minutes_id, [0,5,10,15,20,25,30,35,40,45,50,55]);
			cronHelperSelectAll(cron_hours_id);
			break;
		case 2: // every 15 minutes
			cronHelperSelectList(cron_minutes_id, [0,15,30,45]);
			cronHelperSelectAll(cron_hours_id);
			break;
		case 3: // every 30 minutes
			cronHelperSelectList(cron_minutes_id, [0,30]);
			cronHelperSelectAll(cron_hours_id);
			break;
		case 4: // every hour
			cronHelperSelectList(cron_minutes_id, [0]);
			cronHelperSelectAll(cron_hours_id);
			break;
		case 5: // every 3 hours
			cronHelperSelectList(cron_minutes_id, [0]);
			cronHelperSelectList(cron_hours_id,[0,3,6,9,12,15,18,21]);
			break;
		case 6: // every 4 hours
			cronHelperSelectList(cron_minutes_id, [0]);
			cronHelperSelectList(cron_hours_id,[0,4,8,12,16,20]);
			break;
		case 7: // every 6 hours
			cronHelperSelectList(cron_minutes_id, [0]);
			cronHelperSelectList(cron_hours_id,[0,6,12,18]);
			break;
		case 8: // every 12 hours
			cronHelperSelectList(cron_minutes_id, [0]);
			cronHelperSelectList(cron_hours_id, [0,12]);
			break;
		case 9: // every day at 00:30am
			cronHelperSelectList(cron_minutes_id, [30]);
			cronHelperSelectList(cron_hours_id, [0]);
			break;
		case 10: //every sunday at 00:10am
			cronHelperSelectList(cron_minutes_id, [10]);
			cronHelperSelectList(cron_hours_id, [0]);
			cronHelperSelectList(cron_dow_id, [0]);
			break;
		default: // select all
			cronHelperSelectAll(cron_minutes_id);
			cronHelperSelectAll(cron_hours_id);
	}
	$(cron_minutes_id).change();
	$(cron_hours_id).change();
	$(cron_dom_id).change();
	$(cron_months_id).change();
	$(cron_dow_id).change();
} // }}}
/** List all select items contained in the list {{{
 * @param id jQuery selector
 * @param list The values to select
 */
function cronHelperSelectList(id, list) {
	$(id).val(list);
} // }}}
/** Select all elements in a select element {{{
 * @param id jQuery selector
 */
function cronHelperSelectAll(id) {
	$(id +' > option').prop('selected',true);
	$(id).change();
} // }}}
