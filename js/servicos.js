(function() {
// Geração de Listagem dos tarefas
var OrcApp = angular.module('orcApp', ['ngRoute'])
	
	.config(function($routeProvider) {
		$routeProvider.
			when('/', {
				templateUrl: 'servicos.html',
				controller: 'OrcamentoController'
			}).
			otherwise({
				redirectTo: '/'
			});
	})

	.factory ('servico', function($http){
		// Apontamento para os dados em formato JSON
		function getServicos(callback){
			$http({
				method: 'GET',
				url: 'servicos.json',
				cache: false
			}).success(callback);
		}

		return {
			list: getServicos,
			find: function(idservico, callback){
				getServicos(function(servicos) {
					var serv = servicos.filter (function (entry) {
						return entry.idservico == idservico;
					})[0];
					callback(serv);
				});
			}
		}
	})

	.directive('checkedDirective', function() {
		return {
			restrict: 'AE', // A - Attibute | E - Element
			templateUrl: 'images/check12.svg'
		};
	})

	.directive('closeDirective', function() {
		return {
			restrict: 'AE', // A - Attibute | E - Element
			templateUrl: 'images/close12.svg'
		};
	})
	
	.controller('OrcamentoController', function ($scope, servico){
		
		$scope.valorPF = 58;
		$scope.parcelaMinima = 500;
		$scope.horasdia = 5;
		$scope.requisitados = [];
		$scope.tempoTotal = 0;
		$scope.valorTotal = 0;

		servico.list(function(data) {
			$scope.servicos = data
		});

		$scope.delItem = function(id, lista) {
			var s1 = [];
			var s2 = [];
			for (var i = 0; i < lista.length; i++) {
				s1 = lista.slice(0, id);
				s2 = lista.slice(id + 1);
			};
			return s1.concat(s2);
		};

		$scope.delTarefa = function(idservico, idtarefa) {
			//console.log("Deleta Tarefa:" + idtarefa + " do Servico:" + idservico);
			$scope.requisitados[idservico].tarefas = $scope.delItem(idtarefa, $scope.requisitados[idservico].tarefas);
			$scope.atualizaTotal();
		};

		$scope.addTarefa = function(idservico, tarefa) {
			//console.log("Adiciona " + tarefa.descricao + " ao Servico:" + idservico);
			if ($scope.requisitados[idservico].tarefas == null) {
				$scope.requisitados[idservico].tarefas = [];
			};
			$scope.requisitados[idservico].tarefas.push ({
				descricao:tarefa.descricao,
				quantidade:tarefa.quantidade,
				custoEquivalente:tarefa.custoEquivalente,
				tempo:tarefa.tempo
			});
			$scope.atualizaTotal();
		};

		$scope.delServico = function(idservico) {
			//console.log("Deleta Serviço: " + idservico);
			$scope.requisitados = $scope.delItem(idservico, $scope.requisitados);
			$scope.atualizaTotal();	
		};
		
		$scope.addServico = function(idservico) {
			$scope.tarefa = {};
			servico.find(idservico, function(requisitado) {
				$scope.requisitados.push({
					idservico: requisitado.idservico,
					tipo: requisitado.tipo,
					tarefas : []
				});
			});
			
			//console.log("Serviços Requisitados: " + ($scope.requisitados.length + 1));
		};

		$scope.tempoDoServico = function(indice) {
			var tempoServico = 0;
			if ($scope.requisitados[indice].tarefas.length > 0) {
				for (var i = 0; i <$scope.requisitados[indice].tarefas.length; i++) {
					tempoServico += $scope.requisitados[indice].tarefas[i].tempo * $scope.requisitados[indice].tarefas[i].quantidade
				};
				//console.log("IDServico:" + indice + " Tempo Total: " + tempoServico);
			};
			return tempoServico;
		};

		$scope.valorDoServico = function(indice) {
			var valorServico = 0;
			if ($scope.requisitados[indice].tarefas.length > 0) {
				for (var i = 0; i <$scope.requisitados[indice].tarefas.length; i++) {
					valorServico += $scope.requisitados[indice].tarefas[i].custoEquivalente * $scope.requisitados[indice].tarefas[i].quantidade
				};
			};
			return valorServico;
		};

		$scope.atualizaTotal = function() {
			$scope.tempoTotal = 0;
			$scope.valorTotal = 0;
			for (var s = 0; s < $scope.requisitados.length; s++) {
				$scope.tempoTotal += $scope.tempoDoServico(s);
				$scope.valorTotal += $scope.valorDoServico(s);	
			};
			$scope.valorTotal *= $scope.valorPF;
		};

		$scope.arredonda = function(num) {
			return Math.round(num);
		}
	});
})();