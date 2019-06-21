App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
	// Load projects
	$.getJSON('../projects.json', function(data) {
	  var projectRow = $('#projectRow');
	  var projectTemplate = $('#projectTemplate');

	  for (i = 0; i < data.length; i ++) {
		var start = new Date(data[i].start);
		var end = new Date(data[i].end);
		//var duration = (end - start) / (1000 * 60 * 60 * 24);
		//var startDate = start.getUTCFullYear() + "-" + (start.getUTCMonth()+1) + "-" + start.getUTCDate();
		var endDate = end.getUTCFullYear() + "/" + (end.getUTCMonth()+1) + "/" + end.getUTCDate();
		var goal = data[i].goal + " eth";

		projectTemplate.find('.panel-title').text(data[i].name);
		projectTemplate.find('img').attr('src', data[i].picture);
		projectTemplate.find('.project-fundraiser').text(data[i].fundraiser);
		projectTemplate.find('.project-end').text(endDate);
		projectTemplate.find('.project-goal').text(goal);
		projectTemplate.find('.btn-back').attr('data-id', data[i].id);
		projectTemplate.find('.btn-vote').attr('data-id', data[i].id);
		projectTemplate.find('.progress-vote').attr('data-id', data[i].id);

		projectRow.append(projectTemplate.html());
	  }
	});

	return await App.initWeb3();
  },

  initWeb3: async function() {
	if (typeof web3 !== 'undefined') {
	  // If a web3 instance is already provided by Meta Mask.
	  App.web3Provider = web3.currentProvider;
	  web3 = new Web3(web3.currentProvider);
	} else {
	  // Specify default instance if no web3 instance provided
	  App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
	  web3 = new Web3(App.web3Provider);
	}
	return App.initContract();
  },

  initContract: function() {
	$.getJSON("Funding_control.json", function(funding) {
	  // Instantiate a new truffle contract from the artifact
	  App.contracts.Funding_control = TruffleContract(funding);
	  // Connect provider to interact with contract
	  App.contracts.Funding_control.setProvider(App.web3Provider);
	  return App.bindEvents();
	});
  },

  bindEvents: function() {
	$(document).on('click', '.btn-back', App.backProject);
	$(document).on('click', '.btn-vote', App.voteProject);
	return App.render();
  },

  render: function() {
	var fundingInstance;

	// Load account data
	web3.eth.getCoinbase(function(err, account) {
	  if (err === null) {
		App.account = account;
		$("#accountAddress").html("Current accont: " + account);
	  }
	});

	// Initialize projects
	// $.getJSON('../projects.json').then(function(data) {
	// 	App.contracts.Funding_control.deployed().then(function(instance) {
	// 		for (var i = 0; i < data.length; i++) {
	// 			var start = new Date(data[i].start);
	// 			var end = new Date(data[i].end);
	// 			start = start / (1000 * 60 * 60 * 24);
	// 			end = end / (1000 * 60 * 60 * 24);
	// 			var goal = parseInt(data[i].goal);
	// 			instance.newProject(data[i].name, start, end, 1, goal);
	// 		}
	// 	}).catch(function(error) {
	// 		console.error(error);
	// 	});
	// });

	// Load contract data
	App.contracts.Funding_control.deployed().then(function(instance) {
	  fundingInstance = instance;
	  return fundingInstance.projectsCount();
	}).then(function(projectsCount) {
	  console.log("project count: ", projectsCount);
	}).catch(function(error) {
	  console.warn(error);
	});
  },

  backProject: function(event) {
	event.preventDefault();
	var projectId = parseInt($(event.target).data('id'));
	App.contracts.Funding_control.deployed().then(function(instance) {
		return instance.backProject(projectId, 1, {from: App.account, value: web3.toWei(1,'ether')});
	}).then(function(result) {
		alert("You backed the project for 1 eth!");
	}).catch(function(error) {
		console.warn(error);
	});
  },

  voteProject: function(event) {
	event.preventDefault();
	var projectId = parseInt($(event.target).data('id'));
	console.log(projectId);
	App.contracts.Funding_control.deployed().then(function(instance) {
		return instance.voteProject(projectId, {from: App.account});
	}).then(function(result) {
		console.log(result)
		alert("You agree for the fundraiser to use the fund!");
		App.updateProgressBar(projectId, parseInt(result[1]), parseInt(result[2]));
	}).catch(function(error) {
		console.warn(error);
	});
  },

  updateProgressBar: function(projectId, voteNum, backerNum) {
	console.log(voteNum);
	console.log(backerNum);
	var agreePercent = (voteNum / backerNum) * 100;
	var progressBar = $("div[role='progressbar'][data-id="+projectId+"]");
	progressBar.css("width", agreePercent+"%");
	progressBar.html(agreePercent+"% voted");
  }
};

$(function() {
  $(window).load(function() {
	App.init();
  });
});
