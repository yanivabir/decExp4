// Responsd quicker message
var kick_out = {
  type: 'html-keyboard-response',
  conditional_function: function() {
    if (jsPsych.data.get().last(1).select('n_warnings').values[0] > 10) {
      return true;
    } else {
      return false;
    }
  },
  timeline: [{
    stimulus: "<div class = 'instructions'>\
    <p>It seems that you are not performing the task as instructed.</p>\
    <p>Please return this HIT.</p>\
    <p>If you feel that this is a mistake, please email \
    ya2402+mturk@columbia.edu</p>\
    <p>Press the space bar to continue.</p></div>"
  }],
  choices: [32],
  on_finish: function() {
    var subject = jsPsych.data.get().last(1).select('PID').values[0];
    var sess = jsPsych.data.get().last(1).select('sess').values[0];
    var d = new Date;
    saveData('S' + PID + '_sess' + sess + '_' + d.toISOString().slice(0,10),
    jsPsych.data.get().ignore('stimulus').csv(),
    function() {
      saveData(timeStamp() + '_S' + subject + '_sess' + sess+ '_plan', trialPlan(),
      function() {
        saveData(timeStamp() + '_S' + subject + '_sess' + sess + '_int',
        jsPsych.data.getInteractionData().csv(),
        function() {
          self.close();
        })
      });
    });
  },
  data: {
    category: 'kick-out'
  }
}

var response_quick = [kick_out, {
  type: 'html-keyboard-response',
  stimulus: '<div style="font-size: 150%">Please choose more quickly</div>',
  choices: jsPsych.NO_KEYS,
  trial_duration: 1500,
  on_finish: function() {
    var up_to_now = parseInt(jsPsych.data.get().last(1).select('n_warnings').values);
    jsPsych.data.addProperties({
      n_warnings: up_to_now + 1
    });
  },
  data: {
    category: 'too-slow'
  },
  post_trial_gap: 800
}]

var response_too_quick = [kick_out, {
  type: 'html-keyboard-response',
  stimulus: '<div class="instructions"><p>Please make your choices accurately.\
  </p><p>Remember that your bonus payment is dependent on how well you learn \
  the colors on this stage</p><p>Press the space bar to continue.</div>',
  choices: [32],
  on_finish: function() {
    var up_to_now = parseInt(jsPsych.data.get().last(1).select('n_warnings').values);
    jsPsych.data.addProperties({
      n_warnings: up_to_now + 1
    });
  },
  data: {
    category: 'too-quick'
  }
},
{
  type: 'html-keyboard-response',
  stimulus: '<div class="instructions"><p>Place your right index finger on the \
  "K" key, and your left index finger on the "D" key.</p>\
  <p>Press either key to start sampling cards.</p></div>',
  choices: [68, 75],
  data: {
    category: 'too-quick-keys'
  },
  post_trial_gap: 800
}
];

var focusblur = [kick_out,
  {
    type: 'html-keyboard-response',
    stimulus: "<div class='instructions'><p>Please focus on the task and don't\
    use other windows.\
    </p><p>Remember that your bonus payment is dependent on how well you learn \
    the colors on this stage</p><p>Press the space bar to continue.</div>",
    choices: [32],
    on_finish: function() {
      var up_to_now = parseInt(jsPsych.data.get().last(1).select('n_warnings').values);
      jsPsych.data.addProperties({
        n_warnings: up_to_now + 1
      });
    },
    data: {
      category: 'focus-blur'
    },
    post_trial_gap: 800
  }
];

