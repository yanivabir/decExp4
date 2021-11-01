//Comment
// Parameters
var n_tables = 4, // Number of tables per game
  n_exp_blocks = 6, // Number of experimental blocks in this session
  n_blocks_sess1 = 4, // Number of blocks in session 1
  n_exp_blocks_total = 22, // Number of experimental blocks across all sessions
  n_deck_files = 56, // Number of deck image files
  max_response_time = 3000,
  table_worth = 0.25, // Reward per correct choice at table, in $
  color_names = {
    Maroon: 'Red',
    CadetBlue: 'Green',
    Aqua: 'Blue',
    PaleVioletRed: 'Red',
    Thistle: 'Pink',
    Tan: 'Brown',
    chocolate: 'Orange',
    cornflowerblue: 'Blue',
    salmon: 'Pink',
    seagreen: 'Green',
    tomato: 'Red',
    turquoise: 'Turquoise',
    blue: 'Blue',
    orange: 'Orange',
    purple: 'Purple',
    yellow: 'Yellow',
    Red: 'Red',
    SpringGreen: 'Green',
    DeepPink: 'Pink',
    YellowGreen: 'Green',
    Navy: 'Blue',
    Gold: 'Yellow',
    Coral: 'Orange',
    LightSeaGreen: 'Green',
    SteelBlue: 'Blue',
    HotPink: 'Pink',
    SaddleBrown: 'Brown',
    Lime: 'Green',
    Silver: 'Gray',
    Magenta: 'Pink',
    Indigo: 'Purple',
    LightGreen: 'Green',
    Crimson: 'Red',
    OliveDrab: 'Green',
    RebeccaPurple: 'Purple',
    Goldenrod: 'Orange',
    LightSlateGrey: 'Grey',
    Pink: 'Pink',
    RosyBrown: 'Brown',
    PaleTurquoise: 'Blue',
    ForestGreen: 'Green',
    FireBrick: 'Red',
    DarkOrange: 'Orange',
    DodgerBlue: 'Blue',
    Khaki: 'Yellow',
    MediumSlateBlue: 'Purple'
  },
  exp_reward_probs_baseline = [0.25, 0.35, 0.65, 0.75],
  exp_reward_probs_diffs = [0.2, 4 / 15, 1 / 3, 0.4],
  instruction_iti = 100,
  safe_data, // Variable containing data in case of crash
  exp_blocks_tables = [], // Tables, keep in global memory
  exp_reward_probs = [], // Reward probabilitiesm keep in global memory
  exp_blocks_n_trials = []; // Number of trials per game, keep in global memory

// ------- Create CSS rules for card color and card face ------ //
var style = document.createElement("style");
style.appendChild(document.createTextNode(""));
// Add the <style> element to the page
document.head.appendChild(style);
for (i = 0; i < Object.keys(color_names).length; i++) {
  style.sheet.insertRule('div.' + Object.keys(color_names)[i] +
    '{background-color: ' + Object.keys(color_names)[i] + ';}');
}

for (i = 1; i <= n_deck_files; i++) {
  style.sheet.insertRule('div.pattern' + i +
    "{background-image: url('/static/images/pattern" + i +
    ".svg'), url('/static/images/pattern" + i +
    ".svg'); background-size: 50px;}")
}

// ------- Get subject id ----- //
var PID = jsPsych.data.getURLVariable('workerId');;

// Load participant parameters before anything
function fetchOrder() {
  fetch('/data/S' + PID + '_stimuliOrder.txt')
    .then(txt => txt.json())
    .then(jsonReturn => rest(jsonReturn));
}

