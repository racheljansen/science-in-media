var my_node_id;

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

    // Consent to the experiment.
    $("#go-to-experiment").click(function() {
        allow_exit();
        window.location.href = '/exp';
    });


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

    // Submit the questionnaire.
    $("#submit-questionnaire").click(function() {
      mySubmitResponses();
    });
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
            var storyHTML = markdown.toHTML(story);
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