// Display sequence of a single choice trials
function second_stage_timeline(cards, object = false,
  with_replacement = false) {

    // Sequence for second stage
    return [
      // Object choice iti
      {
        type: 'html-keyboard-response',
        stimulus: function() {
          var chosen =
          jsPsych.timelineVariable('object_side', true) != undefined ?
          jsPsych.timelineVariable('object_side', true) :
          jsPsych.data.get().last(1).values()[0].chosen_object_side,
          TR = jsPsych.timelineVariable('TR', true),
          TL = jsPsych.timelineVariable('TL', true);

          var stimulus = mkTables(TL, TR, chosen == 'L' ? '' : 'hidden',
          chosen == 'R' ? '' : 'hidden');

          // Peel away closing of div
          stimulus = stimulus.substring(0, stimulus.length - 6)

          // Add inner table
          stimulus += '<table class="inner">\
          <tr>\
          <td class="inner L">\
          <div class = "inner">\
          </div>\
          </td>\
          <td class="inner R">\
          <div class = "inner">\
          </div>\
          </td>\
          </tr>\
          </table>';

          // Reclose div
          stimulus += '</div>'

          return stimulus
        },
        choices: jsPsych.NO_KEYS,
        trial_duration: 1000,
        data: {
          category: 'object_ITI'
        }
      },
      // Object choice fixation
      {
        type: 'html-keyboard-response',
        stimulus: function() {
          var chosen =
          jsPsych.timelineVariable('object_side', true) != undefined ?
          jsPsych.timelineVariable('object_side', true) :
          jsPsych.data.get().last(2).values()[0].chosen_object_side,
          TR = jsPsych.timelineVariable('TR', true),
          TL = jsPsych.timelineVariable('TL', true);

          var stimulus = mkTables(TL, TR, chosen == 'L' ? '' : 'hidden',
          chosen == "R" ? '' : 'hidden', fixation = 'yes');

          // Peel away closing of div
          stimulus = stimulus.substring(0, stimulus.length - 6)

          // Add inner table
          stimulus += '<table class="inner">\
          <tr>\
          <td class="inner L">\
          <div class = "inner">\
          </div>\
          </td>\
          <td class="inner R">\
          <div class = "inner">\
          </div>\
          </td>\
          </tr>\
          </table>';

          // Reclose div
          stimulus += '</div>'

          return stimulus
        },
        choices: jsPsych.NO_KEYS,
        trial_duration: 500,
        data: {
          category: 'object_fixation'
        }
      },
      // Deck choice
      {
        type: 'html-keyboard-response',
        stimulus: function() {
          var obj = object ? object : jsPsych.data.get().last(3).values()[0].chosen_object,
          side = jsPsych.timelineVariable('object_side', true) != undefined ?
          jsPsych.timelineVariable('object_side', true) :
          jsPsych.data.get().last(3).values()[0].chosen_object_side,
          block = jsPsych.timelineVariable('block', true);

          var stimulus = mkTables(obj, obj, side == 'L' ? '' : 'hidden',
          side == 'R' ? '' : 'hidden');

          // Peel away closing of div
          stimulus = stimulus.substring(0, stimulus.length - 6)

          // Add decks table
          stimulus += mkDeckStim(side, cards[block][obj][0].LCard,
            cards[block][obj][0].RCard);

            // Reclose div
            stimulus += '</div>'

            return stimulus
          },
          trial_duration: jsPsych.timelineVariable('response_limit'),
          choices: ['d', 'k'],
          on_finish: function(data) {
            // Update trial data with needed information
            var obj = object ? object : jsPsych.data.get().last(4).values()[0].chosen_object,
            block = jsPsych.timelineVariable('block', true);

            data.Rprob = cards[block][obj][0].RProb;
            data.Lprob = cards[block][obj][0].LProb;

            if (data.key_press == 68) {
              data.reward = cards[block][obj][0].LReward;
              data.chosen_deck_side = "L";
            } else {
              data.reward = cards[block][obj][0].RReward;
              data.chosen_deck_side = "R";
            }
            data.LCard = cards[block][obj][0].LCard;
            data.RCard = cards[block][obj][0].RCard;
          },
          data: {
            category: 'deck_choice',
            block: jsPsych.timelineVariable('block')
          }
        },
        {
          timeline: [
            {
              timeline: focusblur,
              conditional_function: function() {return check_focusblur(3)}
            },
            {
              timeline:[
                // Deck choice feedback
                {
                  type: 'html-keyboard-response',
                  stimulus: function() {
                    var obj = object ? object :
                    jsPsych.data.get().last(4).values()[0].chosen_object,
                    side =
                    jsPsych.timelineVariable('object_side', true) != undefined ?
                    jsPsych.timelineVariable('object_side', true) :
                    jsPsych.data.get().last(4).values()[0].chosen_object_side,
                    block = jsPsych.timelineVariable('block', true);

                    var stimulus = mkTables(obj, obj, side == 'L' ? '' : 'hidden',
                    side == 'R' ? '' : 'hidden');

                    // Peel away closing of div
                    stimulus = stimulus.substring(0, stimulus.length - 6)

                    // Add decks table
                    stimulus += mkDeckStim(side, cards[block][obj][0].LCard,
                      cards[block][obj][0].RCard);

                      // Reclose div
                      stimulus += '</div>'

                      return stimulus
                    },
                    on_load: function() {
                      side = jsPsych.data.get().last(1).values()[0].chosen_deck_side;
                      shuffleDeck(side);
                    },
                    choices: jsPsych.NO_KEYS,
                    data: {
                      category: 'deck_feedback'
                    },
                    trial_duration: 1000
                  },
                  {
                    timeline: focusblur,
                    conditional_function: function() {return check_focusblur(1)}
                  }
                ],
                conditional_function: function(){
                  return jsPsych.data.get().last(1).select("category").values[0] ==
                  "deck_choice"}
                },
                {
                  timeline: [
                    // Reward
                    {
                      type: 'html-keyboard-response',
                      stimulus: function() {
                        var obj = object ? object :
                        jsPsych.data.get().last(5).values()[0].chosen_object,
                        side =
                        jsPsych.timelineVariable('object_side', true) != undefined ?
                        jsPsych.timelineVariable('object_side', true) :
                        jsPsych.data.get().last(5).values()[0].chosen_object_side,
                        block = jsPsych.timelineVariable('block', true);

                        var stimulus = mkTables(obj, obj, side == 'L' ? '' : 'hidden',
                        side == 'R' ? '' : 'hidden');

                        // Peel away closing of div
                        stimulus = stimulus.substring(0, stimulus.length - 6)

                        // Add decks table
                        stimulus += mkDeckStim(side, cards[block][obj][0].LCard,
                          cards[block][obj][0].RCard);

                          // Reclose div
                          stimulus += '</div>'

                          return stimulus
                        },
                        on_load: function() {
                          side = jsPsych.data.get().last(2).values()[0].chosen_deck_side;
                          reward = jsPsych.data.get().last(2).values()[0].reward;
                          document.querySelector("#flip-toggle" + side + '19 div.back').classList.toggle(reward);
                          jsPsych.pluginAPI.setTimeout(function() {
                            document.querySelector("#flip-toggle" + side + '19').classList.toggle("flip");
                          }, 50);
                        },
                        choices: jsPsych.NO_KEYS,
                        trial_duration: 2400,
                        post_trial_gap: 1700,
                        on_finish: !with_replacement ?
                        function() {
                          var obj = object ? object : jsPsych.data.get().last(6).values()[0].chosen_object,
                          block = jsPsych.timelineVariable('block', true);
                          cards[block][obj].shift();
                        } : undefined,
                        data: {
                          category: 'reward'
                        }
                      }
                    ],
                    conditional_function: function(){
                      return jsPsych.data.get().last(1).select("category").values[0] ==
                      "deck_feedback"}}
                    ],
                    conditional_function: function() {
                      if (jsPsych.data.get().last(1).values()[0].key_press) {
                        return true
                      } else {
                        return false
                      }
                    }
                  },
                  {
                    timeline: response_quick,
                    conditional_function: function() {
                      if (jsPsych.data.get().filter({
                        category: 'deck_choice'
                      }).last(1).values()[0].key_press) {
                        return false
                      } else {
                        return true
                      }
                    }
                  },
                  {
                    timeline: response_too_quick,
                    conditional_function: check_response_too_quick
                  },
                  {
                    timeline: focusblur,
                    conditional_function: function() {return check_focusblur(1)}
                  }
                ]
              }