function rest(order) {

  // Unpack loaded parameters
  var table_order = order.table_order,
    deck_order = order.deck_order,
    colors = order.color_order,
    exp_blocks_n_trials = order.n_trials_sess2_4[1];

  exp_colors = colors.slice(n_blocks_sess1 + 1 + n_exp_blocks,
    n_blocks_sess1 + 1 + 2 * n_exp_blocks);

  //  -- Prepaer image file names for this session -- //
  // Tables first
  var images = [];

  for (i = 0; i < n_exp_blocks; i++) {
    var st = [],
      stt = [];
    for (j = 1; j <= n_tables; j++) {
      st.push(table_order[n_blocks_sess1 + n_exp_blocks + i] + j);
      stt.push(table_order[n_blocks_sess1 + n_exp_blocks + i] + j + '.jpg');
    }

    exp_blocks_tables.push(st);
    images = images.concat(stt);
  }

  // And then decks
  var ptrn_start_indx = (4 + n_blocks_sess1 * n_tables * 2) + (n_exp_blocks * n_tables * 2),
    exp_patterns = deck_order.slice(ptrn_start_indx,
      ptrn_start_indx + n_exp_blocks * n_tables * 2);
  for (i = 0; i < exp_patterns.length; i++) {
    images.push(exp_patterns[i] + '.svg');
  }

  // Pseudo randomly draw reward probabilities for experimental blocks
  for (c = 0; c < n_exp_blocks; c++) {
    var d = jsPsych.randomization.shuffle(exp_reward_probs_diffs);
    var this_block = [];
    for (i = 0; i < n_tables; i++) {
      this_block.push([exp_reward_probs_baseline[i] - d[i] / 2,
        exp_reward_probs_baseline[i] + d[i] / 2
      ])
    }
    exp_reward_probs.push(this_block);
  }

  // Shuffle block lengths, but keep short one first, as reminder that will be thrown out
  exp_blocks_n_trials = [exp_blocks_n_trials[0]]
    .concat(jsPsych.randomization.shuffle(exp_blocks_n_trials.slice(1)));

  // Set up trial plan
  cards = []; // Object containing trial plan
  for (c = 0; c < n_exp_blocks; c++) {
    cards[c] = mkCardArray(exp_blocks_tables[c],
      [
        [exp_patterns[c * 8], exp_patterns[c * 8 + 1]],
        [exp_patterns[c * 8 + 2], exp_patterns[c * 8 + 3]],
        [exp_patterns[c * 8 + 4], exp_patterns[c * 8 + 5]],
        [exp_patterns[c * 8 + 6], exp_patterns[c * 8 + 7]]
      ],
      exp_reward_probs[c], exp_colors[c], exp_blocks_n_trials[c]);
  }

  // Set reward colors
  var experimental_reward_colors = [];
  for (c = 0; c < n_exp_blocks; c++) {
    experimental_reward_colors.push(Math.random > 0.5 ? exp_colors[c][0] :
      exp_colors[c][1]);
  }

  /*** Enter fullscreen ***/
  var fullscreen = {
    type: 'fullscreen',
    fullscreen_mode: true,
    message: '<p>This study runs in fullscreen. To switch to full screen mode \
      and start the experiment, press the button below.</p>',
    on_finish: function() {
      // Hide mouse
      var stylesheet = document.styleSheets[0];
      stylesheet.insertRule("* {cursor: none;}", stylesheet.cssRules.length);
      jsPsych.data.addProperties({
        n_warnings: 0,
        PID: PID,
        sess: 3
      });
    }
  }


  /* ----- Instructions ------ */
  var instructions = [{
    type: 'html-keyboard-response',
    timeline: reminder_instructions,
    choices: [32],
    post_trial_gap: instruction_iti,
    data: {
      category: 'instructions'
    }
  }];
  instructions = instructions.concat(reminder_quiz);

  // * ------ Experimental blocks ---------- * //
  var nums = ['first', 'second', 'third', 'fourth'];

  experimental_blocks = [];
  for (c = 0; c < n_exp_blocks; c++) {

    // Introduction
    experimental_blocks = experimental_blocks.concat([{
      type: 'html-keyboard-response',
      stimulus: '<div class="instructions"><p>In this game, you will be learning the decks on 4 tables.</p>\
          <p>First, let\'s visit the four tables, so that you learn what they look like, \
          and what the card decks on each table look like.</p>\
          <p>You will have to memorize the decks on each table before the game begins.</p>\
          <p>Press the space bar to continue.</p></div>',
      choices: [32],
      data: {
        category: 'game-intro'
      }
    }]);

    var table_intro = [];
    for (j = 0; j < exp_blocks_tables[c].length; j++) {
      table_intro = table_intro.concat([{
          type: 'html-keyboard-response',
          stimulus: '<div><p>This is the ' + nums[j] +
            ' table in this game:</p></div>' +
            mkIntroTable(exp_blocks_tables[c][j]) +
            '<div><br>Press the space bar to see the decks on this table.</div>',
          choices: [32],
          data: {
            category: 'table-intro'
          }
        },
        {
          type: 'html-keyboard-response',
          stimulus: '<div><p>These are the decks on the ' + nums[j] +
            ' table:</p></div>' +
            mkIntroTable(exp_blocks_tables[c][j], exp_patterns[c * 8 + (j * 2)],
              exp_patterns[c * 8 + (j * 2) + 1]) +
            '<div><br>Press the space bar to continue.</div>',
          choices: [32],
          data: {
            category: 'deck-intro'
          }
        }
      ])
    }

    table_intro.push({
      type: 'html-keyboard-response',
      stimulus: '<div class="instructions"><p>Let\'s make sure that you remember \
      the decks on each table before we start playing.</p>\
      <p>Press the space bar to continue.</p></div>',
      choices: [32],
      data: {
        category: 'structure-quiz-prompt'
      }
    });

    var structure_quiz = [],
      oo = [1, 2, 3, 0];
    for (j = 0; j < 4; j++) {
      structure_quiz = structure_quiz.concat(
        [{
            table: exp_blocks_tables[c][j],
            TCard: exp_patterns[c * 8 + (j * 2)],
            BCard: exp_patterns[c * 8 + oo[j] * 2],
          },
          {
            table: exp_blocks_tables[c][j],
            BCard: exp_patterns[c * 8 + (j * 2) + 1],
            TCard: exp_patterns[c * 8 + oo[j] * 2 + 1],
          }
        ]
      );
    }

    table_intro.push({
      timeline: jsPsych.randomization.shuffle(structure_quiz),
      type: 'structure-quiz',
      post_trial_gap: 200,
      data: {
        category: 'structure_quiz',
        block: c
      }
    });

    table_intro.push({
      type: 'html-keyboard-response',
      timeline: [{
        stimulus: '<div class="instructions"><p>You didn\'t recognize the correct \
            deck for all tables. Try again.\
          <p>Press the space bar to try again.</p></div>'
      }],
      choices: [32],
      conditional_function: structure_quiz_check(exp_blocks_tables[c],
        exp_patterns.slice(c * 8, c * 8 + 8)),
      data: {
        category: 'structure-quiz-fail'
      }
    });

    table_intro = {
      timeline: table_intro,
      loop_function: structure_quiz_check(exp_blocks_tables[c],
        exp_patterns.slice(c * 8, c * 8 + 8))
    }
    experimental_blocks = experimental_blocks.concat(table_intro);

    experimental_blocks.push({
      type: 'html-keyboard-response',
      stimulus: '<div class="instructions"><p>Well done, you remember which deck \
      goes on which table!</p>\
      <p>Press the space bar to continue.</p></div>',
      choices: [32],
      data: {
        category: 'structure-quiz-success'
      }
    });

    experimental_blocks.push({
      type: 'html-keyboard-response',
      stimulus: '<div><p>These are the two card colors in this game:</p></div>\
        <div style="width:400px; height:300px; position:relative; \
        left:50%; transform:translate(-50%,0);"><div class = "inner icon">' +
        mk2decks('', '', exp_colors[c][0], exp_colors[c][1]) +
        '</div>\
      </div>\
      <div><p>The back side of each card in the game is colored with one of these two colors.</p>\
      <p>Press the space bar to continue.</p></div>',
      choices: [32],
      on_load: function() {
        document.querySelector('#flip-toggleL19').classList.toggle("flip");
        document.querySelector('#flip-toggleR19').classList.toggle("flip");
      },
      data: {
        category: 'color-intro'
      }
    });

    experimental_blocks = experimental_blocks.concat([{
      type: 'html-keyboard-response',
      stimulus: '<div class="instructions"><p>You are now ready to start playing.</p>\
        <p>As usual, you\'ll start with a learning stage.<br><b><i>Remember:\
        </b></i> Your goal in this stage is to learn the color differences \
        between the decks on each table.</p>\
        <p>After completing the learning stage, you will be tested on your \
        knowledge, and awarded bonus payment according to your test performance.</p>\
        <p>Press the space bar to continue.</p></div>',
      choices: [32],
      data: {
        category: 'instructions-ready'
      }
    }, {
      type: 'html-keyboard-response',
      stimulus: '<div class="instructions"><p>Place your right index finger on the \
      "K" key, and your left index finger on the "D" key.</p>\
      <p>Press either key to start the learning stage of this game.</p></div>',
      choices: [68, 75],
      data: {
        category: 'instructions-ready'
      }
    }]);

    // Learning phase

    // Create table combinations for trials
    var trial_opts = [];
    for (i = 0; i < 3; i++) {
      for (j = i + 1; j < 4; j++) {
        trial_opts.push({
          TL: exp_blocks_tables[c][i],
          TR: exp_blocks_tables[c][j],
          response_limit: 3000, //max_response_time,
          block: c
        });
        trial_opts.push({
          TL: exp_blocks_tables[c][j],
          TR: exp_blocks_tables[c][i],
          response_limit: 3000, //max_response_time,
          block: c
        });
      }
    }

    var timeline_variables = [];

    for (j = 0; j < exp_blocks_n_trials[c]; j++) {

      // Shuffle options
      if (!(j % trial_opts.length)) {
        trial_opts = jsPsych.randomization.shuffle(trial_opts);
      }

      timeline_variables.push(trial_opts[j % trial_opts.length]);
    }

    experimental_blocks.push({
      timeline: choice_trial(cards),
      timeline_variables: timeline_variables
    });

    // Pre test message
    experimental_blocks.push({
      type: 'html-keyboard-response',
      stimulus: '<div class="instructions">\
        <p>This is the end of the learning stage.</p>\
        <p>You will now be tested on your knowledge.\
        <br>' + color_names[experimental_reward_colors[c]] +
        ' cards, like this one, are worth bonus money:</p></div>' +

        mkCard('L', 0, '', experimental_reward_colors[c], offset = 0, 'initial') +

        '<div class="instructions"><p><br>Press the space bar to start the test</p>',
      choices: [32],
      on_load: function() {
        document.querySelector('#flip-toggleL0').classList.toggle("flip");
      },
      data: {
        category: 'pre-test-msg'
      }
    });

    // Test phase
    var timeline_variables = [];


    for (j = 0; j < exp_blocks_tables[c].length; j++) {
      var left_is = Math.random() > 0.5 ? 0 : 1;
      timeline_variables.push({
        table: exp_blocks_tables[c][j],
        LCard: exp_patterns[c * 8 + (j * 2 + left_is)],
        RCard: exp_patterns[c * 8 + (j * 2 + (1 - left_is))],
        propL: experimental_reward_colors[c] == exp_colors[c][0] ?
          exp_reward_probs[c][j][left_is] : 1 - exp_reward_probs[c][j][left_is],
        propR: experimental_reward_colors[c] == exp_colors[c][0] ?
          exp_reward_probs[c][j][1 - left_is] : 1 - exp_reward_probs[c][j][1 - left_is],
        masksL: Array(Math.round(10 * exp_reward_probs[c][j][left_is])).fill(exp_colors[c][0]).concat(Array(10 - Math.round(10 * exp_reward_probs[c][j][left_is])).fill(exp_colors[c][1])),
        masksR: Array(Math.round(10 * exp_reward_probs[c][j][1 - left_is])).fill(exp_colors[c][0]).concat(Array(10 - Math.round(10 * exp_reward_probs[c][j][1 - left_is])).fill(exp_colors[c][1])),
        reward_color: experimental_reward_colors[c],
        left_is: left_is,
        block: c
      });
    }

    experimental_blocks.push({
      timeline: test_trial,
      timeline_variables: timeline_variables,
      randomize_order: true
    });

    // Pre feedback message
    experimental_blocks.push({
      type: 'html-keyboard-response',
      stimulus: '<div class="instructions">\
        <p>This is the end of the test. You picked decks to draw cards from at all four \
        tables.</p>\
        <p>You will soon see how well you did. But first, please answer a few \
        short questions.</p>\
        <p>Press the space bar to continue.</p><div>',
      choices: [32],
      data: {
        category: 'pre-confidence-msg'
      }
    });

    experimental_blocks.push({
      timeline: [{
        type: 'survey-likert',
        preamble: function() {
          var side = jsPsych.data.get().filter({
            trial_type: 'test-trial'
          }).filter({
            table: jsPsych.timelineVariable('table', true)
          }).last(1).select('choice').values[0];

          return '<div class="instructions"><p>How confident are you that the \
            deck you chose at this table is the deck with more ' +
            color_names[jsPsych.timelineVariable('reward_color', true)].toLowerCase() +
            ' cards?</p>\
            </div><div style="position:relative;>"' +
            mkIntroTable(jsPsych.timelineVariable('table', true),
              LCard = side == 'L' ? jsPsych.timelineVariable('LCard', true) : '',
              RCard = side == 'R' ? jsPsych.timelineVariable('RCard', true) : '') +
            '</div>'
        },
        questions: [{
          prompt: '',
          labels: ["1<br>Not at all", "2", "3", "4", "5<br>Very confident"],
          required: true
        }],
        data: {
          category: 'confidence_question',
          table: jsPsych.timelineVariable('table')
        },
        on_load: function() {
          var stylesheet = document.styleSheets[0];
          stylesheet.deleteRule(stylesheet.cssRules.length - 1);
        },
        on_finish: function() {
          // Hide mouse
          var stylesheet = document.styleSheets[0];
          stylesheet.insertRule("* {cursor: none;}", stylesheet.cssRules.length);
        }
      }],
      timeline_variables: timeline_variables
    });

    // Memory quiz
    var memory_quiz = [];
    for (j = 0; j < 8; j++) {
      var these_tables = jsPsych.randomization.shuffle(exp_blocks_tables[c]);

      memory_quiz.push({
        table1: these_tables[0],
        table2: these_tables[1],
        table3: these_tables[2],
        table4: these_tables[3],
        card: exp_patterns[c * 8 + j],
        answer: exp_blocks_tables[c][Math.floor(j / 2)]
      });
    }

    experimental_blocks = experimental_blocks.concat(
      [{
          type: 'html-keyboard-response',
          stimulus: '<div class="instructions"><p>Before we reveal how you did \
          on the test, you will be tested on your memory for the card decks on \
          each table.</p>\
          <p>On the next screens, you will be presented with one card deck at a \
          time. Your task is to select the table this card deck belonged to, \
          using your mouse pointer.</p>\
        <p>Press the space bar to continue.</p></div>',
          choices: [32],
          data: {
            category: 'memory-quiz-prompt'
          }
        },
        {
          timeline: jsPsych.randomization.shuffle(memory_quiz),
          type: 'memory-quiz',
          post_trial_gap: 250,
          data: {
            category: 'memory_quiz',
            block: c
          }
        }
      ]
    );

    // Test feedback
    experimental_blocks.push({
      type: 'html-keyboard-response',
      stimulus: '<div class="instructions"><p>We will now reveal how you did on \
      the test for this game.</p><p>Press the space bar to continue.</p></div>',
      choices: [32],
      data: {
        category: 'test-feedback-prompt'
      }
    })

    experimental_blocks.push({
      timeline: test_feedback,
      timeline_variables: timeline_variables,
      randomize_order: true
    });


    // Reward tally message
    experimental_blocks.push({
      type: 'html-keyboard-response',
      stimulus: function() {
        var reward = (jsPsych.data.get().filter({
          trial_type: 'test-feedback'
        }).last(n_tables).select('correct').sum() * table_worth).toFixed(2);
        return '<div class="instructions"><p>Your total bonus earnings from this \
        game are: $' + reward + '.</p>\
        <p>Press the space bar to continue.</p></div>'
      },
      choices: [32],
      data: {
        category: 'reward-tally'
      }
    });

    // End game message
    if (c < (n_exp_blocks - 1)) {
      experimental_blocks.push({
        type: 'html-keyboard-response',
        stimulus: '<div class="instructions">\
          <p>You have completed this game.</p>\
          <p>You may take a short break, if you need it.</p>\
          <p>Press the space bar to continue to the next part of the experiment.</p><div>',
        choices: [32],
        data: {
          category: 'game-over'
        }
      });
    }
  }

  //** ---------Debrief **//

  var debrief = [{
      type: "html-keyboard-response",
      stimulus: function() {
        var reward = jsPsych.data.get().filter({
          trial_type: 'test-feedback'
        }).last(24).select('correct').sum();

        return '<div class = "instructions"><p>You have completed this part of \
          the study. Overall, in the seven games, you made an extra $' +
          (reward * table_worth).toFixed(2) + '\
          </p><p>You will now answer several questions. Please answer them sincerely, \
          we remind you that your answers are completely annonymous.</p>\
          <p align="center"><i>Press the space bar to continue.</i></p></div>'
      },
      choices: [32],
      data: {
        category: 'final-reward-tally'
      }
    },
    {
      type: 'survey-likert',
      questions: [{
        prompt: "How difficult was the color-discovery game to play today?",
        labels: ["1<br>Not at all", "2", "3", "4", "5<br>Very difficult"],
        required: true
      }],
      data: {
        category: 'debrief'
      },
      on_load: function() {
        // Return mouse
        var stylesheet = document.styleSheets[0];
        stylesheet.deleteRule(stylesheet.cssRules.length - 1);
      },
    },
    {
      type: 'survey-text',
      questions: [{
          prompt: "Was there anything that helped you learn the colors better during \
        the learning stage of the games?",
          columns: 100,
          rows: 4,
          value: ''
        },
        {
          prompt: "Did you have any special strategy that helped you make the \
        choice betwen tables in the learning stage of each game?",
          columns: 100,
          rows: 4,
          value: ''
        }
      ],
      data: {
        category: 'debrief'
      }
    },
    {
      type: 'survey-text',
      questions: [{
          prompt: "Did you have any special strategy that helped you make the \
          choice betwen decks in the learning stage of each game?",
          columns: 100,
          rows: 4,
          value: ''
        },
        {
          prompt: "Did you have any special strategy that helped you in the test \
          phase of each game?",
          columns: 100,
          rows: 4,
          value: ''
        }
      ],
      data: {
        category: 'debrief'
      }
    },
    {
      type: "html-keyboard-response",
      stimulus: '<div class="instructions">This is the end of this part of the study.</p>\
        <p>Press the space bar to complete this continue.</p>',
      choices: [32]
    },
    {
      type: "html-keyboard-response",
      stimulus: "<div class='instructions'>Thank you for participating in this session!<p>\
        In this study we were interested in examining reaction-times and \
        precision in a novel environment.</p>\
        <p>You will recieve an email invitiation for the next session tomorrow.</p>\
        <p>You can win up to $6 bonus on the next session, and you'll \
        recieve $2 special bonus for completing all four sessions.</p>\
        <p>Press the space bar to continue.</p></div>",
      choices: [32]
    },
    {
      type: 'fullscreen',
      fullscreen_mode: false
    },
    {
      type: "html-keyboard-response",
      stimulus: "<div class ='instructions'><p>Once you press the space bar, your results will be uploaded to the \
      server, and the experiment will complete. <b>This may take several minutes - do not \
      refresh or close your browser during this time.</b></p>\
      <p>After your results are uploaded to the server, you will be presented \
      with the completion code for MTurk.\
      <p>Press the space bar to upload your results.</p></div>",
      choices: [32]
    },
    {
      type: "html-keyboard-response",
      stimulus: "<div class='instructions'><p>Data uploading. To ensure proper completion \
        of the experiment, please don't refresh, \
        close your browser or open another tab.\
        </p></div>",
      choices: jsPsych.NO_KEYS,
      on_load: function() {
        var d = new Date;
        saveData('S' + PID + '_sess3_' + d.toISOString().slice(0,10),
          jsPsych.data.get().ignore('stimulus').csv(),
          function() {
            saveData('S' + PID + '_sess3' + '_plan', trial_plan,
              function() {
                saveData('S' + PID + '_sess3' + '_int',
                  jsPsych.data.getInteractionData().csv(), transferComplete)
              });
          });
      }
    },
    {
      type: "html-keyboard-response",
      stimulus: "<div class='instructions'><p>Your results have successfully uploaded.</p>\
      <p>Your completion code for this study is: <br> <b>8HGJN65</b></p>\
      <p>Use it to submit this HIT on MTurk.</p>\
      <p>You may now close this window.</p></div>",
      choices: jsPsych.NO_KEYS
    }
  ];


  // Put it all together
  var experiment = [];
  experiment.push(fullscreen);
  experiment = experiment.concat(instructions);
  experiment = experiment.concat(experimental_blocks);
  experiment = experiment.concat(debrief);

  // Image preload
  for (i = 0; i < images.length; i++) {
    images[i] = '/static/images/' + images[i];
  }

  // Prevent right click
  document.addEventListener('contextmenu', event => event.preventDefault());

  // Save trial plan
  var trial_plan = trialPlan();

  // Initiate experiment
  jsPsych.init({
    timeline: experiment,
    preload_images: images,
    on_data_update: function() {
      safe_data = jsPsych.data.get().ignore('stimulus').csv();
    }
  });
}

// Initiate
fetchOrder();
