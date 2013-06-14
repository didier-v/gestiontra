/* conges.js */
/*global angular, console, _ , confirm */

function CongesCtrl($scope,DataSource, Selection,$dialog) {
	var resourceConge= DataSource({nature:"conges"});;
//notifications
	$scope.$on("anneeDidChange",function(event) {
		$scope.annee = Selection.annee();
		$scope.fetchConges();

	});

	$scope.$on("personneDidChange",function(event) {
		$scope.personne=Selection.personne();
		$scope.fetchConges();

	});
	
	
	$scope.fetchConges=function() {
		var critere={};
		if($scope.personne) {
			critere.id_personne=$scope.personne.id;
		}
		if($scope.annee) {
			critere.date_fin = { $regex: $scope.annee +'.*'};

		}
		
		$scope.conges = resourceConge.get(critere);
	};
	
	//initialisation
	$scope.annee = Selection.annee();
	$scope.personne=Selection.personne();

	$scope.fetchConges();
	
	$scope.selectRecord=function(conge) {
		var d=$dialog.dialog({templateUrl:"partials/conge.html",
							controller: "CongeCtrl",
							resolve: {conge: function(){ return angular.copy(conge); }}
							});
		d.open().then(function(result){
			if(angular.isObject(result)) {
				result.$save(function(){
					angular.extend(conge,result);
				});
			}
		});
	};
	
	$scope.deleteConge=function(conge) {
		var i=_.indexOf($scope.conges,conge);
		if(i>0) {
			if(confirm("Supprimer le congé ?")){
			conge.$remove(function() {
				$scope.conges.splice(i,1);
			});
		}
		}
	};
	
	$scope.add = function() {
		var d=$dialog.dialog({templateUrl:"partials/conge.html",
							controller: "CongeCtrl",
							resolve: {conge: function(){
								var newConge= new resourceConge({});
								newConge.nature="conges"; // ne pas oublier la nature
								newConge.id_personne = $scope.personne.id;
								return newConge; }
							}
		});
		d.open().then(function(result){
			if(angular.isObject(result)) {
				result.$add(function(d){
					$scope.conges.push(d);
			});
				
			}
		});

	};

} // CongesCtrl

function CongeCtrl($scope, dialog, conge,iso2dateFilter,date2isoFilter) {
	var d=new Date();
	$scope.typesConges = [
			{value:"Congé "+(d.getFullYear()-1)},
			{value:"Congé "+(d.getFullYear())},
			{value:"RTT "+(d.getFullYear()-1)},
			{value:"RTT "+d.getFullYear()},
			{value:"Maladie"}];



	$scope.congeCourant=conge;
	if($scope.congeCourant.date_debut) {
		$scope.congeCourant.date_debut=iso2dateFilter($scope.congeCourant.date_debut);
	}
	if($scope.congeCourant.date_fin) {
		$scope.congeCourant.date_fin=iso2dateFilter($scope.congeCourant.date_fin);
	}

	$scope.cancel= function() {
		dialog.close('cancel');
	};
	
	$scope.save = function() {
		$scope.congeCourant.date_debut=date2isoFilter($scope.congeCourant.date_debut);
		$scope.congeCourant.date_fin=date2isoFilter($scope.congeCourant.date_fin);
		dialog.close($scope.congeCourant);

	};
	
} //CongeCtrl
