/* filters.js */

angular.module('gestiontrfilters', []).
filter("frnumber",function() {
	return function(input, number) {
//		console.log(input);
//		console.log(number);
		var i=input;
		if((i===undefined) || (i===null)) {
			i=0;
		}
		if(number) {
			i=i.toFixed(number);
		}
		return i.toString().replace(".",",");
	};
}).
filter("iso2date", function() {
	return function(input) {
	var dateregex= /^([0-9]+)-([0-9]+)-([0-9]+)/;
		var t=input.match(dateregex);
		
		if(t) {
			return t[3]+"/"+t[2]+"/"+t[1];
		}
		return input;
	};
}).
filter("date2iso", function() {
	return function(input) {
		var dateregex=/^([0-9]+)\/([0-9]+)\/([0-9]+)/;
		var t=input.match(dateregex);
		if(t) {
			if(t[3].length==2) {
				t[3]="20"+t[3];
			}
			if(t[2].length==1) {
				t[2]="0"+t[2];
			}
			if(t[1].length==1) {
				t[1]="0"+t[1];
			}
			return t[3]+"-"+t[2]+"-"+t[1];
		}
		return input;
	};
});