/* vehiculesCtrl.js */

function VehiculesCtrl($scope,DataSource,$dialog) {
	var resourceVehicule = DataSource({nature:"vehicule"});
	$scope.vehicules=resourceVehicule.get();

	$scope.selectVehicule=function(vehicule) {
		var d=$dialog.dialog({templateUrl:"partials/vehicule.html",
							controller: "VehiculeCtrl",
							resolve: {vehicule: function(){ return angular.copy(vehicule); }}
							});
		
		d.open().then(function(result){
			if(angular.isObject(result)) {
				result.$save(function(){
					angular.extend(vehicule,result);
				});
				
				console.log(result);
			}
		});
	};

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

	$scope.add = function() {
		var d=$dialog.dialog({templateUrl:"partials/vehicule.html",
							controller: "VehiculeCtrl",
							resolve: {vehicule: function(){ 
								var newVehicule= new resourceVehicule({});
								newVehicule.nature="vehicule"; // ne pas oublier la nature
								return newVehicule; }
							}
		});
		d.open().then(function(result){
			if(angular.isObject(result)) {
				result.$add(function(d){
					$scope.vehicules.push(d);
			});
				
			}
		});	

	};
} //VehiculesCtrl

function VehiculeCtrl($scope, dialog, vehicule) {
	$scope.vehiculeCourant=vehicule;

	$scope.cancel= function() {
		dialog.close('cancel');
	};
	
	$scope.save = function() {
		dialog.close($scope.vehiculeCourant);
	};
	
} //VehiculeCtrl