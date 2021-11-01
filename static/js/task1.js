// Comment for git
// Parameters
var n_training = 20, // N of training trials
  n_tables = 4, // Number of tables per game
  n_exp_blocks = 4, // Number of experimental blocks in this session
  n_exp_blocks_total = 22, // Number of experimental blocks across all sessions
  n_exp_blocks_next_sessions = 6, // Number of experimental blocks on each of the next two sessions
  n_deck_files = 56, // Number of deck image files
  max_response_time = 3000,
  exp_blocks_n_trials = [17, 32, 49, 80], // Come from qgeom(seq(0,1, length.out = 6), 1/44)[-c(1,6)] + 10 (minimum 19 switched with 17 from next sessions)
  table_worth = 0.25, // Reward per correct choice at table, in $
  colors = [
    ['chocolate', 'cornflowerblue'],
    ['salmon', 'seagreen'],
    ['tomato', 'turquoise'],
    ['blue', 'orange'],
    ['purple', 'yellow'],
    ['Red', 'SpringGreen'],
    ['DeepPink', 'YellowGreen'],
    ['Navy', 'Gold'],
    ['Coral', 'LightSeaGreen'],
    ['SteelBlue', 'HotPink'],
    ['SaddleBrown', 'Lime'],
    ['Silver', 'Magenta'],
    ['Indigo', 'LightGreen'],
    ['OliveDrab', 'Crimson'],
    ['RebeccaPurple', 'Goldenrod'],
    ['LightSlateGrey', 'Pink'],
    ['RosyBrown', 'PaleTurquoise'],
    ['ForestGreen', 'FireBrick'],
    ['DarkOrange', 'DodgerBlue'],
    ['Khaki', 'MediumSlateBlue'],
    ['Thistle', 'Tan'],
    ['PaleVioletRed', 'Aqua'],
    ['Maroon', 'CadetBlue']
  ],
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
  training_reward_probs = [
    [0.1, 0.4],
    [0.6, 0.9]
  ],
  instruction_iti = 100,
  safe_data; // Variable containing data in case of crash

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
PID = jsPsych.data.getURLVariable('workerId');

// ------- Prepare things that matter across sessions ------- //

// Assign game lengths for the next n_exp_blocks_next_sessions
var n_trials_mat = jsPsych.randomization.shuffle([ //Comes from qgeom(seq(0,1,length.out = 20), 1/44)[-c(1,20)]
  [12, 26, 33, 42, 77, 107],
  [14, 20, 29, 47, 60, 138],
  [19, 23, 37, 53, 68, 90]
]);

// Assign table file names to the three sessions
var table_order = [],
  letters = 'ABCDEFGHIJKLMNOPQRSTUV'.split('').sort(function() {
    return 0.5 - Math.random()
  }).join('');
for (t = 0; t < n_exp_blocks_total; t++) {
  table_order.push('mrbl' + letters[t]);
}

// Assign deck file names to the three sessions, making sure that no game
// has the same pattern twice

// Possible deck file names
var indx = [...Array(n_deck_files + 1).keys()];
indx.shift(1);


// Shuffle deck files
var deck_order = [];
indx = jsPsych.randomization.shuffle(indx);

// Assign as trials for the fist session
for (d = 0; d < n_exp_blocks * n_tables * 2 + 4; d++) {
  deck_order.push('pattern' + indx[d % n_deck_files]);
}

// Assign trials for sessions 2, 3, 4
for (i = 0; i < 3; i++) {
  indx = jsPsych.randomization.shuffle(indx);

  for (d = 0; d < n_exp_blocks_next_sessions * n_tables * 2; d++) {
    deck_order.push('pattern' + indx[d % n_deck_files]);
  }
}


// Assign colors to four sessions
colors = jsPsych.randomization.shuffle(colors);

