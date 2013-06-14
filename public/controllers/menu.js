/* menu.js */


function MenuController($scope,Selection,DataSource) {
	$scope.mainView=""; //$scope.pages[0].url;

//personnes
	$scope.setPersonneCourante= function(personne) {
		$scope.personneCourante = personne;
		Selection.setPersonne(personne);
		$scope.$broadcast("personneDidChange");
	};
//annees
	var tabAnnee = [];
	var annee0=2012;
	var anneeCourante=new Date().getFullYear();
	for(var i=0;i<=anneeCourante-annee0;i++) {
			tabAnnee[i]=annee0+i;
	}
	$scope.listeAnnees = tabAnnee;
	$scope.setAnnee = function(nouvelleAnnee) {
		Selection.setAnnee(nouvelleAnnee);
		$scope.$broadcast("anneeDidChange");
		$scope.annee = Selection.annee();
	};

//initialisation	
	$scope.setAnnee(new Date().getFullYear());
	var resourcePersonne = DataSource({nature:"personne"});
	$scope.listePersonnes=resourcePersonne.get(function() {
		$scope.setPersonneCourante($scope.listePersonnes[0]);
	});
}