function choice_trial(cards) {

  // Full sequence of trial
  return [{
    // Fixation
    type: 'html-keyboard-response',
    stimulus: '<div id="fixation">+</div>',
    choices: jsPsych.NO_KEYS,
    trial_duration: 500,
    data: {
      category: 'fixation'
    }
  },
  {
    // Object choice
    type: 'html-keyboard-response',
    stimulus: function() {
      return mkTables(jsPsych.timelineVariable('TL', true),
      jsPsych.timelineVariable('TR', true))
    },
    trial_duration: jsPsych.timelineVariable('response_limit'),
    choices: ['d', 'k'],
    on_finish: function(data) {
      if (data.key_press == 68) {
        data.chosen_object = jsPsych.timelineVariable('TL', true);
        data.chosen_object_side = 'L';
      } else {
        data.chosen_object = jsPsych.timelineVariable('TR', true);
        data.chosen_object_side = 'R';
      }
    },
    data: {
      category: 'object_choice',
      TL: jsPsych.timelineVariable('TL'),
      TR: jsPsych.timelineVariable('TR'),
      block: jsPsych.timelineVariable('block')
    }
  },
  {
    // Rest of trial post object choice timeline
    timeline: second_stage_timeline(cards),
    conditional_function: function() {
      if ([68, 75].some(x => x ==
        jsPsych.data.get().last(1).values()[0].key_press) &
        !check_response_too_quick() &
        !check_focusblur(2)) {
          return true
        } else {
          return false
        }
      }
    },
    {
      timeline: response_quick,
      conditional_function: function() {
        if (jsPsych.data.get().filter({
          category: 'object_choice'
        }).last(1).values()[0].key_press) {
          return false
        } else {
          return true
        }
      }
    },
    {
      timeline: response_too_quick,
      conditional_function: check_response_too_quick
    },
    {
      timeline: focusblur,
      conditional_function: function() {return check_focusblur(2)}
    }
  ]
}

