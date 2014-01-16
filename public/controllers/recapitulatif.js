/*global _, angular */
//recapitulatif.js
function RecapitulatifCtrl($scope,$timeout,dataSource,Selection,DateUtils) {

//notifications
	$scope.$on("anneeDidChange",function(event) {
		$scope.annee = Selection.annee();
		$scope.fetchRecap();

	});

	$scope.$on("personneDidChange",function(event) {
		$scope.personne=Selection.personne();
		$scope.fetchRecap();

	});

// calculs
	$scope.joursOuvrables = function(date1, date2,jours_feries) {
		var nb;
		var d1=DateUtils.getDOY(date1);
		var d2=DateUtils.getDOY(date2);
		var y=date1.getFullYear();
		if(d2>=d1) {
				nb=0;
				for(d1;d1<=d2;d1++)
				{
					var a=DateUtils.getDayFromDOY(y,d1);
					var b=_.findWhere(jours_feries,{doy:d1});
					if((a>0) && (a<6)	&& (b===undefined)) { // sauf samedi et dimanche
						nb++;
					}
				}
				return nb;
		}
		else {
			return 0;
		}
	};
	
	$scope.compterConges = function(dataConges, mois, type) {
		var nbjours=0;
		for(var i=0;i<dataConges.length;i++) {
			if (dataConges[i].type == type) {
				if (DateUtils.iso2date(dataConges[i].date_fin).getMonth() == (mois - 1)) //
				{
					nbjours+=dataConges[i].nb_jours;
				}
			} // type
			
		} //for
		return nbjours;
	};
	
	$scope.compterFrais = function(dataFrais, mois) {
		var total=0;
		for (var i = 0; i < dataFrais.length; i++) {
			if(dataFrais[i].date_frais!==undefined) {
				if (DateUtils.iso2date(dataFrais[i].date_frais).getMonth() == (mois - 1)) {
					total+=dataFrais[i].total_frais;
				}
			}
		}
		return total;
	},

	$scope.compterTRAEnlever = function(dataFrais, mois) {
		var total=0;
		for (var i = 0; i < dataFrais.length; i++) {
			if(dataFrais[i].date_frais!==undefined) {
				if (DateUtils.iso2date(dataFrais[i].date_frais).getMonth() == (mois - 1)) {
					total+=dataFrais[i].tr_a_enlever;
				}
			}
		}
		return total;
	},
	
// fetch
	$scope.fetchRecap = function() {
		$scope.listeRecap=[];
		var resourceConge= $scope.resourceConge;
		var resourceFrais = $scope.resourceFrais;
		var resourceRecap = $scope.resourceRecap;
		var resourceJourFerie = $scope.resourceJourFerie;
		var jours_feries, dataConges, dataFrais;  // données utilisées

		// enchainer les appels
		resourceJourFerie.get({jour:{ $regex:  $scope.annee+'.*'},type:"Jour férié"}).$promise
		.then(function(data) {
			jours_feries = data;
			for(var i=0;i<jours_feries.length;i++) {
				jours_feries[i].doy = DateUtils.getDOY(jours_feries[i].jour);
			}
			return resourceConge.get({id_personne: $scope.personne.id,date_fin: { $regex: $scope.annee +'.*'}}).$promise;
		})
		.then(function(data) {
			dataConges = data;
			return resourceFrais.get({id_personne:$scope.personne.id, date_frais: { $regex: $scope.annee +'.*'}}).$promise;
		})
		.then(function(data){
			dataFrais = data;
			return resourceRecap.get({id_personne:$scope.personne.id,annee : $scope.annee}).$promise;
		})
		.then(
			function(listeRecap) {
				var tmois=["Report","Janvier", "Février","Mars","Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
				for (var mois=0;mois<=12;mois++) {
					var ligne={}; // ligne du tableau recap
					if (ligne.mois===undefined) {
						ligne.mois=mois;
					}
					ligne.id_personne = $scope.personne.id;
					ligne.annee = $scope.annee;
					ligne.mois_texte=tmois[mois];
					ligne.annee = Selection.annee();

					if(mois!==0) { // sauf pour la ligne report
						ligne=angular.extend(ligne,_.findWhere(listeRecap,{mois:mois}));
						ligne.jours_ouvres=$scope.joursOuvrables(new Date(ligne.annee,mois-1,1),new Date(ligne.annee,mois,0),jours_feries);
						// charger les conges
						ligne.CPn1=$scope.compterConges(dataConges, mois, "Congé "+($scope.annee-1));
						ligne.CPn=$scope.compterConges(dataConges, mois, "Congé "+$scope.annee);
						ligne.RTTn1=$scope.compterConges(dataConges, mois, "RTT "+($scope.annee-1));
						ligne.RTTn=$scope.compterConges(dataConges, mois, "RTT "+$scope.annee);
						ligne.maladie=$scope.compterConges(dataConges, mois, "Maladie");
						ligne.frais_declares=$scope.compterFrais(dataFrais, mois);
						if (ligne.tr_distribues===undefined) {
							ligne.tr_distribues=0;
						}
						ligne.tr_a_enlever = $scope.compterTRAEnlever(dataFrais,mois);
						$scope.listeRecap.push(ligne);
					}
					else { // ligne de report
						ligne=angular.extend(ligne,_.findWhere(listeRecap,{mois:0}));
						ligne.CPn1=0;
						ligne.CPn=0;
						ligne.RTTn1=0;
						ligne.RTTn=0;
						ligne.maladie=0;
						ligne.jours_ouvres=0;
						ligne.tr_a_distribuer=0;
						ligne.tr_distribues=0;
						if(ligne.debit_tr===undefined) {
							ligne.debit_tr=0;
						}
						if(ligne.credit_tr===undefined) {
							ligne.credit_tr=0;
						}
						ligne.frais_declares=0;
						ligne.tr_a_enlever=0;
						$scope.listeRecap.push(ligne);
					}
				}	//for
				$scope.recalculerTR(1);
			});
	}; //fetchRecap
	
	$scope.updateRecap = function(i) {
		var resourceRecap = $scope.resourceRecap;
		
		var record=$scope.listeRecap[i];
		if (i>0) {
			$scope.recalculerTR(i);
		}
		else {
			//ligne report
			record.debit_tr = record.debit_tr || 0; // pour forcer à zero si la zone saisie est vide;
			record.credit_tr = record.credit_tr || 0; // pour forcer à zero si la zone saisie est vide;
			$scope.recalculerTR(1);
		}

		// ajout ou modif
		if ($scope.listeRecap[i].id===undefined) {
			resourceRecap.add($scope.listeRecap[i],function(x){
				$scope.listeRecap[i].id=x.id;
			});
		}
		else {
			resourceRecap.save($scope.listeRecap[i]);
		}

		
	}; // updateRecap

	$scope.recalculerTR = function(i) {
		var record=$scope.listeRecap[i];
		var mois;
		var c1,d1,cpn1,cpn,rttn1,rttn,tr_a_enlever;
		if (i>0) {
			c1 = $scope.listeRecap[i-1].credit_tr || 0;
			d1 = $scope.listeRecap[i-1].debit_tr || 0;
			cpn1 = record.CPn1 || 0;
			cpn = record.CPn || 0;
			rttn1 = record.RTTn1 || 0;
			rttn = record.RTTn || 0;
			tr_a_enlever = record.tr_a_enlever || 0;

			record.tr_a_distribuer=record.jours_ouvres;
			record.tr_a_distribuer=record.tr_a_distribuer-Math.floor(cpn1+cpn+rttn1+rttn);
			record.tr_a_distribuer=record.tr_a_distribuer+c1;
			record.tr_a_distribuer=record.tr_a_distribuer-d1;
			record.tr_a_distribuer=record.tr_a_distribuer-tr_a_enlever;
			if(record.tr_a_distribuer<record.tr_distribues){
				record.debit_tr=record.tr_distribues-record.tr_a_distribuer;
				record.credit_tr=0;
			}
			else {
				record.debit_tr=0;
				record.credit_tr=record.tr_a_distribuer-record.tr_distribues;
			}

		}

		for (mois=i+1;mois<=12;mois++) {
			record=$scope.listeRecap[mois];
			c1 = $scope.listeRecap[mois-1].credit_tr || 0;
			d1 = $scope.listeRecap[mois-1].debit_tr || 0;
			cpn1 = record.CPn1 || 0;
			cpn = record.CPn || 0;
			rttn1 = record.RTTn1 || 0;
			rttn = record.RTTn || 0;
			tr_a_enlever = record.tr_a_enlever || 0;
			
			record.tr_a_distribuer=record.jours_ouvres;
			record.tr_a_distribuer=record.tr_a_distribuer-Math.floor(cpn1+cpn+rttn1+rttn);
			record.tr_a_distribuer=record.tr_a_distribuer+c1;
			record.tr_a_distribuer=record.tr_a_distribuer-d1;
			record.tr_a_distribuer=record.tr_a_distribuer-tr_a_enlever;
			if(record.tr_a_distribuer<record.tr_distribues){
				record.debit_tr=record.tr_distribues-record.tr_a_distribuer;
				record.credit_tr=0;
			}
			else {
				record.debit_tr=0;
				record.credit_tr=record.tr_a_distribuer-record.tr_distribues;
			}
			if(record.tr_a_distribuer<0) {
				record.tr_a_distribuer = 0;
			}
		}

	}; //recalculerTR
	
	$scope.print = function() {
			$scope.titre = Selection.annee()+" - "+$scope.personne.prenom+" "+$scope.personne.nom;
			$timeout(function() { // différer pour appliquer les modifications du scope
				window.print();
			}).then( function() {
				$scope.titre = "";
			});
	}; // print
	
	//initialisation
	$scope.annee = Selection.annee();
	$scope.personne=Selection.personne();
	$scope.listeRecap = [];
	$scope.resourceConge= dataSource({nature:"conges"});
	$scope.resourceFrais = dataSource({nature:"frais"});
	$scope.resourceRecap = dataSource({nature:"recapGlobal"});
	$scope.resourceJourFerie = dataSource({nature:"jour_ferie"});

	$scope.fetchRecap();
} // RecapitulatifCtrl