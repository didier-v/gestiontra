/* recapitulatif.js */
/*global _ */
function RecapitulatifCtrl($scope,dataSource,Selection,DateUtils) {

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

// fetch
	$scope.fetchRecap = function() {
		$scope.listeRecap=[];
		//var resourceConge= dataSource({nature:"conges"});
		//var resourceFrais = dataSource({nature:"frais"});
		//var resourceRecap = dataSource({nature:"recapGlobal"});
		//var resourceJourFerie = dataSource({nature:"jour_ferie"});
		var resourceConge= $scope.resourceConge;
		var resourceFrais = $scope.resourceFrais
		var resourceRecap = $scope.resourceRecap;
		var resourceJourFerie = $scope.resourceJourFerie;


		resourceJourFerie.get({jour:{ $regex:  $scope.annee+'.*'},type:"Jour férié"}, function(jours_feries) {
			for(var i=0;i<jours_feries.length;i++) {
				jours_feries[i].doy = DateUtils.getDOY(jours_feries[i].jour);
			}
			var conges = resourceConge.get(
				{id_personne: $scope.personne.id,date_fin: { $regex: $scope.annee +'.*'}},
				function(dataConges) {
					var frais=resourceFrais.get(
						{id_personne:$scope.personne.id, date_frais: { $regex: $scope.annee +'.*'}},
						function(dataFrais){
							resourceRecap.get(
							{id_personne:$scope.personne.id,annee : $scope.annee},
							function(listeRecap) {
								var tmois=["Report","Janvier", "Février","Mars","Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
								for (var mois=0;mois<=12;mois++) {
									var ligne={}; // ligne du tableau recap
									ligne.mois=tmois[mois];
									ligne.annee = Selection.annee();
	
									if(mois!==0) { // sauf pour la ligne report
										ligne=angular.extend(ligne,_.findWhere(listeRecap,{mois:mois+""}));									ligne.mois=tmois[mois];
										ligne.jours_ouvres=$scope.joursOuvrables(new Date(ligne.annee,mois-1,1),new Date(ligne.annee,mois,0),jours_feries);
										// charger les conges
										ligne.CPn1=$scope.compterConges(dataConges, mois, "Congé "+($scope.annee-1));
										ligne.CPn=$scope.compterConges(dataConges, mois, "Congé "+$scope.annee);
										ligne.RTTn1=$scope.compterConges(dataConges, mois, "RTT "+($scope.annee-1));
										ligne.RTTn=$scope.compterConges(dataConges, mois, "RTT "+$scope.annee);
										ligne.maladie=$scope.compterConges(dataConges, mois, "Maladie");
										ligne.frais_declares=$scope.compterFrais(dataFrais, mois);

										ligne.mois=tmois[mois];
										$scope.listeRecap.push(ligne);
	
									}
									else { // ligne de report
										ligne=angular.extend(ligne,_.findWhere(listeRecap,{mois:"0"}));
										ligne.CPn1=0;
										ligne.CPn=0;
										ligne.RTTn1=0;
										ligne.RTTn=0;
										ligne.maladie=0;
										ligne.jours_ouvres=0;
										ligne.tr_a_distribuer=0;
										ligne.tr_distribues=0;
										// if(record!==null) {
										// 	ligne.debit_tr=record.debit_tr;
										// 	ligne.credit_tr=record.credit_tr;
										// }
										// else {
											//ligne.debit_tr=0;
											//ligne.credit_tr=0;
										// }
										ligne.frais_declares=0;
										ligne.tr_a_enlever=0;
										$scope.listeRecap.push(ligne);
									}
	
								}
							});
	
					});
				});
		});

	}; //fetchRecap
	
	$scope.updateRecap = function(i) {
		var resourceRecap = $scope.resourceRecap;
		console.log(resourceRecap);
		var x=resourceRecap.get({id_personne:$scope.personne.id,annee : $scope.annee},function(liste) {
			console.log(liste);
		});
		resourceRecap.save($scope.listeRecap[i]);
//$scope.listeRecap[i].$save();
		//console.log(i);
		//console.log($scope.listeRecap);
		console.log($scope.listeRecap[i]);
		
	}

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