/* vehiculesCtrl.js */
/*global _,confirm */

function VehiculesCtrl($scope,DataSource,ListController) {
	var resourceVehicule = DataSource({nature:"vehicule"});
	$scope.vehicules=resourceVehicule.get();

	$scope.modifyRecord = ListController.modifyRecord({
		controller : "VehiculeCtrl",
		templateUrl : "partials/vehicule.html"
	});

	$scope.addRecord = ListController.addRecord({
		controller : "VehiculeCtrl",
		templateUrl : "partials/vehicule.html",
		resource : resourceVehicule,
		defaultValues : {nature: "vehicule"},
		onValidation: function(result) {
			$scope.vehicules.push(result);
		}
	});
	
	$scope.deleteVehicule=function(vehicule) {
		var i=_.indexOf($scope.vehicules ,vehicule);
		if(i>0) {
			if(confirm("Supprimer "+vehicule.type_vehicule+" "+vehicule.puissance+" ?")){
			vehicule.$remove(function() {
				$scope.vehicules.splice(i,1);
			});
		}
		}
	};

} //VehiculesCtrl

function VehiculeCtrl($scope, dialog, record) {
	$scope.vehiculeCourant=record;

	$scope.cancel= function() {
		dialog.close('cancel');
	};
	
	$scope.save = function() {
		dialog.close($scope.vehiculeCourant);
	};
	
} //VehiculeCtrl