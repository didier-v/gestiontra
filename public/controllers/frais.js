/* frais.js */
/*global angular, console, _ , confirm */

function FraisListeCtrl($scope,DataSource,Selection,ListController,$dialog) {
// resources
	var resourceFrais = DataSource({nature:"frais"});
	var resourceVehicule = DataSource({nature:"vehicule"});
	$scope.vehicules=resourceVehicule.get();

// vehicule name
	$scope.getVehiculeName = function(id_vehicule) {
		if($scope.vehicules.length>0) {
			var vehicule= _.findWhere($scope.vehicules,{id:id_vehicule});
			return vehicule.type_vehicule+" "+vehicule.puissance;
		}
	}

//notifications
	$scope.$on("anneeDidChange",function(event) {
		$scope.annee = Selection.annee();
		$scope.fetchFrais();

	});

	$scope.$on("personneDidChange",function(event) {
		$scope.personne=Selection.personne();
		$scope.fetchFrais();

	});
	
//fetch		
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

//ajout/modif/suppression	
	$scope.modifyRecord = ListController.modifyRecord({
		controller : "FraisCtrl",
		dialogClass : "modal-frais",
		templateUrl : "partials/frais.html"
	});

	$scope.addRecord = ListController.addRecord({
		controller : "FraisCtrl",
		dialogClass : "modal-frais",
		templateUrl : "partials/frais.html",
		resource : resourceFrais,
		defaultValues : {nature: "frais",total_frais:0,kilometres:0,frais_parking:0, frais_restauration:0,frais_divers:0,tr_a_enlever:0 },
		onValidation: function(result) {
			$scope.listeFrais.push(result);
		}
	});
	
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

} // FraisListeCtrl

function FraisCtrl($scope, dialog, Selection,DataSource, record,iso2dateFilter,date2isoFilter) {
	var resourceVehicule = DataSource({nature:"vehicule"});
	
// maj	
	$scope.updateFrais = function() {
		var vehicule= _.findWhere($scope.vehicules,{id:$scope.fraisCourant.id_vehicule});
		if($scope.fraisCourant.kilometres<5000) {
			$scope.fraisCourant.constante = vehicule.constante0;
			$scope.fraisCourant.taux = vehicule.taux0;
		}
		else if($scope.fraisCourant.kilometres<20000) {
			$scope.fraisCourant.constante = vehicule.constante1;
			$scope.fraisCourant.taux = vehicule.taux1;
		}
		else {
			$scope.fraisCourant.constante = vehicule.constante2;
			$scope.fraisCourant.taux = vehicule.taux2;
		}
		$scope.fraisCourant.montant =  ( $scope.fraisCourant.kilometres * $scope.fraisCourant.taux  ) + $scope.fraisCourant.constante;
		$scope.fraisCourant.total_frais = $scope.fraisCourant.montant  + $scope.fraisCourant.frais_parking + $scope.fraisCourant.frais_restauration + $scope.fraisCourant.frais_divers;
	};

//boutons	
	$scope.cancel= function() {
		dialog.close('cancel');
	};
	
	$scope.save = function() {
		$scope.fraisCourant.date_frais=date2isoFilter($scope.fraisCourant.date_frais);
		dialog.close($scope.fraisCourant);

	};
	
	//initialisation
	$scope.nomPersonne = Selection.personne().prenom+" "+Selection.personne().nom;
	$scope.vehicules=resourceVehicule.get(function() {
		$scope.fraisCourant=record;
		if($scope.fraisCourant.date_frais) {
			$scope.fraisCourant.date_frais=iso2dateFilter($scope.fraisCourant.date_frais);
		}
		$scope.fraisCourant.id_personne = Selection.personne().id;
		if(!$scope.fraisCourant.id_vehicule) {
			$scope.fraisCourant.id_vehicule = Selection.personne().id_vehicule;
			$scope.updateFrais();
		}
	});
	
	
} //FraisCtrl