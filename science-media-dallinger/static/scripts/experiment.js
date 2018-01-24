var my_node_id;
var story;
var storyHTML;
var minimum_word_length = 30;

// Prevent multiple submissions.
lock = false;

// Consent to the experiment.
$(document).ready(function() {

  // do not allow user to close or reload
  prevent_exit = true;

  // Print the consent form.
  $("#print-consent").click(function() {
    console.log("hello");
    window.print();
  });

  // Consent to the experiment.
  $("#consent").click(function() {
    store.set("hit_id", dallinger.getUrlParameter("hit_id"));
    store.set("worker_id", dallinger.getUrlParameter("worker_id"));
    store.set("assignment_id", dallinger.getUrlParameter("assignment_id"));
    store.set("mode", dallinger.getUrlParameter("mode"));

    dallinger.allowExit();
    window.location.href = '/instructions';
  });

  // Consent to the experiment.
  $("#no-consent").click(function() {
    dallinger.allowExit();
    window.close();
  });

  // Move on to the experiment.
  $("#go-to-experiment").click(function() {
    dallinger.allowExit();
    window.location.href = '/exp';
  });

  // Confirm that we're done with reading the stimulus.
  $("#finish-reading").click(function() {
    $("#stimulus").hide();
    $("#response-form").show();
    $("#submit-response").removeClass('disabled');
    $("#submit-response").html('Submit');
  });

  $("#submit-response").click(function() {

    if(checkWordCount() & checkBadWords()) {

      $("#submit-response").addClass('disabled');
      $("#submit-response").html('Sending...');

      var response = $("#reproduction").val();

      $("#reproduction").val("");

      reqwest({
        url: "/info/" + my_node_id,
        method: 'post',
        data: {
          contents: response,
          info_type: "Info"
        },
        success: function (resp) {
          create_agent();
        }
      });
    }
  });

  // Move on to the experiment.
  $("#go-to-experiment").click(function () {
    dallinger.allowExit();
    window.location.href = '/exp';
  });

  // Submit the questionnaire ONLY if we haven't clicked yet.
  if (lock===false){
    $("#submit-questionnaire").click(function (){

      dallinger.allowExit();

      // Prevent multiple submission clicks.
      lock = true;
      $(document).off('click');

      // Submit the questionnaire.
      mySubmitResponses();
    });
  };
});

// Create the agent.
var create_agent = function() {
  $('#finish-reading').prop('disabled', true);
  reqwest({
    url: "/node/" + dallinger.identity.participantId,
    method: 'post',
    type: 'json',
    success: function (resp) {
      $('#finish-reading').prop('disabled', false);
      my_node_id = resp.node.id;
      get_info(my_node_id);
    },
    error: function (err) {
      console.log(err);
      errorResponse = JSON.parse(err.response);
      if (errorResponse.hasOwnProperty('html')) {
        $('body').html(errorResponse.html);
      } else {
        dallinger.allowExit();
        dallinger.goToPage('questionnaire');
      }
    }
  });
};

// Get info from the network.
var get_info = function() {
  reqwest({
    url: "/node/" + my_node_id + "/received_infos",
    method: 'get',
    type: 'json',
    success: function (resp) {
      story = resp.infos[0].contents;
      console.log(story)
      storyHTML = story;
      $("#story").html(storyHTML);
      $("#stimulus").show();
      $("#response-form").hide();
      $("#finish-reading").show();
    },
    error: function (err) {
      console.log(err);
      var errorResponse = JSON.parse(err.response);
      $('body').html(errorResponse.html);
    }
  });
};
var mySubmitResponses = function () {
    mySubmitNextResponse(0, dallinger.submitAssignment);
};

var mySubmitNextResponse = function (n, callback) {

    // Get all the ids.
    var ids = $("form .question select, input, textarea").map(
        function () {
            return $(this).attr("id");
        }
    );

    reqwest({
        url: "/question/" + dallinger.identity.participantId,
        method: "post",
        type: "json",
        data: {
            question: $("#" + ids[n]).attr("name"),
            number: n + 1,
            response: $("#" + ids[n]).val()
        },
        success: function() {
            if (n <= ids.length) {
                mySubmitNextResponse(n + 1, callback);
            } else {
              callback()
            }
        },
        error: function (err) {
            var errorResponse = JSON.parse(err.response);
            if (errorResponse.hasOwnProperty("html")) {
                $("body").html(errorResponse.html);
            }
            callback()
        }
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
  }
    return true
  }
}

// from: https://gist.github.com/gidili/4684261
String.prototype.contains = function(str) { return this.indexOf(str) != -1; };

// expand using: https://github.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words/blob/master/en
var profanities = new Array("fuck", "shit");

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