// Display sequence of single test trial
var test_trial = [{
  type: 'html-keyboard-response',
  stimulus: function() {
    return '<div><p>&nbsp;</p><p>You\'ll now be tested at this table:</p></div>\
    <div class="table_icon">\
    <img src="/static/images/' +
    jsPsych.timelineVariable('table', true) +
    '.jpg" class="tables"></img>\
    </div>\
    <div><br>Press the space bar to continue.</div>'
  },
  choices: [32],
  data: {
    category: 'pre_test_prompt'
  }
},
{
  type: 'test-trial',
  table: jsPsych.timelineVariable('table'),
  LCard: jsPsych.timelineVariable('LCard'),
  RCard: jsPsych.timelineVariable('RCard'),
  prompt: function() {
    return 'Choose the deck that has more <br><b><i>' +
    color_names[jsPsych.timelineVariable('reward_color', true)].toLowerCase() +
    '</b></i> in it:'
  },
  data: {
    category: 'test',
    left_is: jsPsych.timelineVariable('left_is'),
    reward_color: jsPsych.timelineVariable('reward_color'),
    LProb: jsPsych.timelineVariable('propL'),
    RProb: jsPsych.timelineVariable('propR')
  },
  post_trial_gap: 1000,
}
];

// Display sequence of single test feedback trial
var test_feedback = [{
  type: 'html-keyboard-response',
  stimulus: function() {
    return '<div><p>Let\'s see if you made the correct choice at this table:</p></div>\
    <div class="table_icon">\
    <img src="/static/images/' +
    jsPsych.timelineVariable('table', true) +
    '.jpg" class="tables"></img>\
    </div>\
    <div><br>Press the space bar to continue.</div>'
  },
  choices: [32],
  data: {
    category: 'pre_test_feedback_prompt'
  }
},
{
  type: 'test-feedback',
  table: jsPsych.timelineVariable('table'),
  correct: function() {
    var side = jsPsych.data.get().filter({
      trial_type: 'test-trial'
    }).filter({
      table: jsPsych.timelineVariable('table', true)
    }).last(1).select('choice').values[0];

    return jsPsych.timelineVariable('prop' + (side == 'L' ? 'R' : 'L'), true) <
    jsPsych.timelineVariable('prop' + side, true)
  },
  TCard: function() {
    return jsPsych.data.get().filter({
      trial_type: 'test-trial'
    }).filter({
      table: jsPsych.timelineVariable('table', true)
    }).last(1).select('chosen_deck').values[0]
  },
  BCard: function() {
    var side = jsPsych.data.get().filter({
      trial_type: 'test-trial'
    }).filter({
      table: jsPsych.timelineVariable('table', true)
    }).last(1).select('choice').values[0];

    return jsPsych.timelineVariable((side == 'L' ? 'R' : 'L') + 'Card', true)
  },
  TMasks: function() {
    var side = jsPsych.data.get().filter({
      trial_type: 'test-trial'
    }).filter({
      table: jsPsych.timelineVariable('table', true)
    }).last(1).select('choice').values[0];

    return jsPsych.timelineVariable('masks' + side, true)
  },
  BMasks: function() {
    var side = jsPsych.data.get().filter({
      trial_type: 'test-trial'
    }).filter({
      table: jsPsych.timelineVariable('table', true)
    }).last(1).select('choice').values[0];

    return jsPsych.timelineVariable('masks' + (side == 'L' ? 'R' : 'L'), true)
  },
  reward_color: jsPsych.timelineVariable('reward_color'),
  data: {
    LProb: jsPsych.timelineVariable('propL'),
    RProb: jsPsych.timelineVariable('propR')
  }
}
]

