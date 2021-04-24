App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    hasVoted: false,

    init: async function() {
      return await App.initWeb3();
    },

    initWeb3: async function() {

      if (window.ethereum) {
        App.web3Provider = window.ethereum;
        await window.ethereum.enable();
        web3 = new Web3(App.web3Provider);
        return App.initContract();
      } else {
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        web3 = new Web3(App.web3Provider);
        return App.initContract();
      }
    },

    initContract: function() {
      $.getJSON("Election.json", function(election) {
        // Instantiate a new truffle contract from the artifact
        App.contracts.Election = TruffleContract(election);
        // Connect provider to interact with contract
        App.contracts.Election.setProvider(App.web3Provider);
        App.listenForEvents();
        return App.render();
      });
    },

    // Listen for events emitted from the contract
    listenForEvents: function() {
      App.contracts.Election.deployed().then(function(instance) {
        // Restart Chrome if you are unable to receive this event
        // This is a known issue with Metamask
        // https://github.com/MetaMask/metamask-extension/issues/2393
        instance.votedEvent({}, {
          fromBlock: 0,
          toBlock: 'latest'
        }).watch(function(error, event) {
          console.log("event triggered", event)
          // Reload when a new vote is recorded
          App.render();
        });
      });
    },
    render: function() {
      var electionInstance;
      var loader = $("#loader");
      var show_messages = $("#messageboard");
      var vote_complete = $("#vote_complete");
      var content = $("#content");

      loader.show();
      show_messages.hide();
      vote_complete.hide();
      content.hide();

      // Load account data
      web3.eth.getCoinbase(function(err, account) {
        if (err === null) {
          App.account = account;
          globalThis.globalAccount = account;
          $("#accountAddress").html("Your Account: " + account);
        }
      });

      // Load contract address
      App.contracts.Election.deployed().then(function(instance) {
        electionInstance = instance;
        $("#contractAddress").html("Please Deposit ETH to: " + electionInstance.address);
      });

      // Load balance data
      App.contracts.Election.deployed().then(function(instance) {
        electionInstance = instance;
        account = globalAccount
        return electionInstance.stake(account);
      }).then(function(stake) {
        $("#accountBalance").html("Your Balance: " + stake/1e18 + " ETH");
      });

      App.contracts.Election.deployed().then(function(instance) {
          electionInstance = instance;
          return electionInstance.messageCount();
        }).then(function(messageCount) {
            var messageArray = [];
            for (var i = 1; i <= messageCount; i++) {
              messageArray.push(electionInstance.messages(i));
            }
            Promise.all(messageArray).then(function(values) {
              var messageResults = $("#messageResults");
              messageResults.empty();

              var message = $('#message');
              message.empty();

              for (var i = 0; i < messageCount; i++) {
                var id = values[i][0];
                var message_text = values[i][1];
                var messageTemplate = "<tr><th>" + id + "</th><td>" + message_text + "</td></tr>"
                messageResults.append(messageTemplate);
              }
            })
          })
          // Load contract data
          App.contracts.Election.deployed().then(function(instance) {
            electionInstance = instance;
            return electionInstance.candidatesCount();
          }).then(function(candidatesCount) {
            var candArray = [];
            for (var i = 1; i <= candidatesCount; i++) {
              candArray.push(electionInstance.candidates(i));
            }
            Promise.all(candArray).then(function(values) {
              var candidatesResults = $("#candidatesResults");
              candidatesResults.empty();

              var rank1 = $('#rank1');
              rank1.empty();

              var rank2 = $('#rank2');
              rank2.empty();

              var rank3 = $('#rank3');
              rank3.empty();

              var rank4 = $('#rank4');
              rank4.empty();

              // Function extracts a column from an array
              function getCol(matrix, col){
                     var column = [];
                     for(var i=0; i<matrix.length; i++){
                        column.push(parseInt(matrix[i][col]));
                     }
                     return column;
                  }

              var pct_array = values;
              for (var i = 0; i < candidatesCount; i++) {
                var id = values[i][0];
                var name = values[i][1];
                var countRank1 = values[i][2] / getCol(values,2).reduce(function(acc, val) { return acc + val; }, 0);
                var countRank2 = values[i][3] / getCol(values,3).reduce(function(acc, val) { return acc + val; }, 0);
                var countRank3 = values[i][4] / getCol(values,4).reduce(function(acc, val) { return acc + val; }, 0);
                var countRank4 = values[i][5] / getCol(values,5).reduce(function(acc, val) { return acc + val; }, 0);

                // Render candidate Result
                var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + countRank1 + "</td><td>" + countRank2 + "</td><td>" + countRank3 + "</td><td>" + countRank4 + "</td></tr>"
                candidatesResults.append(candidateTemplate);

                // Render candidate ballot option
                var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
                rank1.append(candidateOption);
                rank2.append(candidateOption);
                rank3.append(candidateOption);
                rank4.append(candidateOption);

              }

              // Function extracts the index corresponding to the max value from a column array
              function winner(col) {
                var maxidx = []
                var _max = col.reduce(function(a, b) { return Math.max(a, b); });
                for (var i = 0; i < col.length; i++) {
                  if (col[i] >= _max) {
                    maxidx.push(i+1);
                  }
                }
                return maxidx;
              }            

              // The ranked choice function
              function ranked_choice(values,start_idx) {
                var weighted_vote = new Array(4+1).join('0').split('').map(parseFloat); // Initialize array of 0's
                for (var i = 0; i < candidatesCount; i++) {
                  // For each rank 1-4 get the column and find the max vote
                  var _col = getCol(values,start_idx+i);
                  var weight = 1/(i+1); // Weights are determined by 1/rank.
                  var weighted_col = _col.map(function(x) { return x*weight; }); // Weighted votes are the sum-product of votes*weights for each candidate
                  for (var j=0;j<candidatesCount;j++) {
                    weighted_vote[j] += weighted_col[j];
                  }
                }
                var max_idx = winner(weighted_vote); // Return the list of indices associated with the maximum number of weighted votes
                if (max_idx.length>1) { // Check for a tie scenario
                  $("#maxidx").html("Tie Between Candidates " + max_idx);
                } else {
                  $("#maxidx").html("Winner is Candidate " + max_idx);
                }
              }

              ranked_choice(values,2);
              
            });
            return electionInstance.voters(App.account);
          }).then(function(hasVoted) {
            // Do not allow a user to vote
            if (hasVoted) {
              $('form').hide();
              $('vote_complete').show();
              vote_complete.show();
              show_messages.show();
            } else {
              vote_complete.hide();
              show_messages.show();
            }
            loader.hide();
            content.show();
            show_messages.show();
          }).catch(function(error) {
            console.warn(error);
          });
        },


        castVote: function() {
          var rank1 = $('#rank1').val();
          var rank2 = $('#rank2').val();
          var rank3 = $('#rank3').val();
          var rank4 = $('#rank4').val();

          App.contracts.Election.deployed().then(function(instance) {
            return instance.vote(rank1, rank2, rank3, rank4, {
              from: App.account
            });
          }).then(function(result) {
            // Wait for votes to update
            $("#content").hide();
            $("#loader").show();
          }).catch(function(err) {
            console.error(err);
          });
        },
        postMessage: function() {
          var message_text = $('#message_text').val();

          App.contracts.Election.deployed().then(function(instance) {
            return instance.createmessage(message_text,{from: App.account});
          }).then(function(result) {
            // Wait for votes to update
            $("#content").hide();
            $("#loader").show();
          }).catch(function(err) {
            console.error(err);
          });
        }
    };

    $(function() {
      $(window).load(function() {
        App.init();
      });
    });