// Save deck and table orders to file
saveData('S' + PID + '_stimuliOrder',
  JSON.stringify({
    table_order: table_order,
    deck_order: deck_order,
    color_order: colors,
    n_trials_sess2_4: n_trials_mat
  }),
  function() {
    console.log('Stimuli order saved')
  }, 'txt');

this_sess_colors = colors.slice(0, n_exp_blocks + 1)

//  -- Prepaer image file names for this session -- //
// Tables first
var images = [],
  exp_blocks_tables = [];

for (i = 0; i < n_exp_blocks; i++) {
  var st = [],
    stt = [];
  for (j = 1; j <= n_tables; j++) {
    st.push(table_order[i] + j);
    stt.push(table_order[i] + j + '.jpg');
  }

  exp_blocks_tables.push(st);
  images = images.concat(stt);
}

// And then decks
var patterns = deck_order.slice(0, 4 + n_exp_blocks * n_tables * 2);
for (i = 0; i < patterns.length; i++) {
  images.push(patterns[i] + '.svg');
}

// Pseudo randomly draw reward probabilities for experimental blocks
var exp_reward_probs = [];
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

// Split to traning and experimental
training_patterns = patterns.slice(0, 4);
exp_patterns = patterns.slice(4);

training_colors = this_sess_colors[0];
exp_colors = this_sess_colors.slice(1);

// Shuffle block lengths
exp_blocks_n_trials = jsPsych.randomization.shuffle(exp_blocks_n_trials);

// Set up trial plan
cards = []; // Object containing trial plan
cards[0] = mkCardArray(['train_mrbl1', 'train_mrbl2'],
  [
    [training_patterns[0], training_patterns[1]],
    [training_patterns[2], training_patterns[3]]
  ],
  training_reward_probs, training_colors, n_training);

for (c = 0; c < n_exp_blocks; c++) {
  cards[c + 1] = mkCardArray(exp_blocks_tables[c],
    [
      [exp_patterns[c * 8], exp_patterns[c * 8 + 1]],
      [exp_patterns[c * 8 + 2], exp_patterns[c * 8 + 3]],
      [exp_patterns[c * 8 + 4], exp_patterns[c * 8 + 5]],
      [exp_patterns[c * 8 + 6], exp_patterns[c * 8 + 7]]
    ],
    exp_reward_probs[c], exp_colors[c], exp_blocks_n_trials[c]);
}

// Set reward colors
var training_reward_color = Math.random > 0.5 ? training_colors[0] :
  training_colors[1];

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
      sess: 1
    });
  }
}

/* ----- Instructions ------ */
// Most instruction text is in instructions.js

var one_example_timeline = function(cards, correct_side, object_side = 'L') {
  return [{
      timeline: second_stage_timeline(cards, 'train_mrbl1', with_replacement = true),
      timeline_variables: [{
        TL: 'train_mrbl1',
        TR: 'train_mrbl1',
        response_limit: null,
        block: 0,
        object_side: object_side
      }]
    },
    {
      timeline: [{
        type: 'html-keyboard-response',
        stimulus: '<div class="instructions"><p>You\'ve chosen the wrong deck.</p>\
        <p>Try again: On the next screen, \
        you will be presented with a table and two decks of cards. Sample a card \
        from the deck that looks like this:</p></div><div style="position:relative; \
        width: 105px; transform:translate(-50%, 0); left: 50%">' +
          mkCard('L', 0, training_patterns[0], '', offset = 0, 'inherit') +
          '</div><div class="instructions"><p>Press the space bar to try again.\
            </p></div>',
        choices: [32]
      }],
      conditional_function: function() {
        return jsPsych.data.get().filter({
          category: 'deck_choice'
        }).last(1).values()[0].key_press == correct_side
      },
      data: {
        category: 'wrong-deck-chosen'
      }
    }
  ]
}

