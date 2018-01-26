var my_node_id;

var minimum_word_length;
var instruction_text;

var version = 0;

var profanities = new Array("2g1c","2 girls 1 cup","acrotomophilia","alabama hot pocket","alaskan pipeline","anilingus","apeshit","arsehole","asshole","assmunch","auto erotic","autoerotic","babeland","baby batter","baby juice","ball gag","ball gravy","ball kicking","ball licking","ball sack","ball sucking","bangbros","bareback","barely legal","barenaked","bastard","bastardo","bastinado","bbw","bdsm","beaner","beaners","beaver cleaver","beaver lips","bestiality","big black","big breasts","big knockers","big tits","bimbos","birdlock","bitch","bitches","black cock","blonde action","blonde on blonde action","blowjob","blow job","blow your load","blue waffle","blumpkin","bollocks","bondage","boner","boob","boobs","booty call","brown showers","brunette action","bukkake","bulldyke","bullet vibe","bullshit","bung hole","bunghole","busty","buttcheeks","butthole","camel toe","camgirl","camslut","camwhore","carpet muncher","carpetmuncher","chocolate rosebuds","circlejerk","cleveland steamer","clitoris","clover clamps","clusterfuck","coprolagnia","coprophilia","cornhole","creampie","cumming","cunnilingus","darkie","date rape","daterape","deep throat","deepthroat","dendrophilia","dildo","dingleberry","dingleberries","dirty pillows","dirty sanchez","doggie style","doggiestyle","doggy style","doggystyle","dog style","dolcett","domination","dominatrix","dommes","donkey punch","double dong","double penetration","dp action","dry hump","dvda","eat my ass","ecchi","ejaculation","erotic","erotism","escort","eunuch","faggot","fecal","felch","fellatio","feltch","female squirting","femdom","figging","fingerbang","fingering","fisting","foot fetish","footjob","frotting","fuck","fuck buttons","fuckin","fucking","fucktards","fudge packer","fudgepacker","futanari","gang bang","gay sex","genitals","giant cock","girl on top","girls gone wild","goatcx","goatse","god damn","gokkun","golden shower","goodpoop","goo girl","goregasm","group sex","g-spot","hand job","handjob","hentai","homoerotic","hot carl","hot chick","how to kill","how to murder","huge fat","jack off","jail bait","jailbait","jelly donut","jerk off","jigaboo","jiggaboo","jiggerboo","jizz","juggs","kike","kinbaku","kinkster","kinky","knobbing","leather restraint","leather straight jacket","lemon party","lolita","lovemaking","make me come","male squirting","masturbate","menage a trois","milf","missionary position","motherfucker","mound of venus","mr hands","muff diver","muffdiving","nambla","nawashi","neonazi","nigga","nigger","nig nog","nimphomania","nipple","nipples","nsfw images","nympho","nymphomania","octopussy","omorashi","one cup two girls","one guy one jar","panties","pedobear","pedophile","phone sex","piece of shit","piss pig","pisspig","playboy","pleasure chest","pole smoker","ponyplay","poontang","poop chute","poopchute","prince albert piercing","pthc","queaf","queef","raghead","raging boner","reverse cowgirl","rimjob","rosy palm","rosy palm and her 5 sisters","rusty trombone","schlong","scissoring","shaved beaver","shaved pussy","shemale","shibari","shitblimp","shitty","shrimping","slanteye","s&m","sodomize","sodomy","spic","splooge","splooge moose","spooge","spread legs","strap on","strapon","strappado","strip club","style doggy","suicide girls","sultry women","swastika","swinger","tainted love","tea bagging","threesome","throating","tongue in a","towelhead","tranny","tribadism","tub girl","tubgirl","twat","twink","twinkie","two girls one cup","upskirt","urethra play","urophilia","vagina","venus mound","violet wand","vorarephilia","voyeur","vulva","wetback","wet dream","white power","wrapping men","wrinkled starfish","xx","xxx","yaoi","yellow showers","yiffy","zoophilia"); // To expand, use https://github.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words/blob/master/en


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

    if(version == 0) {
      minimum_word_length = 2;
      instruction_text = "<p>In your own words, provide a summary of what you just read. Explain the finding as though you were explaining it to a friend.</p>";
    }
    if(version == 1) {
      minimum_word_length = 10;
      instruction_text = "<p>In your own words, provide a summary of what you just read. Explain the finding as though you were explaining it to a friend.</p>";
    }
    if(version == 2) {
      minimum_word_length = 10;
      instruction_text = "<p>In your own words, provide a summary of what you just read in a paragraph or two. Explain the finding as though you were explaining it to a friend.</p>";
    }
    if(version == 3) {
      minimum_word_length = 30;
      instruction_text = "<p>In your own words, provide a summary of what you just read. Explain the finding as though you were explaining it to a friend.</p>";
    }

    document.getElementById('instruction_text').innerHTML = instruction_text;

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

      allow_exit();

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

      allow_exit();

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
