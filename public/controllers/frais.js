/* frais.js */
/*global angular, console, _ , confirm */

function FraisListeCtrl($scope,DataSource,Selection,ListController,$dialog,$timeout) {
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
	};
// totaux
	$scope.calculerTotaux = function() {
		var total= {
			frais:0,divers:0,restauration:0,parking:0,montant:0,tr_a_enlever:0
		};
		for (var i=0;i<$scope.listeFrais.length;i++) {
			total.frais+=$scope.listeFrais[i].total_frais;
			total.divers+=$scope.listeFrais[i].frais_divers;
			total.parking+=$scope.listeFrais[i].frais_parking;
			total.restauration+=$scope.listeFrais[i].frais_restauration;
			total.montant+=$scope.listeFrais[i].montant;
			total.tr_a_enlever+=$scope.listeFrais[i].tr_a_enlever;
		}
		$scope.total=total;
	};
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
		
		$scope.listeFrais = resourceFrais.get(critere, function() {
			$scope.selectionCourante = [];
			$scope.calculerTotaux();
		});
	};
	
//print
	$scope.printMois = function(value) {
		var selectedList = []; // chercher les frais du mois indiqué
		for (var i=0;i<$scope.listeFrais.length;i++) {
			var dateregex= /^([0-9]+)-([0-9]+)-([0-9]+)/;
			var t=$scope.listeFrais[i].date_frais.match(dateregex);
			if(value == (parseInt(t[2],10))) {
				selectedList.push($scope.listeFrais[i]);
			}
		}
		if(selectedList.length>0) {
			var liste = $scope.listeFrais;
			$scope.listeFrais = selectedList;
			$scope.titreFrais = value;
			var p=$timeout(function() { // différer pour appliquer les modifications du scope
				window.print();
			});
			p.then(function() {
				$scope.listeFrais = liste; // rétablir la sélection courante
				$scope.titreFrais = "";
			});
		}
		else {
			alert("Pas de frais pour ce mois");
		}
	};
	
	$scope.printSelection = function() {
		if($scope.selectionCourante.length>0) {
			var mois=prompt("Mois :");
			if(mois!==null) {
				var liste = $scope.listeFrais;
				$scope.listeFrais = $scope.selectionCourante;
				$scope.titreFrais = mois;
				var p=$timeout(function() { // différer pour appliquer les modifications du scope
					window.print();
				});
				p.then(function() {
					$scope.listeFrais = liste; // rétablir la sélection courante
					$scope.titreFrais = "";

				});
			}
		}
	}; // printSelection

//selection
	$scope.selectRecord = function(frais,event) {
		event.preventDefault();
		if(event.shiftKey) {
			var i=_.indexOf($scope.selectionCourante,frais);
			if(i==-1) {
				$scope.selectionCourante.push(frais);
			} else {
				$scope.selectionCourante.splice(i,1);
			}
		}
		else {
			$scope.selectionCourante = [frais];
		}
		document.getSelection().removeAllRanges();
	};
	
	$scope.isSelected = function(frais) {
		if(_.indexOf($scope.selectionCourante,frais)>=0) {
			return "isSelected";
		}
		else {
			return "";
		}
	}; //isSelected
	
	
//ajout/modif/suppression
	$scope.modifyRecord = ListController.modifyRecord({
		controller : "FraisCtrl",
		dialogClass : "modal-frais",
		templateUrl : "partials/frais.html",
		onValidation: function() {
			$scope.calculerTotaux();
		}
	});

	$scope.addRecord = ListController.addRecord({
		controller : "FraisCtrl",
		dialogClass : "modal-frais",
		templateUrl : "partials/frais.html",
		resource : resourceFrais,
		defaultValues : {nature: "frais",total_frais:0,kilometres:0,frais_parking:0, frais_restauration:0,frais_divers:0,tr_a_enlever:0 },
		onValidation: function(result) {
			$scope.calculerTotaux();
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

	
	//initialisation
	//mois
	$scope.listeMois= [{name:"Janvier", value:1},
			{name:"Février", value:2},
			{name:"Mars", value:3},
			{name:"Avril", value:4},
			{name:"Mai", value:5},
			{name:"Juin", value:6},
			{name:"Juillet", value:7},
			{name:"Août", value:8},
			{name:"Septembre", value:9},
			{name:"Octobre", value:10},
			{name:"Novembre", value:11},
			{name:"Décembre", value:12}];
	$scope.annee = Selection.annee();
	$scope.personne=Selection.personne();
	$scope.titreFrais = "";
	$scope.fetchFrais();
	

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