// Card decks for hammer-on-head demonstration
function mkHammerDecks(TCard, BCard, TMasks, BMasks) {
  return '<div class="demo_decks" style="position: relative; height: 350px;">\
  <div id="top_deck">' +
  mkMovingDeck(TCard, deck_size = 8, undefined, TMasks, 'T') +
  '</div><div id="bottom_deck">' +
  mkMovingDeck(BCard, deck_size = 8, undefined, BMasks, 'B') +
  '</div></div>'
}

// Populates the cards array for a block (trial plan)
function mkCardArray(tables, cards, firstColorProb, colors, n_trials) {
  // tables: array with string names
  // cards: array as long as tables, each element is an array of length 2, with cards names
  // color: a 2 element array.
  // firstColorProb: array as long as tables, each element is an array of length 2 with blue probs


  var cardObject = {}; // Object containing the plan
  for (i = 0; i < tables.length; i++) {

    // Crate array for each table
    cardObject[tables[i]] = [];

    // Draw reward for each deck in table
    var rewards = []; // temporary rewards array
    rewards.push(Array(Math.ceil(n_trials * firstColorProb[i][0])).fill(colors[0]).concat(Array(Math.floor(n_trials - n_trials * firstColorProb[i][0])).fill(colors[1])));
    rewards.push(Array(Math.ceil(n_trials * firstColorProb[i][1])).fill(colors[0]).concat(Array(Math.floor(n_trials - n_trials * firstColorProb[i][1])).fill(colors[1])));

    rewards[0] = jsPsych.randomization.shuffle(rewards[0]);
    rewards[1] = jsPsych.randomization.shuffle(rewards[1]);

    // Populate trials
    for (j = 0; j < n_trials; j++) {

      if (Math.random() > 0.5) {
        var LCard = cards[i][0],
        RCard = cards[i][1],
        LReward = rewards[0].pop(),
        RReward = rewards[1].pop(),
        LProb = firstColorProb[i][0],
        RProb = firstColorProb[i][1]
      } else {
        var RCard = cards[i][0],
        LCard = cards[i][1],
        RReward = rewards[0].pop(),
        LReward = rewards[1].pop(),
        RProb = firstColorProb[i][0],
        LProb = firstColorProb[i][1]
      }

      cardObject[tables[i]].push({
        LCard: LCard,
        RCard: RCard,
        LReward: LReward,
        RReward: RReward,
        LProb: LProb,
        RProb: RProb
      });
    }
  }

  return cardObject
}