var first_test_practice_variables = [{
  table: 'train_mrbl1',
  LCard: training_patterns[1],
  RCard: training_patterns[0],
  propL: 0.7,
  propR: 0.9,
  reward_color: training_reward_color,
  masksL: Array(3).fill(training_colors.filter(x => x != training_reward_color)[0]).concat(Array(7).fill(training_reward_color)),
  masksR: Array(1).fill(training_colors.filter(x => x != training_reward_color)[0]).concat(Array(9).fill(training_reward_color))
}];

var start_instructions = [{
    timeline: start_instructions_timeline1,
    type: 'html-keyboard-response',
    choices: [32],
    post_trial_gap: instruction_iti,
    data: {
      category: 'instructions1'
    }
  },
  {
    timeline: one_example_timeline([{
      train_mrbl1: [{
        LCard: training_patterns[0],
        RCard: training_patterns[1],
        LReward: training_colors[1],
        RReward: training_colors[0]
      }]
    }], 75),
    loop_function: function() {
      return jsPsych.data.get().filter({
        category: 'deck_choice'
      }).last(1).values()[0].key_press == 75
    }
  },
  {
    type: 'html-keyboard-response',
    stimulus: '<div class="instructions"><p>You\'ve flipped a ' +
      color_names[training_colors[1]].toLowerCase() + ' card.</p>\
      <p>Let’s practice sampling once again.<br>Each time you visit a table, the \
      decks could change location between the right and left.<br>The location \
      doesn’t matter: <i>only the images on the back of the cards</i>. On the next \
      screen, sample a card from the same deck you just sampled from, \
      the deck that looks like this:</p></div><div style="position:relative; \
      width: 105px; transform:translate(-50%, 0); left: 50%">' +
      mkCard('L', 0, training_patterns[0], '', offset = 0, 'inherit') +
      '</div><div class="instructions"><p>Press the space bar to try again.\
          </p></div>',
    choices: [32],
    data: {
      chosen_object: 'train_mrbl1',
      chosen_object_side: 'R',
      category: 'one_example_post_choice'
    }
  },
  {
    timeline: one_example_timeline([{
      train_mrbl1: [{
        LCard: training_patterns[1],
        RCard: training_patterns[0],
        LReward: training_colors[1],
        RReward: training_colors[0]
      }]
    }], 68, 'R'),
    loop_function: function() {
      return jsPsych.data.get().filter({
        category: 'deck_choice'
      }).last(1).values()[0].key_press == 68
    }
  },
  {
    timeline: start_instructions_timeline2,
    type: 'html-keyboard-response',
    choices: [32],
    post_trial_gap: instruction_iti,
    data: {
      category: 'instructions2'
    }
  },
  {
    timeline: second_stage_timeline([{
      train_mrbl1: jsPsych.randomization.shuffle(Array(3).fill({
        LCard: training_patterns[0],
        RCard: training_patterns[1],
        LReward: training_colors[1],
        RReward: training_colors[0]
      }).concat(Array(3).fill({
        RCard: training_patterns[0],
        LCard: training_patterns[1],
        RReward: training_colors[1],
        LReward: training_colors[0]
      })).concat([{
        RCard: training_patterns[0],
        LCard: training_patterns[1],
        RReward: training_colors[0],
        LReward: training_colors[1]
      }]).concat([{
        LCard: training_patterns[0],
        RCard: training_patterns[1],
        LReward: training_colors[0],
        RReward: training_colors[1]
      }]))
    }], 'train_mrbl1'),
    timeline_variables: [{
        TL: 'train_mrbl1',
        TR: 'train_mrbl1',
        response_limit: null,
        block: 0,
        object_side: 'L'
      },
      {
        TL: 'train_mrbl1',
        TR: 'train_mrbl1',
        response_limit: null,
        block: 0,
        object_side: 'R'
      }
    ],
    repetitions: 4,
    randomize_order: true
  },
  {
    stimulus: function() {
      return '<div class="instructions"><p>You might have noticed that this \
        deck had more ' + color_names[training_colors[1]].toLowerCase() +
        ' cards:</p></div><div style="position:relative; \
        width: 105px; transform:translate(-50%, 0); left: 50%">' +
        mkCard('L', 0, training_patterns[0], '', offset = 0, 'inherit') +
        '</div><div class="instructions"><p>This was an easy example, since one \
          deck had many ' + color_names[training_colors[1]].toLowerCase() + ' cards \
          in it, and one had only a few. </p><p><i>In a real game, learning the color \
          differences between the decks on the table could be  more difficult.</i> \
          <p>Press the space bar to continue.</p></div>'
    },
    type: 'html-keyboard-response',
    choices: [32],
    data: {
      category: 'instructions3'
    }
  },
  {
    type: 'survey-multi-choice',
    post_trial_gap: 100,
    timeline: [{
        preamble: function() {
          var c1 = training_colors[0],
            c2 = training_colors[1];
          return '<div class="instructions"><p>For example look at these two \
          decks:</p></div>' + mkHammerDecks(training_patterns[0],
            training_patterns[1], [c1, c2, c1, c1,
              c1, c1, c1, c1
            ], [c1, c1, c2, c1,
              c1, c1, c1, c2
            ])
        },
        questions: jsPsych.timelineVariable('questions'),
        on_load: jsPsych.timelineVariable('on_load'),
        data: {
          correct: jsPsych.timelineVariable('correct'),
          category: 'hammer-quiz'
        },
        on_finish: function() {
          var stylesheet = document.styleSheets[0];
          stylesheet.insertRule("* {cursor: none;}", stylesheet.cssRules.length);
        }
      },
      {
        timeline: [{
          preamble: function() {
            var c1 = training_colors[0],
              c2 = training_colors[1];
            return '<div class="instructions"><p><b>Try again!</b></p></div>' +
              mkHammerDecks(training_patterns[0],
                training_patterns[1], jsPsych.randomization.shuffle([c1, c1, c1, c1,
                  c1, c1, c1, c2
                ]), jsPsych.randomization.shuffle([c1, c1, c1, c1,
                  c1, c1, c2, c2
                ]))
          }
        }],
        questions: jsPsych.timelineVariable('questions'),
        on_load: hammer_demo_reveal,
        data: {
          correct: jsPsych.timelineVariable('correct'),
          category: 'hammer-quiz-fail'
        },
        on_finish: function() {
          var stylesheet = document.styleSheets[0];
          stylesheet.insertRule("* {cursor: none;}", stylesheet.cssRules.length);
        },
        conditional_function: hammer_quiz_check,
        loop_function: hammer_quiz_check
      }
    ],
    timeline_variables: [{
        questions: [{
          prompt: 'Which deck has mostly <i>' +
            color_names[training_colors[0]].toLowerCase() + '</i> cards in it?',
          options: ['Top deck', 'Bottom deck', 'None of the decks', 'Both decks'],
          required: true,
          horizontal: true
        }],
        correct: 'Both decks',
        on_load: function() {
          var stylesheet = document.styleSheets[0];
          stylesheet.deleteRule(stylesheet.cssRules.length - 1);

          shuffleDeck('T', 8, undefined, undefined, 0);
          shuffleDeck('B', 8, undefined, undefined, 0);

          var tl = new TimelineMax();

          for (j = 0; j < 8; j++) {
            tl.to('#flip-toggleT' + (7 - j), 0.2, {
              className: "+=dm" + j
            }, j * 0.2 + 0.7);
            tl.to('#flip-toggleB' + (7 - j), 0.2, {
              className: "+=dm" + j
            }, j * 0.2 + 0.7);
          }

          for (j = 0; j < 8; j++) {
            tl.to('#flip-toggleT' + (7 - j), 0.2, {
              className: "+=flip"
            }, j * 0.2 + 2.3);
            tl.to('#flip-toggleB' + (7 - j), 0.2, {
              className: "+=flip"
            }, j * 0.2 + 2.3);
          }
        }
      },
      {
        questions: [{
          prompt: 'Which deck has mostly <i>' +
            color_names[training_colors[1]].toLowerCase() + '</i> cards in it?',
          options: ['Top deck', 'Bottom deck', 'None of the decks', 'Both decks'],
          required: true,
          horizontal: true
        }],
        correct: 'None of the decks',
        on_load: hammer_demo_reveal
      },
      {
        questions: [{
          prompt: 'Which deck has a more <i>' +
            color_names[training_colors[0]].toLowerCase() +
            '</i> cards than the other?',
          options: ['Top deck', 'Bottom deck'],
          required: true,
          horizontal: true
        }],
        correct: 'Top deck',
        on_load: hammer_demo_reveal
      },
      {
        questions: [{
          prompt: 'Which deck has a more <i>' +
            color_names[training_colors[1]].toLowerCase() +
            '</i> cards than the other?',
          options: ['Top deck', 'Bottom deck'],
          required: true,
          horizontal: true
        }],
        correct: 'Bottom deck',
        on_load: hammer_demo_reveal
      }
    ]
  },
  {
    timeline: start_instructions_timeline3,
    type: 'html-keyboard-response',
    choices: [32],
    post_trial_gap: instruction_iti,
    data: {
      category: 'instructions3'
    }
  },
  {
    timeline: [{
        timeline: choice_trial(JSON.parse(JSON.stringify(cards))),
        timeline_variables: [{
            TL: 'train_mrbl1',
            TR: 'train_mrbl2',
            response_limit: null,
            block: 0
          },
          {
            TR: 'train_mrbl1',
            TL: 'train_mrbl2',
            response_limit: null,
            block: 0
          }
        ],
        randomize_order: true,
        repetitions: 2
      },
      {
        timeline: [{
          stimulus: '<div class="instructions"><p>You didn\'t pick one card of \
        each deck. Let\'s practice that once more. On the next few rounds, sample \
        one card from each deck on each table.</p><p>Place your right index \
        finger on the "K" key, and your left index finger on the "D" key.</p>\
        <p>Press either key to start sampling cards.</p></div>',
          type: 'html-keyboard-response',
          choices: [68, 75],
          data: {
            category: 'table-choice-practice-fail'
          }
        }],
        conditional_function: learning_practice_check_function
      }
    ],
    loop_function: learning_practice_check_function
  },
  {
    timeline: start_instructions_timeline4,
    type: 'html-keyboard-response',
    choices: [32],
    post_trial_gap: instruction_iti,
    data: {
      category: 'instructions4'
    }
  },
  {
    timeline: [{
        timeline: test_trial,
        timeline_variables: first_test_practice_variables
      },
      {
        timeline: [{
          stimulus: '<div class="instructions"><p>Try again. On the next screen, \
      practice choosing between the two decks, given that you know \
      that this deck has more reward in it:</p></div>' +
            '<div style="position:relative; \
      width: 105px; transform:translate(-50%, 0); left: 50%">' +
            mkCard('L', 0, training_patterns[0], '', offset = 0, 'inherit') +
            '</div><div class="instructions"><p>Press the space bar to try again.\
      </p></div>',
          type: 'html-keyboard-response',
          choices: [32]
        }],
        conditional_function: test_practice_check_function,
        data: {
          category: 'test-practice-fail'
        }
      }
    ],
    loop_function: test_practice_check_function
  },
  {
    stimulus: '<div class="instructions"><p>Very good. After choosing a deck \
    at each table, the correct answers will be revealed and you will see \
    how well you did. \
    </p><p>Press the space bar to see an example.</p></div>',
    type: 'html-keyboard-response',
    choices: [32],
    data: {
      category: 'instructions5'
    }
  },
  {
    timeline: test_feedback,
    timeline_variables: first_test_practice_variables
  },
  {
    timeline: start_instructions_timeline5,
    type: 'html-keyboard-response',
    choices: [32],
    post_trial_gap: instruction_iti,
    data: {
      category: 'instructions5'
    }
  }
];

