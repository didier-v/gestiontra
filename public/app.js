/* app.js */

var myModule=angular.module('gestiontr', ['ngResource','ui.bootstrap','gestiontrfilters']);
/*
myModule.filter("frnumber",function() {
	return function(input, number) {
//		console.log(input);
//		console.log(number);
	var i=input;
	if(number) {
		i=i.toFixed(number);
	}
	return i.toString().replace(".",",");
		
	};

});

myModule.filter("iso2date", function() {
	return function(input) {
	var dateregex= /^([0-9]+)-([0-9]+)-([0-9]+)/;
		var t=input.match(dateregex);
		
		if(t) {
			return t[3]+"/"+t[2]+"/"+t[1];
		}
		return input;
	};
});

myModule.filter("date2iso", function() {
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
*/

myModule.config(function($httpProvider) {
	var myReplacer = function(key,value) {
		if(key=="$regex") {
//			return value; // ne pas filtrer $regex (mongodb)
		}
		else if (/^\$+/.test(key)) { // filtrage propre a angularjs
			value = undefined;
		}
		return value;
	};
	$httpProvider.defaults.transformRequest = function(data) {
		var j= JSON.stringify(data,myReplacer,'');
		return j;
		
	}
})
/*
myModule.config(function($routeProvider,$locationProvider) {
		$locationProvider.html5Mode(true);
		$routeProvider.when ('/',{controller:DefaultCtrl, templateUrl:'default.html'}).
		when ('/liste_personnes',{controller:PersonnesCtrl, templateUrl:'personnes.html'}).
		when ('/liste_vehicules',{controller:VehiculesCtrl, templateUrl:'vehicules.html'}).
		otherwise({redirectTo:"/"});
		//otherwise({controller:DefaultCtrl, templateUrl:'default.html'});
});
*/

myModule.service('Selection', function() {
	var gAnnee=0;
	var personne={};
	this.annee =function() {
		return gAnnee;
	};
	this.setAnnee = function(nouvelleAnnee) {
		gAnnee=nouvelleAnnee;
	};
	this.personne = function() {
		return personne;
	};
	this.setPersonne = function(nouvellePersonne) {
		personne=nouvellePersonne;
	};

});


/******* resources **************/
myModule.factory ('DataSource', function($resource) {
	/* params : { nature : <nature> } */
	function DataSourceFactory(params) {
		var resourceInstance;
	
		if(params===undefined) {
			return null;
		}
		if(!params.nature) {
			return null;
		}
		
		resourceInstance = $resource("/:action/"+params.nature,{},
		{
			'get': {method:"post", params:{"action":"fetch"},isArray:true},
			'save': {method:"post", params:{"action":"update"}},
			'add': {method:"post", params:{"action":"add"}},
			'remove': {method:"post", params:{"action":"remove"}}
		});
		
		return resourceInstance;
	
	}
	return DataSourceFactory;

});

