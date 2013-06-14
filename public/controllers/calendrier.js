/* calendrierCtrl.js */
/*global angular, console, _, confirm */
function CalendrierCtrl($scope,DataSource, $dialog,Selection) {
	var	critere = {	};
	$scope.annee= Selection.annee();
	critere.jour= { '$regex': $scope.annee+'.*'};
	var resourceCalendrier = DataSource({nature:"jour_ferie"});
	$scope.calendrier=resourceCalendrier.get(critere);

	$scope.$on("anneeDidChange",function(event) {
		$scope.annee = Selection.annee();
		critere.jour= { '$regex': $scope.annee+'.*'};
		$scope.calendrier=resourceCalendrier.get(critere);
	});
	
	$scope.select=function(jour) {
		var d=$dialog.dialog({templateUrl:"partials/jour.html",
							controller: "JourCtrl",
							resolve: {jour: function(){ return angular.copy(jour); }}
							});
		
		d.open().then(function(result){
			if(angular.isObject(result)) {
				result.$save(function(){
					angular.extend(jour,result);
				});
			}
		});
	};
	
	$scope.remove=function(jour) {
		var i=_.indexOf($scope.calendrier ,jour);
		if(i>0) {
			if(confirm("Supprimer "+jour.jour+" ?")){
			jour.$remove(function() {
				$scope.calendrier.splice(i,1);
			});
		}
		}
	};

	$scope.add = function() {
		var d=$dialog.dialog({templateUrl:"partials/jour.html",
							controller: "JourCtrl",
							resolve: {jour: function(){
								var newJour= new resourceCalendrier({});
								newJour.nature="jour_ferie"; // ne pas oublier la nature
								return newJour; }
							}
		});
		d.open().then(function(result){
			if(angular.isObject(result)) {
				result.$add(function(d){
					$scope.calendrier.push(d);
			});
				
			}
		});

	};

} // CalendrierCtrl


function JourCtrl($scope, dialog, jour,iso2dateFilter,date2isoFilter) {
	$scope.jourCourant=jour;
	if($scope.jourCourant.jour) {
		$scope.jourCourant.jour=iso2dateFilter($scope.jourCourant.jour);	
	}
	
	$scope.cancel= function() {
	dialog.close('cancel');
	};
	
	$scope.save = function() {
		$scope.jourCourant.jour=date2isoFilter($scope.jourCourant.jour);
		dialog.close($scope.jourCourant);
	};
	
} //JourCtrl
