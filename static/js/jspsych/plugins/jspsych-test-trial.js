/**
 * jspsych-test-trial
 * Yaniv Abir
 *
 *
 * Plugin for choosing decks at test.
 **/


jsPsych.plugins["test-trial"] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'test-trial',
    description: '',
    parameters: {
      table: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Table image',
        default: undefined,
        description: 'image file for table'
      },
      RCard: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Right card',
        default: undefined,
        description: 'image file for right card'
      },
      LCard: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Left card',
        default: undefined,
        description: 'image file for left card'
      },
      deck_size: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Deck size',
        default: 20,
        description: 'Number of cards in deck'
      },
      card_offset: {
        type: jsPsych.plugins.parameterType.FLOAT,
        pretty_name: 'Card offset',
        default: 0.3,
        description: 'Offset of each card in px'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: '<p>Choose a deck to draw cards from:<br></p>',
        description: 'Prompt above stimulus'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    var stylesheet = document.styleSheets[0];
    stylesheet.deleteRule(stylesheet.cssRules.length - 1);

    var choice = ''; // Choice

    var stimulus = '<div class="deck-test-prompt">' + trial.prompt +
      '</div><div class="deck-test" style="position: relative;">' +
      mkIntroTable(trial.table, trial.LCard, trial.RCard) +
      '</div>'

    // draw
    display_element.innerHTML = stimulus;

    // Change cursor
    display_element.querySelector('#flip-toggleR19').style.cursor = 'pointer';
    display_element.querySelector('#flip-toggleL19').style.cursor = 'pointer';

    // start time
    var start_time = Date.now();

    // add event listeners to buttons
    display_element.querySelector('#flip-toggleR19').addEventListener('click',
      function() {
        choice = 'R';
        end_trial();
      });
    display_element.querySelector('#flip-toggleL19').addEventListener('click',
      function() {
        choice = 'L';
        end_trial();
      });


    // function to end trial when it is time
    var end_trial = function() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();


      // gather the data to store for the trial
      var trial_data = {
        'table': trial.table,
        'BCard': trial.BCard,
        'TCard': trial.TCard,
        'choice': choice,
        'chosen_deck': choice == 'R' ? trial.RCard : trial.LCard
      };

      // clear the display
      display_element.innerHTML = '';

      // Hide mouse
      var stylesheet = document.styleSheets[0];
      stylesheet.insertRule("* {cursor: none;}", stylesheet.cssRules.length);

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

  };

  return plugin;
})();