/* ----- Training block ------ */
// Learning stage
var training_learning = {
  timeline: choice_trial(cards),
  timeline_variables: [{
      TL: 'train_mrbl1',
      TR: 'train_mrbl2',
      response_limit: max_response_time,
      block: 0
    },
    {
      TR: 'train_mrbl1',
      TL: 'train_mrbl2',
      response_limit: max_response_time,
      block: 0
    }
  ],
  randomize_order: true,
  repetitions: n_training / 2
}

// Rate decks
var training_timeline_variables = [{
    table: 'train_mrbl1',
    LCard: training_patterns[0],
    RCard: training_patterns[1],
    propL: training_reward_color == training_colors[0] ?
      training_reward_probs[0][0] : 1 - training_reward_probs[0][0],
    propR: training_reward_color == training_colors[0] ?
      training_reward_probs[0][1] : 1 - training_reward_probs[0][1],
    masksL: Array(Math.round(10 * training_reward_probs[0][0])).fill(training_colors[0]).concat(Array(10 - Math.round(10 * training_reward_probs[0][0])).fill(training_colors[1])),
    masksR: Array(Math.round(10 * training_reward_probs[0][1])).fill(training_colors[0]).concat(Array(10 - Math.round(10 * training_reward_probs[0][1])).fill(training_colors[1])),
    reward_color: training_reward_color
  },
  {
    table: 'train_mrbl2',
    LCard: training_patterns[2],
    RCard: training_patterns[3],
    propL: training_reward_color == training_colors[0] ?
      training_reward_probs[1][0] : 1 - training_reward_probs[1][0],
    propR: training_reward_color == training_colors[0] ?
      training_reward_probs[1][1] : 1 - training_reward_probs[1][1],
    masksL: Array(Math.round(10 * training_reward_probs[1][0])).fill(training_colors[0]).concat(Array(10 - Math.round(10 * training_reward_probs[1][0])).fill(training_colors[1])),
    masksR: Array(Math.round(10 * training_reward_probs[1][1])).fill(training_colors[0]).concat(Array(10 - Math.round(10 * training_reward_probs[1][1])).fill(training_colors[1])),
    reward_color: training_reward_color
  }
];