// Creates timeline to shuffle a deck, use in on_load
function shuffleDeck(shuffle_side, deck_size = 20, time_range = [0.1, 0.6],
  x_range = 120, y_range = 7) {
    var tl = new TimelineMax({
      // onComplete: time_end
    });

    var times = [];

    for (i = 0; i < deck_size; i++) {
      times[i] = Math.random() * (time_range[1] - time_range[0]) +
      time_range[0];
      tl.to('#flip-toggle' + shuffle_side + i, 0.2, {
        x: Math.random() * x_range - x_range / 2,
        y: y_range == '' ? null : Math.random() * y_range - y_range / 2,
        yoyo: true,
        repeat: 1
      }, 0);
    }

    for (i = 0; i < deck_size; i++) {
      tl.set('#' + shuffle_side + i, {
        zIndex: Math.round(Math.random() * deck_size)
      }, 0.2);
    }

    for (i = 0; i < deck_size; i++) {
      times[i] = Math.random() * (time_range[1] - time_range[0]) +
      time_range[0];
      tl.to('#flip-toggle' + shuffle_side + i, 0.2, {
        x: Math.random() * x_range - x_range / 2,
        y: y_range == '' ? null : Math.random() * y_range - y_range / 2,
        yoyo: true,
        repeat: 1
      }, 0.4);
    }

    for (i = 0; i < deck_size; i++) {
      tl.set('#flip-toggle' + shuffle_side + i, {
        zIndex: Math.round(Math.random() * deck_size)
      }, 0.6);
    }

    for (i = 0; i < deck_size; i++) {
      tl.set('#flip-toggle' + shuffle_side + i, {
        zIndex: i
      }, 0.8);
    }
  }

// Creates the table images for a trial
function mkTables(LTable, RTable, LVisible = '', RVisible = '', fixation = '') {
  var stimulus = '<div class="two_tables">\
  <table class="two_tables">\
  <tr>\
  <td class="tableL">\
  <img src="/static/images/' +
  LTable +
  '.jpg" class="tables ' + LVisible + '"></img>';

  if (fixation != '') {
    stimulus += '<div id="fixation" class="second_fixation L ' + LVisible + '">+</div>';
  }

  stimulus += '</td>\
  <td class="tableR">\
  <img src="/static/images/' +
  RTable +
  '.jpg" class="tables ' + RVisible + '"></img>';

  if (fixation != '') {
    stimulus += '<div id="fixation" class="second_fixation R ' + RVisible + '">+</div>';
  }

  stimulus += '</td>\
  </tr>\
  </table>\
  </div>';

  return stimulus
}

// Creates a single card
function mkCard(side, num, card, mask, offset = 0, position = 'initial',
extra_class = '', extra_offset = '') {
  return '<div class="flip-container ' + extra_class + '" id="flip-toggle' + side + num + '" \
  style="transform: translate(' + offset + 'px, ' + offset + 'px)' +
  extra_offset + '; \
  position: ' + position + ';">\
  <div class="flipper">\
  <div class = "' + side + ' card front ' + card + '">\
  </div>\
  <div class = "' + side + ' card ' + mask + ' back ' + card + '">\
  </div>\
  </div>\
  </div>'
}

// Creates two decks of cards
function mk2decks(LCard, RCard, LMask = '', RMask = '', deck_size = 20,
card_offset = 0.3) {
  var stimulus = '<table class="deck L">\
  <tr>\
  <td class="deck L">';


  if (LCard != '' || LMask != '') {
    for (i = 0; i < deck_size; i++) {
      var offset = (i - ((deck_size - 1) / 2)) * -card_offset;

      stimulus += mkCard('L', i, LCard, LMask, offset = offset,
      i == (deck_size - 1) ? 'initial' : 'absolute');
    }
  }

  stimulus +=
  '</td>\
  <td class="deck R">';

  if (RCard != '' || RMask != '') {
    for (i = 0; i < deck_size; i++) {
      var offset = (i - ((deck_size - 1) / 2)) * -card_offset;

      stimulus += mkCard('R', i, RCard, RMask, offset = offset,
      i == (deck_size - 1) ? 'initial' : 'absolute');
    }
  }

  stimulus +=
  '</td>\
  </tr>\
  </table>';

  return stimulus
}

