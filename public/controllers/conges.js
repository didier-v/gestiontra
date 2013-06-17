/* conges.js */
/*global angular, console, _ , confirm */

function CongesCtrl($scope,DataSource, Selection,ListController) {
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
	
	$scope.modifyRecord = ListController.modifyRecord({
		controller : "CongeCtrl",
		templateUrl : "partials/conge.html"
	});

	$scope.addRecord = ListController.addRecord({
		controller : "CongeCtrl",
		templateUrl : "partials/conge.html",
		resource : resourceConge,
		defaultValues : {nature: "conges" },
		onValidation: function(result) {
			$scope.conges.push(result);
		}
	});

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

} // CongesCtrl

function CongeCtrl($scope, dialog, Selection, record,iso2dateFilter,date2isoFilter) {
	var d=new Date();
	$scope.typesConges = [
			{value:"Congé "+(d.getFullYear()-1)},
			{value:"Congé "+(d.getFullYear())},
			{value:"RTT "+(d.getFullYear()-1)},
			{value:"RTT "+d.getFullYear()},
			{value:"Maladie"}];

	$scope.congeCourant=record;
	if($scope.congeCourant.date_debut) {
		$scope.congeCourant.date_debut=iso2dateFilter($scope.congeCourant.date_debut);
	}
	if($scope.congeCourant.date_fin) {
		$scope.congeCourant.date_fin=iso2dateFilter($scope.congeCourant.date_fin);
	}
	$scope.congeCourant.id_personne = Selection.personne().id;
	
		
	$scope.cancel= function() {
		dialog.close('cancel');
	};
	
	$scope.save = function() {
		$scope.congeCourant.date_debut=date2isoFilter($scope.congeCourant.date_debut);
		$scope.congeCourant.date_fin=date2isoFilter($scope.congeCourant.date_fin);
		dialog.close($scope.congeCourant);

	};
	
} //CongeCtrl
