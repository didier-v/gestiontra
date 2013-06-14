/* frais.js */
/*global angular, console, _ , confirm */

function FraisListeCtrl($scope,DataSource,Selection,$dialog) {
	var resourceFrais = DataSource({nature:"frais"});
//notifications
	$scope.$on("anneeDidChange",function(event) {
		$scope.annee = Selection.annee();
		$scope.fetchFrais();

	});

	$scope.$on("personneDidChange",function(event) {
		$scope.personne=Selection.personne();
		$scope.fetchFrais();

	});
	
	
	$scope.fetchFrais=function() {
		var critere={};
		if($scope.personne) {
			critere.id_personne=$scope.personne.id;
		}
		if($scope.annee) {
			critere.date_frais = { $regex: $scope.annee +'.*'};

		}
		
		$scope.listeFrais = resourceFrais.get(critere);
	};
	
	//initialisation
	$scope.annee = Selection.annee();
	$scope.personne=Selection.personne();

	$scope.fetchFrais();
	
	$scope.selectFrais=function(frais) {
		var d=$dialog.dialog({templateUrl:"partials/frais.html",
							controller: "FraisCtrl",
							resolve: {frais: function(){ return angular.copy(frais); }}
							});
		d.open().then(function(result){
			if(angular.isObject(result)) {
				result.$save(function(){
					angular.extend(frais,result);
				});
			}
		});
	};
	
	$scope.deleteFrais=function(frais) {
		var i=_.indexOf($scope.listeFrais,frais);
		if(i>0) {
			if(confirm("Supprimer le frais ?")){
			frais.$remove(function() {
				$scope.listeFrais.splice(i,1);
			});
		}
		}
	};
	
	$scope.add = function() {
		var d=$dialog.dialog({templateUrl:"partials/frais.html",
							controller: "FraisCtrl",
							resolve: {frais: function(){
								var newFrais= new resourceFrais({});
								newFrais.nature="frais"; // ne pas oublier la nature
								newFrais.id_personne = $scope.personne.id;
								return newFrais; }
							}
		});
		d.open().then(function(result){
			if(angular.isObject(result)) {
				result.$add(function(d){
					$scope.listeFrais.push(d);
			});
				
			}
		});

	};

} // FraisCtrl