// Make container for decks
function mkDeckStim(side, LCard, RCard, deck_size = 20, card_offset = 0.3,
  LMask = 'blank', RMask = 'blank') {

    // var card_r = mkCard('R', 0, RCard, 'yellow');
    //
    // var card_l = mkCard('L', 0, LCard, '');

    var stimulus = '<table class="inner">\
    <tr>\
    <td class="inner L">\
    <div class = "inner">';

    if (side == 'L') {
      stimulus += mk2decks(LCard, RCard, LMask, RMask, deck_size, card_offset);
    }

    stimulus +=
    '</div>\
    </td>\
    <td class="inner R">\
    <div class = "inner">';

    if (side == 'R') {
      stimulus += mk2decks(LCard, RCard, LMask, RMask, deck_size, card_offset);
    }

    stimulus +=
    '</div>\
    </td>\
    </tr>\
    </table>';
    return stimulus
  }

// Making deck for test phase
function mkMovingDeck(card, deck_size = 20, card_offset = 0.3, masks = [],
  loc = '') {
    var stimulus = '<div class="moving_deck">';

    for (i = 0; i < deck_size; i++) {
      var offset = (i - deck_size / 2) * -card_offset;

      var thisMask = masks.length > 0 ? masks[i] : '';

      stimulus += mkCard(loc, i, card, thisMask, offset = offset,
        'absolute', 'rate ' + loc, 'translate(0, -50%)');
      }

      stimulus += '<div class="flip-container rate deck_click" id="deck_click"></div>';

      stimulus += '</div>';

      return stimulus
    }

// Make table and decks for intro
function mkIntroTable(table, LCard = '', RCard = '', LMask = '', RMask = '') {

  var stimulus = '<div class="intro_table">\
  <div class="table_icon">\
  <img src="/static/images/' +
  table +
  '.jpg" class="tables"></img>\
  </div>';

  if (LCard != '' || RCard != '') {
    stimulus += '<div class = "inner icon">' +
    mk2decks(LCard, RCard, LMask, RMask) +
    '</div>'
  }

  // Reclose div
  stimulus += '</div>';
  return stimulus
}

// Save data to file functions
function saveData(name, data, onComplete = function() {}, type = 'csv') {
  name = name + '.' + type;
  var xhr = new XMLHttpRequest();
  xhr.addEventListener("load", onComplete);
  xhr.open('POST', 'write_data.php'); // 'write_data.php' is the path to the php file described above.
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    filename: name,
    filedata: data
  }));
}

// Time stamp for files
function timeStamp() {

  function s(x) {
    return x.length == 1 ? '0' + x : x
  }

  var a = new Date(),
  MM = s((a.getUTCMonth() + 1).toFixed()),
  dd = s(a.getUTCDate().toFixed()),
  hh = s(a.getUTCHours().toFixed()),
  mm = s(a.getUTCMinutes().toFixed());

  return a.getFullYear().toFixed() + MM + dd + hh + mm
}

// Navigate to prolific
function transferComplete() {
  window.opener.close();
  jsPsych.finishTrial();
}

// Save trial plan variables
function trialPlan() {
  return JSON.stringify({
    cards: cards,
    tables: exp_blocks_tables,
    exp_blocks_n_trials: exp_blocks_n_trials,
    exp_reward_probs: exp_reward_probs
  });
}

// Auxillary small functions

// A function to check whether the first full practice has gone well
function learning_practice_check_function() {
  var sides = jsPsych.data.get().filter({
    category: 'deck_choice'
  }).last(4).select('chosen_deck_side').values,
  chosen_decks = [];

  for (i = 0; i < 4; i++) {
    var what = sides[i] + 'Card';
    chosen_decks.push(jsPsych.data.get().filter({
      category: 'deck_choice'
    }).last(4).select(what).values[i]);
  }

  for (i = 0; i < 4; i++) {
    var t = chosen_decks.pop();
    if (chosen_decks.some(x => x == t)) {
      return true
    }
  }

  return false
}

// A function for checking whether the first test practice has gone well
function test_practice_check_function() {
  var choice = jsPsych.data.get().filter({
    trial_type: 'test-trial'
  }).last(1).values()[0].choice;

  return choice == 'L'
}

