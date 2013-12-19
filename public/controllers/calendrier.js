/* calendrierCtrl.js */
/*global angular, console, _, confirm */
function CalendrierCtrl($scope,dataSource,ListController,Selection) {
	var	critere = {	};
	$scope.annee= Selection.annee();
	critere.jour= { '$regex': $scope.annee+'.*'};
	var resourceCalendrier = dataSource({nature:"jour_ferie"});
	$scope.calendrier=resourceCalendrier.get(critere);

	$scope.$on("anneeDidChange",function(event) {
		$scope.annee = Selection.annee();
		critere.jour= { '$regex': $scope.annee+'.*'};
		$scope.calendrier=resourceCalendrier.get(critere);
	});
	
	$scope.modifyRecord = ListController.modifyRecord({
		controller : "JourCtrl",
		templateUrl : "partials/jour.html"
	});
	
	$scope.addRecord = ListController.addRecord({
		controller : "JourCtrl",
		templateUrl : "partials/jour.html",
		resource : resourceCalendrier,
		defaultValues : {nature: "jour_ferie"},
		onValidation: function(result) {
			$scope.calendrier.push(result);
		}
	});
	
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

	
} // CalendrierCtrl


function JourCtrl($scope, dialog, record,iso2dateFilter,date2isoFilter) {
	$scope.jourCourant=record;
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
