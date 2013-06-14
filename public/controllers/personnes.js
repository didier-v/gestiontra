/* personnes.js */
/*global angular, console, _ */
function PersonnesCtrl($scope,resourcePersonne, $dialog) {
	// var personnesDataSource = resourcePersonne.get();
	$scope.personnes=resourcePersonne.get();
	$scope.selectPersonne=function(personne) {
		var d=$dialog.dialog({templateUrl:"partials/personne.html",
							controller: "PersonneCtrl",
							resolve: {personne: function(){ return angular.copy(personne); }}
							});
		
		d.open().then(function(result){
			if(angular.isObject(result)) {
				result.$save(function(){
					angular.extend(personne,result);
				});
				
			}
		});
	};
	
	$scope.deletePersonne=function(personne) {
		var i=_.indexOf($scope.personnes ,personne);
		if(i>0) {
			if(confirm("Supprimer "+personne.prenom+" ?")){
			personne.$remove(function() {
				$scope.personnes.splice(i,1);
			});
		}
		}
	}

	$scope.add = function() {
		var d=$dialog.dialog({templateUrl:"partials/personne.html",
							controller: "PersonneCtrl",
							resolve: {personne: function(){ 
								var newPersonne= new resourcePersonne({});
								newPersonne.nature="personne"; // ne pas oublier la nature
								return newPersonne; }
							}
		});
		d.open().then(function(result){
			if(angular.isObject(result)) {
				result.$add(function(d){
					$scope.personnes.push(d);
			});
				
			}
		});	

	};

} // PersonnesCtrl


function PersonneCtrl($scope, dialog,resourcePersonne,resourceVehicule, personne) {
	$scope.personneCourante=personne;
	$scope.vehicules=resourceVehicule.get();

	$scope.cancel= function() {
		dialog.close('cancel');
	};
	
	$scope.save = function() {
		dialog.close($scope.personneCourante);
	};
	
} //PersonneCtrl