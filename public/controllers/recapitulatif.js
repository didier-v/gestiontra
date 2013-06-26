/* recapitulatif.js */
/*global _ */
function RecapitulatifCtrl($scope,DataSource,Selection,DateUtils) {

//notifications
	$scope.$on("anneeDidChange",function(event) {
		$scope.annee = Selection.annee();
		$scope.fetchRecap();

	});

	$scope.$on("personneDidChange",function(event) {
		$scope.personne=Selection.personne();
		$scope.fetchRecap();

	});

	$scope.joursOuvrables = function(date1, date2,jours_feries) {
		var nb;
		var d1=DateUtils.getDOY(date1);
		var d2=DateUtils.getDOY(date2);
		var y=date1.getFullYear();
		console.log(date1);
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
	
	$scope.fetchRecap = function() {
		$scope.listeRecap=[];
		var resourceConge= DataSource({nature:"conges"});
		var resourceFrais = DataSource({nature:"frais"});
		var resourceRecap = DataSource({nature:"recapGlobal"});
		var resourceJourFerie = DataSource({nature:"jour_ferie"});


		resourceJourFerie.get({jour:{ $regex:  $scope.annee+'.*'},type:"Jour férié"}, function(jours_feries) {
			for(var i=0;i<jours_feries.length;i++) {
				jours_feries[i].doy = DateUtils.getDOY(jours_feries[i].jour);
			}
			var conges = resourceConge.get(
				{id_personne: $scope.personne.id,date_fin: { $regex: $scope.annee +'.*'}},
				function() {
					var frais=resourceFrais.get(
						{id_personne:$scope.personne.id, date_frais: { $regex: $scope.annee +'.*'}},
						function(){
							resourceRecap.get(
							{id_personne:$scope.personne.id,annee : $scope.annee},
							function(listeRecap) {
								var tmois=["Report","Janvier", "Février","Mars","Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
								for (var mois=0;mois<=12;mois++) {
									var ligne={}; // ligne du tableau recap
									ligne.mois=tmois[mois];
									ligne.annee = Selection.annee();
									ligne.jours_ouvres=$scope.joursOuvrables(new Date(ligne.annee,mois-1,1),new Date(ligne.annee,mois,0),jours_feries);
	
									if(mois!==0) { // sauf pour la ligne report
										ligne=angular.extend(ligne,_.findWhere(listeRecap,{mois:mois}));
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
										// if(record!==null) {
										// 	ligne.debit_tr=record.debit_tr;
										// 	ligne.credit_tr=record.credit_tr;
										// }
										// else {
											ligne.debit_tr=0;
											ligne.credit_tr=0;
										// }
										ligne.frais_declares=0;
										ligne.tr_a_enlever=0;
										$scope.listeRecap.push(ligne);
									}
	
								}
								console.log(listeRecap);
							});
	
					});
				});
		});

	}

	//initialisation
	$scope.annee = Selection.annee();
	$scope.personne=Selection.personne();
	$scope.listeRecap = [];
	$scope.fetchRecap();
} // RecapitulatifCtrl