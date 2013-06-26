/*global angular */
angular.module('dateUtilsModule', []).
factory('DateUtils', function() {
return {
   daysInMonth: function(month,year) {
	  var dd = new Date(year, month, 0);
	  return dd.getDate();
   },

   lastDayOfMonth: function(month, year) {
	  var dd = new Date(year, month, 0);
	  return dd;
   },

   getDOY: function(d){
	  var onejan;
	  if(angular.isDate(d)){
		 onejan = new Date(d.getFullYear(), 0, 1);
	  }
	  else {
		 var dateregex= /^([0-9]+)-([0-9]+)-([0-9]+)/;
		 var t=d.match(dateregex);
		 d=new Date(parseInt(t[1]), parseInt(t[2])-1, parseInt(t[3]));
		 onejan = new Date(parseInt(t[1]), 0, 1);
	  }
   return 1 + Math.ceil((d - onejan) / 86400000);

   },

   getDateFromDOY: function(year, doy){
	  return new Date(year, 0, doy);
   },

   getDayFromDOY: function(year, doy){
	  return new Date(year, 0, doy).getDay();
   }



};

});

	