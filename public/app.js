/* app.js */
/*global angular */

var myModule=angular.module('gestiontr', ['ngResource','ui.bootstrap','gestiontrfilters','dateUtilsModule']);

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
		
	};
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
	this.modifyRecord=function(params) {
		var controller = params.controller;
		var templateUrl = params.templateUrl;
		var onValidation = params.onValidation;
		var dialogClass  = "modal";
		if(params.dialogClass) {
			dialogClass = params.dialogClass;
		}

		return function(record) {
			var d=$dialog.dialog({templateUrl:templateUrl,
							controller: controller,
							dialogClass: dialogClass,
							backdropClick: false,
							resolve: {record: function(){ return angular.copy(record); }}
							});
	
			d.open().then(function(result){
				if(angular.isObject(result)) {
					result.$save(function(){
						angular.extend(record,result);
						if(onValidation) {
							onValidation(record);
						}
				});
			}
		});
		};
	}; // modifyRecord
	
	this.addRecord=function(params) {
		var controller = params.controller;
		var templateUrl = params.templateUrl;
		var Resource = params.resource;
		var defaultValues = {};
		if(params.defaultValues) {
			defaultValues = params.defaultValues;
		}
		var dialogClass  = "modal";
		if(params.dialogClass) {
			dialogClass = params.dialogClass;
		}
		var onValidation = params.onValidation;
		return function() {
			var d=$dialog.dialog({templateUrl:templateUrl,
								controller: controller,
								dialogClass: dialogClass,
								backdropClick: false,
								resolve: {record: function(){
									var newRecord= new Resource({});
									angular.extend(newRecord,defaultValues);
									return newRecord;
								}}
			});
			d.open().then(function(result){
				if(angular.isObject(result)) {
					result.$add(function(d){
						if(onValidation) {
							onValidation(d);
						}
				});
				
				}
			});
			
		};
	}; //addRecord

});

/******* resources **************/
myModule.factory ('dataSource', function($resource) {
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

