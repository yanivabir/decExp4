/**
 * jspsych-test-feedback
 * Yaniv Abir
 *
 *
 * Plugin for test trial feedback
 **/


jsPsych.plugins["test-feedback"] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'test-feedback',
    description: '',
    parameters: {
      table: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Table image',
        default: undefined,
        description: 'image file for table'
      },
      TCard: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Card',
        default: undefined,
        description: 'image file for card'
      },
      BCard: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Card',
        default: undefined,
        description: 'image file for card'
      },
      TMasks: {
        type: jsPsych.plugins.parameterType.ARAAY,
        pretty_name: 'Masks',
        default: [],
        description: 'Color of cards'
      },
      BMasks: {
        type: jsPsych.plugins.parameterType.ARAAY,
        pretty_name: 'Masks',
        default: [],
        description: 'Color of cards'
      },
      reward_color: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Reward color',
        default: undefined,
        description: 'String color of reward'
      },
      correct: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Participant correct',
        default: undefined,
        description: 'Whether the participant got it correct'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    // store response
    var response = {
      rt: null,
      key: null
    };
    var keyboardListener = null;

    // Calculate proportion reward out of ten
    var Tproportion = trial.TMasks.reduce((n, x) =>
        n + (x === trial.reward_color), 0),
      Bproportion = trial.BMasks.reduce((n, x) =>
        n + (x === trial.reward_color), 0);

    var stimulus = '<div class="feedback_table">\
    <div class="table_icon feedback">\
    <img src="/static/images/' +
      trial.table +
      '.jpg" class="tables feedback"></img>\
      </div>\
      <div class="inner icon feedback"><div class="feedback top_deck">';

    stimulus += mkMovingDeck(trial.TCard, deck_size = 10,
      card_offset = 0.3, trial.TMasks, 'T');

    stimulus += '</div><div class="feedback bottom_deck">'

    stimulus += mkMovingDeck(trial.BCard, deck_size = 10,
      card_offset = 0.3, trial.BMasks, 'B');

    stimulus += '</div></div></div>';

    stimulus += '<div class="mat" id="mat"></div>';

    stimulus = '<div class="deck-feedback-stimulus">' + stimulus + '</div>';

    stimulus = '<div class="deck-rating-prompt">' +
      '<p>You made the <b>' + (trial.correct ? 'correct' : 'wrong') +
      '</b> choice at this table:<br> The deck you chose has ' + Tproportion +
      '/10 ' +
      color_names[trial.reward_color].toLowerCase() + ' cards.<br></p></div>' +
      stimulus + '<p>The other deck has ' + Bproportion + '/10 ' +
      color_names[trial.reward_color].toLowerCase() +
      ' cards.</p><p>Press the space bar to continue.</p>';

    // draw
    display_element.innerHTML = stimulus;

    // start time
    var start_time = Date.now();

    // Deal and flip cards
    var tl = new TimelineMax({
      onComplete: initiate_response
    });

    for (j = 0; j < 10; j++) {
      tl.to('#flip-toggleT' + (deck_size - 1 - j), 0.2, {
        className: "+=cm" + (j + 1)
      }, j * 0.2 + 0.2)
    }

    for (j = 0; j < 10; j++) {
      tl.to('#flip-toggleT' + (deck_size - 1 - j), 0.15, {
        className: "+=flip"
      }, j * 0.1 + 1.8)
    }

    for (j = 0; j < 10; j++) {
      tl.to('#flip-toggleB' + (deck_size - 1 - j), 0.2, {
        className: "+=cm" + (j + 1)
      }, j * 0.2 + 3.3)
    }

    for (j = 0; j < 10; j++) {
      tl.to('#flip-toggleB' + (deck_size - 1 - j), 0.15, {
        className: "+=flip"
      }, j * 0.1 + 4.9)
    }

    // function to end trial when it is time
    var end_trial = function() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // gather the data to store for the trial
      var trial_data = {
        'table': trial.table,
        'TCard': trial.TCard,
        'BCard': trial.BCard,
        'TMasks': JSON.stringify(trial.TMasks),
        'BMasks': JSON.stringify(trial.BMasks),
        'correct': trial.correct,
        'reward_color': trial.reward_color,
        'rt': response.rt
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    var after_response = function(info) {

      // only record the first response
      if (response.key == null) {
        response = info;
      }

      end_trial();
    };

    // start the response listener
    function initiate_response() {
      keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: [32],
        rt_method: 'date',
        persist: false,
        allow_held_key: false
      });
    }



  };

  return plugin;
})();
