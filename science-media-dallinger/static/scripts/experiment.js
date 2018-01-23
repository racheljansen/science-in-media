var my_node_id;
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

    if(checkWordCount()) {

      $("#submit-response").addClass('disabled');
      $("#submit-response").html('Sending...');

      var response = $("#reproduction").val();

      $("#reproduction").val("");

      reqwest({
        url: "/info/" + dallinger.identity.participantId,
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

  // // Submit the questionnaire.
  // $("#submit-questionnaire").click(function() {
  //   mySubmitResponses();
  // });

  // Move on to the experiment.
  $("#go-to-experiment").click(function () {
      dallinger.allowExit();
      window.location.href = '/exp';
  });

  // Submit the questionnaire ONLY if we haven't clicked yet.
  // Adapted from Dallinger Griduniverse repo:
  // https://github.com/Dallinger/Griduniverse/blob/master/dlgr/griduniverse/static/scripts/questionnaire.js
  if (lock===false){
      $("#submit-questionnaire").click(function (){

          dallinger.allowExit();

          // Prevent multiple submission clicks.
          lock = true;
          $(document).off('click');

          // Allow the form to submit.
          var $elements = [$("form :input"), $(this)],
              questionSubmission = dallinger.submitQuestionnaire("questionnaire");
              console.log("Submitting questionnaire.");

          // Submit questionnaire.
          questionSubmission.done(function(){
                dallinger.goToPage('debriefing');
              });
      });
  };

  // Finish debriefing and submit HIT.
  if (lock===false){

    // Finish the experiment.
    $("#finish-experiment").click(function() {

      dallinger.allowExit();

      // Prevent multiple submission clicks.
      lock = true;
      $(document).off('click');

      // Submit the HIT.
      dallinger.submitAssignment();
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

var get_info = function() {
  reqwest({
    url: "/node/" + my_node_id + "/received_infos",
    method: 'get',
    type: 'json',
    success: function (resp) {
      var story = resp.infos[0].contents;
      var storyHTML = story;
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
    url: "/question/" + participant_id,
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


// Add new (not yet released) code from Dallinger.
dallinger.submitQuestionnaire = function (name) {
  var formSerialized = $("form").serializeArray(),
  formDict = {},
  deferred = $.Deferred();

  formSerialized.forEach(function (field) {
    formDict[field.name] = field.value;
  });

  reqwest({
    method: "post",
    url: "/question/" + dallinger.identity.participantId,
    data: {
      question: name || "questionnaire",
      number: 1,
      response: JSON.stringify(formDict),
    },
    type: "json",
    success: function (resp) {
      deferred.resolve();
    },
    error: function (err) {
      deferred.reject();
      var errorResponse = JSON.parse(err.response);
      $("body").html(errorResponse.html);
    }
  });

  return deferred;
};

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
