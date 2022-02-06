App = {
    web3Provider: null,
    contracts: {},
    account: 0x0,

    init: async function () {
        // init web function.
        return await App.initWeb3();
    },

    initWeb3: async function () {
        /*
         * Purpose of this function is to interface
         * between our blockchain contract and web
         * interface
         */

        if (typeof web3 !== "undefined") {

            App.web3Provider = window.ethereum;
            web3 = new Web3(window.ethereum);

        } else {
            App.provider = new Web3.providers.HttpProvider('http://localhost:7545');
            web3 = new Web3(App.web3Provider);

        }
        return App.initContract();
    },

    initContract: function () {
        /*
         * It initializes our contract
         */
        $.getJSON("Contest.json", function (contest) {
            App.contracts.Contest = TruffleContract(contest);
            App.contracts.Contest.setProvider(App.web3Provider);

            // App.listenForEvents();
            return App.render();
        });
    },

    listenForEvents: function () {
        App.contracts.Contest.deployed().then(function (instance) {
            instance.votedEvent({}, {
                fromBlock: 0,
                toBlock: 'latest'
            }).watch(function (err, event) {
                console.log("event triggered", event);

                App.render();
            });
        });
    },

    render: function () {
        var contestInstance;
        var loader = $("#loader");
        var content = $("#content");

        loader.show();
        content.hide();

        web3.eth.getCoinbase(function (err, account) {

            if (err === null) {
                App.account = account;
                $("#accountAddress").html("Your Account is : " + account);
            }

        });

        App.contracts.Contest.deployed().then(function (instance) {
            contestInstance = instance;
            return contestInstance.contestantsCount();
        }).then(function (contestantCount) {
            var contestantsResults = $("#contestantsResults");
            contestantsResults.empty();
            var contestantsSelect = $("#contestantsSelect");
            contestantsSelect.empty();


            for (var i = 1; i <= contestantCount; i++) {
                contestInstance.contestants(i).then(function (contestant) {
                    var id = contestant[0];
                    var name = contestant[1];
                    var voteCount = contestant[2];

                    //render contestant Result
                    var contestantTemplate = "<tr><th>" + id + "</th>" + "<td>" + name + "</td>" + "<td>" + voteCount + "</td>" + "</tr>";
                    contestantsResults.append(contestantTemplate);

                    //Render candidate voting option
                    var contestOption = "<option value='" + id + "' >" + name + "</option>";
                    contestantsSelect.append(contestOption);

                });
            }

            loader.hide();
            content.show();

        }).catch(function (error) {
            console.warn(error);

        });
    },
    // bindEvents: function() {
    //   $(document).on('click', '.btn-adopt', App.handleAdopt);
    // },

    castVote: function () {
        var contestantId = $("#contestantsSelect").val();
        App.contracts.Contest.deployed().then(function (instance) {
            return instance.vote(contestantId, {from: App.account});
        }).then(function (result) {
            $("#content").hide();
            $("#loader").show();
        }).catch(function (err) {
            console.error(err);
        });
    }
};

$(function () {
    $(window).load(function () {
        App.init();
    });
});
