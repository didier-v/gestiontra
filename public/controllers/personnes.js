/* personnes.js */
/*global angular, console, _ ,confirm*/
function PersonnesCtrl($scope,dataSource, ListController) {
	var resourcePersonne = dataSource({nature:"personne"});
	$scope.personnes=resourcePersonne.get();


	$scope.modifyRecord = ListController.modifyRecord({
		controller : "PersonneCtrl",
		templateUrl : "partials/personne.html"
	});

	$scope.addRecord = ListController.addRecord({
		controller : "PersonneCtrl",
		templateUrl : "partials/personne.html",
		resource : resourcePersonne,
		defaultValues : {nature: "personne"},
		onValidation: function(result) {
			$scope.personnes.push(result);
		}
	});
		
	$scope.deletePersonne=function(personne) {
		var i=_.indexOf($scope.personnes ,personne);
		if(i>0) {
			if(confirm("Supprimer "+personne.prenom+" ?")){
			personne.$remove(function() {
				$scope.personnes.splice(i,1);
			});
		}
		}
	};

} // PersonnesCtrl


function PersonneCtrl($scope, dialog, dataSource, record) {
	$scope.personneCourante=record;
	var resourceVehicule = dataSource({nature:"vehicule"});
	$scope.vehicules=resourceVehicule.get();

	$scope.cancel= function() {
		dialog.close('cancel');
	};
	
	$scope.save = function() {
		dialog.close($scope.personneCourante);
	};
	
} //PersonneCtrl