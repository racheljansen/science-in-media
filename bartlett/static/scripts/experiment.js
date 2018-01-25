// Create a shell variable for participant's node ID.
var my_node_id;

// Specify important experiment variables.
var minimum_word_length = 30;
var profanities = new Array("fuck", "shit"); // To expand, use https://github.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words/blob/master/en

// Consent to the experiment.
$(document).ready(function() {

  // Do not allow user to close or reload.
  dallinger.preventExit = true;

  // Print the consent form.
  $("#print-consent").click(function() {
    window.print();
  });

  // Consent and go to instructions.
  $("#consent").click(function() {
    store.set("hit_id", dallinger.getUrlParameter("hit_id"));
    store.set("worker_id", dallinger.getUrlParameter("worker_id"));
    store.set("assignment_id", dallinger.getUrlParameter("assignment_id"));
    store.set("mode", dallinger.getUrlParameter("mode"));

    dallinger.allowExit();
    window.location.href = '/instructions';
  });

  // Decline to participate in the experiment.
  $("#no-consent").click(function() {
    dallinger.allowExit();
    window.close();
  });

  // Proceed from instructions to experiment.
  $("#go-to-experiment").click(function() {
    dallinger.allowExit();
    window.location.href = '/exp';
  });

  // Indicate that we've finished reading the stimulus.
  $("#finish-reading").click(function() {
    $("#stimulus").hide();
    $("#response-form").show();
    $("#submit-response").removeClass('disabled');
    $("#submit-response").html('Submit');
  });

  // Submit the written response.
  $("#submit-response").click(function () {

      // Only allow us to move on with minimum words and no profanity.
      if (checkWordCount() & checkBadWords()) {
          $("#submit-response").addClass('disabled');
          $("#submit-response").html('Sending...');

          var response = $("#reproduction").val();

          $("#reproduction").val("");

          // Once we're done, send the response and move on.
          dallinger.createInfo(my_node_id, {
            contents: response,
            info_type: 'Info'
          }).done(function (resp) {
            create_agent();
          });
      };
  });

});

// Create the agent.
var create_agent = function() {
  $('#finish-reading').prop('disabled', true);
  dallinger.createAgent()
    .done(function (resp) {
      $('#finish-reading').prop('disabled', false);
      my_node_id = resp.node.id;
      get_info();
    })
    .fail(function () {
      dallinger.allowExit();
      dallinger.goToPage('questionnaire');
    });
};

// Get stimulus information from the network.
var get_info = function() {
  dallinger.getReceivedInfos(my_node_id)
    .done(function (resp) {

      // Read in the story, already in HTML format.
      var story = resp.infos[0].contents;

      // Update the HTML for participants.
      $("#story").html(story);
      $("#stimulus").show();
      $("#response-form").hide();
      $("#finish-reading").show();
    })
    .fail(function (err) {
      console.log(err);
      var errorResponse = JSON.parse(err.response);
      $('body').html(errorResponse.html);
    });
};

// Check word count.
function checkWordCount(){
  s = document.getElementById("reproduction").value;
  s = s.replace(/(^\s*)|(\s*$)/gi,"");
  s = s.replace(/[ ]{2,}/gi," ");
  s = s.replace(/\n /,"\n");
  if (s.split(' ').length <= minimum_word_length) {
    alert("Please expand a little more on what you have written.");
    return false
  }
  return true
}

// Implement profanity filter.
function checkBadWords(){

  s = document.getElementById("reproduction").value;

  if(containsProfanity(s)){
    alert("An expletive was detected in your text. Please do not use profanity here.");
    return false
  } else {
    return true
  };
}

// from: https://gist.github.com/gidili/4684261
String.prototype.contains = function(str) { return this.indexOf(str) != -1; };

// Check if text contains profanity.
var containsProfanity = function(text){
  var returnVal = false;
  for (var i = 0; i < profanities.length; i++) {
    if(text.toLowerCase().contains(profanities[i].toLowerCase())){
      returnVal = true;
      break;
    }
  }
  return returnVal;
}
