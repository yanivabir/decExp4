/**
 * jspsych-deck-rating
 * Yaniv Abir
 *
 *
 * Plugin for animating deck shuffles. Retruns no special data.
 **/


jsPsych.plugins["structure-quiz"] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'structure-quiz',
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
        pretty_name: 'Top card',
        default: undefined,
        description: 'image file for top card'
      },
      BCard: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Bottom card',
        default: undefined,
        description: 'image file for bottom card'
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
      prompt :{
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: 'Which of these decks belongs on this table?',
        description: 'Prompt above stimulus'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    var stylesheet = document.styleSheets[0];
    stylesheet.deleteRule(stylesheet.cssRules.length - 1);

    var choice = ''; // Choice

    var stimulus = '<div class="structure-quiz-prompt">' + trial.prompt +
    '</div><div class="structure-quiz">\
    <table><tr>\
    <td class="structure-quiz">\
    <img src="/static/images/' +
    trial.table +
    '.jpg" class="tables"></img>\
    </td>\
    <td class="structure-quiz">' +
    mkMovingDeck(trial.TCard, deck_size = 10, card_offset = 0.3, undefined, 'T') +
    mkMovingDeck(trial.BCard, deck_size = 10, card_offset = 0.3, undefined, 'B') +
    '</td>\
    </tr></table>\
    </div>'

    // draw
    display_element.innerHTML = stimulus;

    // Pointer
    display_element.querySelector('#flip-toggleT9').style.cursor = 'pointer';
    display_element.querySelector('#flip-toggleB9').style.cursor = 'pointer';

    // start time
    var start_time = Date.now();

    // add event listeners to buttons
    display_element.querySelector('#flip-toggleT9').addEventListener('click',
      function(){
        choice = 'T';
        end_trial();
      });
    display_element.querySelector('#flip-toggleB9').addEventListener('click',
      function(){
        choice = 'B';
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
        'chosen_deck': choice == 'T' ? trial.TCard : trial.BCard
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