var training_rating = {
  timeline: test_trial,
  timeline_variables: training_timeline_variables,
  randomize_order: true
}

// Rating feedback
var training_feedback = {
  timeline: test_feedback,
  timeline_variables: training_timeline_variables,
  randomize_order: true
}

// Put the training block together and add instructions
var training_block = [];

// Introduction
training_block = training_block.concat([{
  type: 'html-keyboard-response',
  stimulus: '<div class="instructions"><p>In this game, you will be learning \
    the decks on two tables.</p>\
    <p>First, let\'s visit the two tables, so that you learn what they look like, \
    and what the card decks on each table look like.</p>\
    <p>You will have to memorize the decks on each table before the game begins.</p>\
    <p>Press the space bar to continue.</p></div>',
  choices: [32],
  data: {
    category: 'training-intro'
  }
}]);



var table_intro = [];
var training_tables = ['train_mrbl1', 'train_mrbl2'];
var nums = ['first', 'second', 'third', 'fourth'];
for (j = 0; j < 2; j++) {
  table_intro = table_intro.concat([{
      type: 'html-keyboard-response',
      stimulus: '<div><p>This is the ' + nums[j] +
        ' table in this game:</p></div>' +
        mkIntroTable(training_tables[j]) +
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
        mkIntroTable(training_tables[j], training_patterns[j * 2],
          training_patterns[j * 2 + 1]) +
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

var structure_quiz = [];
for (j = 0; j < 2; j++) {
  structure_quiz = structure_quiz.concat(
    [{
        table: training_tables[j],
        TCard: training_patterns[j * 2],
        BCard: training_patterns[(1 - j) * 2],
      },
      {
        table: training_tables[j],
        BCard: training_patterns[j * 2 + 1],
        TCard: training_patterns[(1 - j) * 2 + 1],
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
    block: 0
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
  conditional_function: structure_quiz_check(training_tables,
    training_patterns),
  data: {
    category: 'structure-quiz-fail'
  }
});

table_intro = {
  timeline: table_intro,
  loop_function: structure_quiz_check(training_tables,
    training_patterns)
}

training_block.push(table_intro);


training_block.push({
  type: 'html-keyboard-response',
  stimulus: '<div class="instructions"><p>Well done, you remember which deck \
  goes on which table!</p>\
  <p>Press the space bar to continue.</p></div>',
  choices: [32],
  data: {
    category: 'structure-quiz-success'
  }
});

training_block.push({
  type: 'html-keyboard-response',
  stimulus: '<div><p>These are the two card colors in this game:</p></div>\
    <div style="width:400px; height:300px; position:relative; \
    left:50%; transform:translate(-50%,0);"><div class = "inner icon">' +
    mk2decks('', '', training_colors[0], training_colors[1]) +
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

training_block = training_block.concat([{
    type: 'html-keyboard-response',
    stimulus: '<div class="instructions"><p>You are now ready to start playing.</p>\
    <p>As usual, you\'ll start with a learning stage.<br><b><i>Remember:\
    </b></i> Your goal in this stage is to learn the color differences \
    between the decks on each table.</p>\
    <p>After completing the learning stage, you will be tested on your \
    knowledge, and awarded bonus payment according to your test performance.</p>\
    <p>Press the space bar to continue</p></div>',
    choices: [32],
    data: {
      category: 'instructions-ready'
    }
  },
  {
    type: 'html-keyboard-response',
    stimulus: '<div class="instructions"><p>Place your right index finger on the \
  "K" key, and your left index finger on the "D" key.</p>\
  <p>Press either key to start the learning stage of this game.</p></div>',
    choices: [68, 75],
    data: {
      category: 'instructions-ready'
    }
  }
]);

training_block.push(training_learning);

// Pre test message
training_block.push({
  type: 'html-keyboard-response',
  stimulus: '<div class="instructions">\
    <p>This is the end of the learning stage.</p>\
    <p>You will now be tested on your knowledge.\
    <br>' + color_names[training_reward_color] +
    ' cards, like this one, are worth bonus money:</p></div>' +

    mkCard('L', 0, '', training_reward_color, offset = 0, 'initial') +

    '<div class="instructions"><p><br>Press the space bar to start the test</p>',
  choices: [32],
  on_load: function() {
    document.querySelector('#flip-toggleL0').classList.toggle("flip");
  },
  data: {
    category: 'pre-test-msg'
  }
});

training_block.push(training_rating);

// Pre feedback message
training_block.push({
  type: 'html-keyboard-response',
  stimulus: '<div class="instructions">\
    <p>This is the end of the test. You picked decks to draw cards from at both \
    tables.</p>\
    <p>Let\'s see how well you did. You will now flip the cards and see your \
    earnings from this game.</p>\
    <p>Press the space bar to continue.</p><div>',
  choices: [32],
  data: {
    category: 'pre-test-feedback-msg'
  }
});

training_block.push(training_feedback);

// Reward tally message
training_block.push({
  type: 'html-keyboard-response',
  stimulus: function() {
    var reward = (jsPsych.data.get().filter({
      trial_type: 'test-feedback'
    }).last(2).select('correct').sum() * table_worth).toFixed(2);
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
training_block = training_block.concat([{
    type: 'html-keyboard-response',
    stimulus: '<div class="instructions">\
    <p>You have completed this game.</p>\
    <p>Press the space bar to continue to the next part of the experiment.</p><div>',
    choices: [32],
    data: {
      category: 'game-over'
    }
  },
  {
    type: 'html-keyboard-response',
    stimulus: '<div class="instructions">\
      <p>You are now going to continue and play several more games.</p>\
      <p>While your task remains the same, the next games may be more difficult.\
      You will have to play at more than two tables. The decks on each table \
      may be more difficult to tell apart.</p>\
      <p><b><i>Remember:\
      </b></i> Your goal in any game is to learn the color differences \
      between the decks in the learning stage, and use your knowledge to win \
      extra money in the test that follows.</p>\
      <p>Press the space bar to continue</p><div>',
    choices: [32],
    data: {
      category: 'game-over'
    }
  },
  {
    type: 'html-keyboard-response',
    stimulus: '<div class="instructions">\
      <p>Press the space bar to continue to the next game.</p><div>',
    choices: [32],
    data: {
      category: 'game-over'
    }
  }
]);

// * ------ Experimental blocks ---------- * //
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
      block: c + 1
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
        block: c + 1
      });
      trial_opts.push({
        TL: exp_blocks_tables[c][j],
        TR: exp_blocks_tables[c][i],
        response_limit: 3000, //max_response_time,
        block: c + 1
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
      block: c + 1
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
          block: c + 1
        }
      }
    ]
  );

  // Test feedback
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
      }).last(18).select('correct').sum();

      return '<div class = "instructions"><p>You have completed this part of \
        the study. Overall, in the six games, you made an extra $' +
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
    type: "survey-text",
    questions: [{
      prompt: "How old are you?",
      columns: 20,
      rows: 1,
      value: ''
    }],
    on_load: function() {
      // Return mouse
      var stylesheet = document.styleSheets[0];
      stylesheet.deleteRule(stylesheet.cssRules.length - 1);
    },
    data: {
      category: 'debrief'
    }
  }, {
    type: "survey-multi-choice",
    questions: [{
        prompt: "What is your gender?",
        options: ["Male", "Female", "Other"],
        required: true
      },
      {
        prompt: "What is your dominant hand?",
        options: ["Right", "Left", "Both"],
        required: true
      },
      {
        prompt: "Is English your native language?",
        options: ["Yes", "No"],
        required: true
      }
    ],
    data: {
      category: 'debrief'
    }
  },
  {
    type: 'survey-likert',
    questions: [{
        prompt: "How fluent are you in reading and understanding English?",
        labels: ["1<br>Not at all", "2", "3", "4", "5<br>Very fluent"],
        required: true
      },
      {
        prompt: "How difficult was the color-discovery game to play?",
        labels: ["1<br>Not at all", "2", "3", "4", "5<br>Very difficult"],
        required: true
      }
    ],
    data: {
      category: 'debrief'
    }
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
    type: 'survey-text',
    questions: [{
      prompt: "Was there anything in the instructions you found unclear?",
      columns: 100,
      rows: 4,
      value: ''
    }],
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
      <p>You can win up to $6 bonus on each of the next sessions, and you'll \
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
      saveData('S' + PID + '_sess1_' + d.toISOString().slice(0,10),
        jsPsych.data.get().ignore('stimulus').csv(),
        function() {
          saveData('S' + PID + '_sess1' + '_plan', trial_plan,
            function() {
              saveData('S' + PID + '_sess1' + '_int',
                jsPsych.data.getInteractionData().csv(), transferComplete)
            });
        });
    }
  },
  {
    type: "html-keyboard-response",
    stimulus: "<div class='instructions'><p>Your results have successfully uploaded.</p>\
    <p>Your completion code for this study is: <br> <b>EK64HN7</b></p>\
    <p>Use it to submit this HIT on MTurk.</p>\
    <p>You may now close this window.</p></div>",
    choices: jsPsych.NO_KEYS
  }
];


// Put it all together
var experiment = [];
experiment.push(fullscreen);
experiment = experiment.concat(start_instructions);
experiment = experiment.concat(instructions_quiz);
experiment = experiment.concat(training_block);
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
