/* app.js */

var myModule=angular.module('gestiontr', ['ngResource','ui.bootstrap','gestiontrfilters']);

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

/* Service Selection : valeurs globales modifiées dans le menu, utilisées par les interfaces */
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


/* Service ListController : fonctions génériques pour les controllers */
myModule.service('ListController', function($dialog) {
	this.modifyRecord=function(controller,templateUrl) {
		return function(record) {
			var d=$dialog.dialog({templateUrl:templateUrl,
							controller: controller,
							resolve: {record: function(){ return angular.copy(record); }}
							});
	
			d.open().then(function(result){
				if(angular.isObject(result)) {
					result.$save(function(){
						angular.extend(record,result);
				});
			}
		});
		}
	}; // modifyRecord
	
	this.addRecord=function(params) {
		var controller = params.controller;
		var templateUrl = params.templateUrl;
		var resource = params.resource;
		var defaultValues = {};
		if(params.defaultValues) {
			defaultValues = params.defaultValues;
		}
		var onValidation = params.onValidation;
		return function() {
			var d=$dialog.dialog({templateUrl:templateUrl,
								controller: controller,
								resolve: {record: function(){
									var newRecord= new resource({});
									angular.extend(newRecord,defaultValues);
									return newRecord;
								}}
			});
			d.open().then(function(result){
				if(angular.isObject(result)) {
					result.$add(function(d){
						onValidation(d);
//						$scope.calendrier.push(d);
				});
				
				}
			});
			
		};
	}; //addRecord

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

