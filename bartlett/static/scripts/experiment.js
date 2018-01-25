// Create a shell variable for participant's node ID.
var my_node_id;

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
  $("#submit-response").click(function() {
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
