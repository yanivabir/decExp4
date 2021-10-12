/**
 * jspsych-memory-quiz
 * Yaniv Abir
 *
 *
 * Plugin for testing memory of card-table pairings.
 **/


jsPsych.plugins["memory-quiz"] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'memory-quiz',
    description: '',
    parameters: {
      table1: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Table image',
        default: undefined,
        description: 'image file for table'
      },
      table2: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Table image',
        default: undefined,
        description: 'image file for table'
      },
      table3: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Table image',
        default: undefined,
        description: 'image file for table'
      },
      table4: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Table image',
        default: undefined,
        description: 'image file for table'
      },
      card: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Top card',
        default: undefined,
        description: 'image file for top card'
      },
      answer: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Answer',
        default: undefined,
        description: 'The correct answer'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: 'Which table does this deck belong on?',
        description: 'Prompt above stimulus'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    var stylesheet = document.styleSheets[0];
    stylesheet.deleteRule(stylesheet.cssRules.length - 1);

    var choice = ''; // Choice

    var stimulus = '</div><div class="structure-quiz">\
    <table width=890px><tr>\
    <td style="padding: 58px" width=60%><div class="structure-quiz-prompt">' + trial.prompt + '</div></td>\
    <td style="position: relative; padding: 58px">' +
    mkMovingDeck(trial.card, deck_size = 10, card_offset = 0.3, undefined, 'T') +
    '</td></tr></table>\
    <table><tr>\
    <td class="memory-quiz">\
    <img src="/static/images/' +
      trial.table1 +
      '.jpg" class="tables" id = "table1"></img>\
    </td>\
    <td class="memory-quiz">\
    <img src="/static/images/' +
      trial.table2 +
      '.jpg" class="tables" id = "table2"></img>\
    </td>\
    <td class="memory-quiz">\
    <img src="/static/images/' +
      trial.table3 +
      '.jpg" class="tables" id = "table3"></img>\
    </td>\
    <td class="memory-quiz">\
    <img src="/static/images/' +
      trial.table4 +
      '.jpg" class="tables" id = "table4"></img>\
    </td>\
    </tr></table>\
    </div>'

    // draw
    display_element.innerHTML = stimulus;

    // Pointer
    display_element.querySelector('#table1').style.cursor = 'pointer';
    display_element.querySelector('#table2').style.cursor = 'pointer';
    display_element.querySelector('#table3').style.cursor = 'pointer';
    display_element.querySelector('#table4').style.cursor = 'pointer';

    // start time
    var start_time = Date.now();

    // add event listeners to buttons
    display_element.querySelector('#table1').addEventListener('click',
      function() {
        choice = '1';
        end_trial();
      });
    display_element.querySelector('#table2').addEventListener('click',
      function() {
        choice = '2';
        end_trial();
      });
    display_element.querySelector('#table3').addEventListener('click',
      function() {
        choice = '3';
        end_trial();
      });
    display_element.querySelector('#table4').addEventListener('click',
      function() {
        choice = '4';
        end_trial();
      });


    // function to end trial when it is time
    var end_trial = function() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();


      // gather the data to store for the trial
      var trial_data = {
        'table1': trial.table1,
        'table2': trial.table2,
        'table3': trial.table3,
        'table4': trial.table4,
        'card': trial.card,
        'choice': choice,
        'chosen_table': trial['table' + choice],
        'correct': trial['table' + choice] == trial.answer,
        'answer': trial.answer
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