// A function for checking the answers on the quiz
function quiz_check_function(questions, ind) {
  var resps = jsPsych.data.get().filter({
    trial_type: 'survey-multi-choice'
  }).last(3).select('responses').values;

  if (ind == 'all'){ // Check all answers
    for (i = 0; i < resps.length; i++) {
      var ans = JSON.parse(resps[i])
      for (j = 0; j < 2; j++) {
        if (ans['Q' + j] != questions[i * 2 + j].correct) {
          return true
        }
      }
    }
    return false
  }else { // Check single answer
    ans = JSON.parse(resps[Math.floor(ind / 2)])
    if(ans['Q' + ind % 2] != questions[ind].correct) {
      return true
    }
    return false
  }
}

// A function for checking for  quick responses
function check_response_too_quick() {
  if (jsPsych.data.get().last(1).select('category').values == 'too-quick-keys') {
    return false
  }

  var rts = jsPsych.data.get().filterCustom(function(trial) {
    return trial.category == undefined ? false :
    trial.category.includes('choice')
  }).select('rt').values
  if (rts.length >= 3 &&
    rts.slice(rts.length - 3, rts.length).every(x => x < 250 && x > 0)) {
      return true
    } else {
      return false
    }
  }

function check_fullscreen(){
  if (jsPsych.data.getURLVariable('workerId') == '1'){
    return false
  }

  var int = jsPsych.data.getInteractionData(),
  exit = int.values().filter(function(e){
    return e.event == "fullscreenexit"
  }),
  enter = int.values().filter(function(e){
    return e.event == "fullscreenenter"
  });

  if (exit.length > 0){
    return exit[exit.length - 1].time > enter[enter.length - 1].time
  }else{
    return false
  }

}

function check_focusblur(n){
  // n is number of trial back to check for focus loss
  if (jsPsych.data.getURLVariable('workerId') == '1'){
    return false
  }

  var last_trial = jsPsych.data.get().last(1).select('category').values;
  if (last_trial == 'too-quick-keys' | last_trial == 'too-slow' |
  last_trial == 'focus-blur') {
    return false
  }

  var blurs = jsPsych.data.getInteractionData().filter({
    event: "blur"
  }).select('trial').values, // Find blur events
  // Get trial indx for trials of interest
  inx = jsPsych.data.get().last(n).select('trial_index').values,
  intersect = blurs.filter(value => inx.includes(value)); // Find intersection of trials
  if (intersect.length > 0){
    return true
  }

  return false
}

// A function for checking the structure quiz
function structure_quiz_check(tables, decks) {
  return function() {
    var correct = {};
    for (j = 0; j < tables.length; j++) {
      correct[tables[j]] = [decks[j * 2], decks[j * 2 + 1]];
    }

    var chosen_decks = jsPsych.data.get().filter({
      category: 'structure_quiz'
    }).last(tables.length * 2).select('chosen_deck').values,

    disp_tables = jsPsych.data.get().filter({
      category: 'structure_quiz'
    }).last(tables.length * 2).select('table').values;

    for (j = 0; j < disp_tables.length; j++) {
      if (!correct[disp_tables[j]].some(x => x == chosen_decks[j])) {
        return true
      }
    }

    return false
  }
}

// A function for checking the deck comprehension quiz
function hammer_quiz_check() {
  var resp = JSON.parse(jsPsych.data.get().last(1).values()[0].responses).Q0,
  correct = jsPsych.data.get().last(1).values()[0].correct;

  if (resp == correct) {
    return false
  } else {
    return true
  }
}

// Reveal cards for hammer demo quiz
function hammer_demo_reveal() {
  var stylesheet = document.styleSheets[0];
  stylesheet.deleteRule(stylesheet.cssRules.length - 1);

  for (j = 0; j < 8; j++) {
    document.querySelector('#flip-toggleT' + (7 - j)).classList.toggle('dm' + j);
    document.querySelector('#flip-toggleT' + (7 - j)).classList.toggle('flip');
    document.querySelector('#flip-toggleB' + (7 - j)).classList.toggle('dm' + j);
    document.querySelector('#flip-toggleB' + (7 - j)).classList.toggle('flip');
  }
}
