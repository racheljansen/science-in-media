var my_node_id;

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
        store.set("hit_id", getUrlParameter("hit_id"));
        store.set("worker_id", getUrlParameter("worker_id"));
        store.set("assignment_id", getUrlParameter("assignment_id"));
        store.set("mode", getUrlParameter("mode"));

        allow_exit();
        window.location.href = '/instructions';
    });

    // Consent to the experiment.
    $("#no-consent").click(function() {
        allow_exit();
        window.close();
    });

    // Move on to the experiment.
    $("#go-to-experiment").click(function() {
        allow_exit();
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
    });

    // // Submit the questionnaire.
    // $("#submit-questionnaire").click(function() {
    //   mySubmitResponses();
    // });

    // Move on to the experiment.
    $("#go-to-experiment").click(function () {
        allow_exit();
        window.location.href = '/exp';
    });

    // Submit the questionnaire ONLY if we haven't clicked yet.
    // Adapted from Dallinger Griduniverse repo:
    // https://github.com/Dallinger/Griduniverse/blob/master/dlgr/griduniverse/static/scripts/questionnaire.js
    if (lock===false){
        $("#submit-questionnaire").click(function () {

          // Prevent multiple submission clicks.
          lock = true;
          $(document).off('click');

          // Allow the form to submit.
          var $elements = [$("form :input"), $(this)],
              questionSubmission = Dallinger.submitQuestionnaire("questionnaire");
              console.log("Submitting questionnaire.");

          // Submit questionnaire.
          questionSubmission.done(function() {
                go_to_page('debriefing');
              });
      });
    };

    // Finish debriefing and submit HIT.
    if (lock===false){

        // Finish the experiment.
        $("#finish-experiment").click(function() {

          // Prevent multiple submission clicks.
          lock = true;
          $(document).off('click');

          // Submit the HIT.
          submitAssignment();
        });
    };

});

// Create the agent.
var create_agent = function() {
    $('#finish-reading').prop('disabled', true);
    reqwest({
        url: "/node/" + participant_id,
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
                allow_exit();
                go_to_page('questionnaire');
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
    mySubmitNextResponse(0, submitAssignment);
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
Dallinger.submitQuestionnaire = function (name) {
  var formSerialized = $("form").serializeArray(),
      formDict = {},
      deferred = $.Deferred();

  formSerialized.forEach(function (field) {
      formDict[field.name] = field.value;
  });

  reqwest({
    method: "post",
    url: "/question/" + participant_id,
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
