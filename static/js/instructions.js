var fullscreen_prompt = {
  type: 'fullscreen',
  fullscreen_mode: true,
  timeline: [
    {
      message: '<div class="instructions"><p>This study has to run in fullscreen mode.</p><p>To switch to full screen mode \
        and restart the experiment, press the button below.</p></div>'
    }
  ],
  conditional_function: check_fullscreen,
  on_finish: function() {
    // Hide Mouse
    var stylesheet = document.styleSheets[0];
    stylesheet.insertRule("* {cursor: none;}", stylesheet.cssRules.length);

    // Update warning count
    var up_to_now = parseInt(jsPsych.data.get().last(1).select('n_warnings').values);
    jsPsych.data.addProperties({
      n_warnings: up_to_now + 1
    });
  },
  on_load: function() {
    // Return mouse
    var stylesheet = document.styleSheets[0];

    if (stylesheet.cssRules[stylesheet.cssRules.length - 1].cssText ==
        "* { cursor: none; }") {
      stylesheet.deleteRule(stylesheet.cssRules.length - 1);
    }
  },
  data: {
    category: 'fullscreen-prompt'
  }
}

function insert_fsprompt(inst){
  for (i=inst.length; i > 0; i--){
    inst.splice(i, 0, fullscreen_prompt)
  }
  return inst
}

var start_instructions_timeline1 = insert_fsprompt([{
    stimulus: '<div class="instructions"><p>Welcome to the first session of this \
     experiment!</p><p>Please read all following instructions very carefully. It takes some \
    time, but otherwise you will not know what to do.</p><p>After reading the \
    instructions, you will be quizzed on them.</p>\
    <p>Press the space bar to continue.</p></div>'
  },
  {
    stimulus: '<div class="instructions"><p>This is the first session of four.</p>\
    <p>Participants who successfully complete this session, will be invited \
    to the next sessions, in which the bonus payments are consistently larger.</p>\
    <p>Note that participants who do not follow the task instructions \
    creafully, or fail to give their undivided attention to the task,\
    will not recieve invitations to the next sessions.</p>\
    <p>Press the space bar to continue.</p></div>'
  },
  {
    stimulus: '<div class="instructions"><p>In this experiment, you will be \
    playing several rounds of the card-deck color discovery game.</p>\
    <p>Press the space bar to continue.</p></div>'
  },
  {
    stimulus: '<div class="instructions"><p>Each round of the game has two stage: \
    A <b>learning stage</b>, and a <b>test \
    stage</b>.</p><p>You will get bonus payment according to your performance on \
    the test.</p><p>In the learning stage, you’ll be preparing for the test. <i>If you \
    prepare well, you will be able to increase your bonus payment up to a \
    maximum of $4.50.</i></p>\
    <p>Press the space bar to continue.</p></div>'
  },
  {
    stimulus: '<div class="instructions"><p>On each game, you will be presented \
    with several tables.</p>\
    <p>You can recognize each table by the colorful pattern covering it. This \
    is an example table:</p></div>\
    <div class="table_icon">\
    <img src="/static/images/train_mrbl1.jpg" class="tables"></img>\
      </div><div class="instructions"><p>Press the space bar to continue.</p></div>'
  },
  {
    stimulus: function() {
      return '<div class="instructions"><p>On each table there are two decks \
    of cards.</p>\
    <p>You can recognize each deck by the shape drawn on the backs of the cards.\
    This is an example of a table with the two decks of cards on it:</p>\
    </div><div style="position:relative">' +
        mkIntroTable('train_mrbl1', training_patterns[0],
          training_patterns[1]) +
        '</div><div class="instructions"><p>Press the space bar to continue.</p></div>'
    }
  },
  {
    stimulus: function() {
      return '<div class="instructions"><p>The front of the cards is painted \
      with one solid color. For example, this card is painted ' +
        color_names[training_colors[0]].toLowerCase() + ':</p></div>\
      <div style="position:relative">' +
        mkIntroTable('train_mrbl1', training_patterns[0],
          training_patterns[1], training_colors[0], training_colors[1]) +
        '</div>\
          <div class="instructions"><p>Press the space bar to continue.</p></div>'
    },
    on_load: function() {
      document.querySelector('#flip-toggleL19').classList.toggle("flip")
    }
  },
  {
    stimulus: function() {
      return '<div class="instructions"><p>There are two possible card colors \
      in each game. And so, this card is painted ' +
        color_names[training_colors[1]].toLowerCase() + ':</p></div>\
      <div style="position:relative">' +
        mkIntroTable('train_mrbl1', training_patterns[0],
          training_patterns[1], training_colors[0], training_colors[1]) +
        '</div>\
          <div class="instructions"><p>Press the space bar to continue.</p></div>'
    },
    on_load: function() {
      document.querySelector('#flip-toggleR19').classList.toggle("flip")
    }
  },
  {
    stimulus: function() {
      return '<div class="instructions"><p>Each of the decks has a different \
    number of cards of each color.</p><p>For example, deck A on a table will \
    have more ' +
        color_names[training_colors[1]].toLowerCase() + ' cards than deck B. </p>\
    <p>Deck B will have more ' + color_names[training_colors[0]].toLowerCase() +
        ' cards than the deck A.</p><p>Press the space bar to continue.</p></div>'
    }
  },
  {
    stimulus: '<div class="instructions"><p>Your goal in the learning stage is \
    to <i>discover which deck on a table has more of each color</i>.</p><p> The better you \
    know which deck has more of each color, the bigger your bonus earnings \
    will be.</p><p>Press the space bar to continue.</p></div>'
  },
  {
    stimulus: '<div class="instructions"><p><i>After you finish the learning stage</i>, \
    you will be told which of the two colors is worth bonus money.</p>\
    <p>In the test stage that follows, <b>you will visit each one of the tables</b>. \
    At each table, you will choose the deck you think has more reward cards in it.</p><p> \
    Each correct choice \
    in the <b>test stage</b> will earn you an extra 25 cents bonus payment.</p>\
    <p>Press the space bar to continue.</p></div>'
  },
  {
    stimulus: '<div class="instructions"><p>You will now start practicing for \
    the two stages of the experiment.</p>\
    <p> First, you will practice the learning stage.<br>\
    Next, you will practice the test stage.</p>\
    <p>After you understand both stages, the experiment will begin.</p>\
    <p>Press the space bar to continue.</p></div>'
  },
  {
    stimulus: '<div class="instructions"><p>In the learning stage, you will get \
    to sample cards from the decks, and so <i>learn which deck has more cards of \
    each color</i>.</p><p>Press the space bar to continue.</p></div>'
  },
  {
    stimulus: '<div class="instructions"><p>To sample a card from the deck on \
    the right, press the "K" key. To sample a card from the deck on the left, \
    press the "D" key.</p><p>Press the space bar to continue.</p></div>'
  },
  {
    stimulus: function() {
      return '<div class="instructions"><p>Let’s practice: On the next screen, \
      you will be presented with a table and two decks of cards. Sample a card \
      from the deck that looks like this:</p></div>\
      <div style="position:relative; \
      width: 105px; transform:translate(-50%, 0); left: 50%">' +
        mkCard('L', 0, training_patterns[0], '', offset = 0, 'inherit') +
        '</div><div class="instructions"><p>Press the space bar to continue.</p></div>'
    },
    data: {
      chosen_object: 'train_mrbl1',
      chosen_object_side: 'L'
    }
  },
]);

var start_instructions_timeline2 = insert_fsprompt([{
    stimulus: function() {
      return '<div class="instructions"><p>This time you flipped a ' +
        color_names[training_colors[0]].toLowerCase() + ' card.</p><p> Importantly, \
        even though the decks switched sides, you sampled a card from the same \
        deck both times.</p><p>Press the space bar to continue.</p></div>'
    }
  },
  {
    stimulus: function() {
      return '<div class="instructions"><p>Each deck of cards has a different \
      number of color cards in it.</p><p> You will now be able to choose between the \
      two decks several times. As you sample cards, <b>try to figure out</b> which deck \
      has more ' + color_names[training_colors[0]].toLowerCase() + ' cards in it \
      than the other.</p>\
      <p>Naturally, the other deck will have more ' +
        color_names[training_colors[1]].toLowerCase() + ' cards than the \
      first deck.</p>\
      <p>Press the space bar to continue.</p></div>'
    }
  },
  {
    stimulus: '<div class="instructions"><p>Place your right index finger on the \
      "K" key, and your left index finger on the "D" key.</p>\
      <p>Press either key to start sampling cards.</p></div>',
    choices: [68, 75]
  }
]);

var start_instructions_timeline3 = insert_fsprompt([{
    stimulus: '<div class="instructions"><p>Well done.</p><p>Both decks could \
    have a majority of cards of the same color, but still one deck will always \
    have more cards of that color than the other one.</p>\
    <p>That means that <b>you have to sample from both decks</b> in order to learn the \
    color differences between the decks.</p>\
    </p><p>Press the space bar to continue.</p></div>'
  },
  {
    stimulus: '<div class="instructions"><p>Now that you know how to pick a \
      deck of cards to sample, you can learn how to play the whole learning \
      stage.</p><p>Press the space bar to continue.</p></div>'
  },
  {
    stimulus: '<div class="instructions"><p>Each time you sample a card, you \
      will first have to choose which table to visit.</p>\
      <p>Each time, you will be presented with two tables you could visit. You \
      have to choose one of them.</p><p>Press the space bar to continue.</p></div>'
  },
  {
    stimulus: '<div class="instructions"><p>This is an example of how the two \
    tables may look:</p></div><div>' + mkTables('train_mrbl1', 'train_mrbl2') +
      '</div><div class="instructions"><p>Press the space bar to continue.</p></div>'
  },
  {
    stimulus: '<div class="instructions"><p>To visit the table displayed on \
    the right, press the "K" key. To visit the table displayed on the left, \
    press the "D" key</p><p>Press the space bar to continue.</p></div>'
  },
  {
    stimulus: '<div class="instructions"><p>Your goal in the learning stage is \
    to learn the color difference between the two decks on each table.</p>\
    <p>You will now practice a few rounds of choosing a table, and then a deck \
    of cards. <i><b>As practice</b>, sample one card from each deck on each table</i>.</p>\
    <p>Press the space bar to continue.</p></div>'
  },
  {
    stimulus: '<div class="instructions"><p>Place your right index finger on the \
      "K" key, and your left index finger on the "D" key.</p>\
      <p>Press either key to start sampling cards.</p></div>',
    choices: [68, 75]
  }
]);

var start_instructions_timeline4 = insert_fsprompt([{
    stimulus: '<div class="instructions"><p>You now know how to play the \
    learning stage of the game.</p><p>Let\'s move on to practicing the test \
    stage.</p><p>Press the space bar to continue.</p></div>'
  },
  {
    stimulus: '<div class="instructions"><p>The last piece of the game is the \
    test stage.</p><p>Just before the test, you will be told which color card is \
    worth bonus money.</p><p>Your goal in the test is to choose the deck that \
    has the most cards of this\
    color at each table.</p><p>Press the space bar to continue.</p></div>'
  },
  {
    stimulus: '<div class="instructions"><p>In the test stage, you will visit \
    each of the four tables.</p><p>On each table, you have to choose one deck \
    you think has the most reward cards in it.\
    </p><p>Each correct choice that you make during the test, \
    translates into an extra 25 cents for you. This can add up to a total of $4.50 bonus payment for this session.</p>\
    <p>Press the space bar to continue.</p></div>'
  },
  {
    stimulus: '<div class="instructions"><p>To select a deck in the test stage, \
    just <i>click the deck using the mouse</i>.</p>\
    <p>Press the space bar to continue.</p></div>'
  },
  {
    stimulus: function() {
      return '<div class="instructions"><p><b>For practice</b>, let\'s imagine that \
      the ' + color_names[training_reward_color].toLowerCase() + ' cards are \
      worth money. Imagine that you discovered in the learning stage that this \
      deck has more ' + color_names[training_reward_color].toLowerCase() +
        ' cards in it:</p></div>' +
        '<div style="position:relative; \
      width: 105px; transform:translate(-50%, 0); left: 50%">' +
        mkCard('L', 0, training_patterns[0], '', offset = 0, 'inherit') +
        '</div><div class="instructions"><p>On the next screen, practice \
        choosing one of the two decks, given that you are very \
        certain that this deck has more bonus cards in it than the other.</p>\
        <p>Press the space bar to practice choosing cards.</p></div>'
    },
    type: 'html-keyboard-response',
    choices: [32]
  }
]);

var start_instructions_timeline5 = insert_fsprompt([{
    stimulus: function() {
      var reward = (jsPsych.data.get().filter({
        trial_type: 'test-feedback'
      }).last(1).select('correct').sum() * table_worth).toFixed(2);
      return '<div class="instructions"><p>You did very well in this example. \
      Had this been a real game, you would have won $' + reward + '.</p>\
      <p>In this example, you knew exactly which deck had more reward, since you \
      were told so. You were very certain, and so choosing the right deck was easy.</p> \
      <p>When playing a real game, you might not be so sure. Even so, always \
      pick the deck you believe has more cards of the rewarding color in it.\
      </p><p>Press the space bar to continue.</p></div>'
    }
  },
  {
    stimulus: '<div class="instructions">\
      <p><b>Remember</b>: On each game, you first get to sample cards, <i>in \
      preparation for the test</i>.</p><p>The number of times \
      you get to visit the tables in the learning stage is random. That means \
      that <b>at any point, the learning stage could stop, and you would be given \
      a test</b>.</p><p>You could have anything from 1 to 300 chances to sample a deck \
      during a game.\
      <p>Press the space bar to continue</p><div>',
  },
  {
    stimulus: '<div class="instructions"><p>You are now ready to start the \
      experiment. Before you do so, <i>you will answer a short quiz about the \
      instructions</i> you have just read. After making sure you understand the \
      instructions well, You\'ll play a few rounds of the color discovery game.\
      </p><p>Press the space bar to take the quiz.</p></div>'
  }
]);

var quiz_questions = jsPsych.randomization.shuffle([{
    prompt: 'How many decks of cards are there on each table in the game?',
    options: jsPsych.randomization.shuffle(['1', '2', '3', '4']),
    required: true,
    correct: '2',
    explanation: "There are two decks of cards on each table."
  },
  {
    prompt: 'How much money is each card of the correct \
    color worth in the <i>learning stage</i>?',
    options: jsPsych.randomization.shuffle(['$0', '5 cents', '25 cents',
      '$4.50'
    ]),
    required: true,
    correct: '$0',
    explanation: "You don't get bonus payment in the learning stage. Your goal is \
    to learn the color differences at each table, and so win bonus money in the test \
    stage."
  },
  {
    prompt: 'How much money will you earn for every correct choice you make on \
      the <i>test stage</i>?',
    options: jsPsych.randomization.shuffle(['$0', '5 cents', '25 cents',
      '$4.50'
    ]),
    required: true,
    correct: '25 cents',
    explanation: "For each correct choice that you make in the test stage, \
    you get an extra $0.25."
  },
  {
    prompt: 'Which tables will you visit in the test stage?',
    options: jsPsych.randomization.shuffle(['All tables in the game',
      'Any one table of my choice',
      'Two random tables', 'Any number of tables that I choose'
    ]),
    required: true,
    correct: 'All tables in the game',
    explanation: "You will be tested at each and every table in the game."
  },
  {
    prompt: 'What is your goal in the learning stage?',
    options: jsPsych.randomization.shuffle(['Flip the most rewarding cards',
      'Sample cards from the only one deck',
      'Learn the color differences between the decks on the best table',
      'Learn the color differences between the decks on the each table'
    ]),
    required: true,
    correct: 'Learn the color differences between the decks on the each table',
    explanation: "Your goal is to learn the color differences between the decks \
    on each table. Learning this will allow you to answer the test question correctly."
  },
  {
    prompt: 'How many cards will you get to sample in the learning stage \
    before being tested?',
    options: jsPsych.randomization.shuffle(['10 at each table', '40 cards overall',
      'A random number', 'As much as I want'
    ]),
    required: true,
    correct: 'A random number',
    explanation: "The length of the learning stage is random: At any moment it \
      could stop, and you will be tested on your knowledge."
  }
]);

var instructions_quiz = [{
  timeline: [{
      type: 'survey-multi-choice',
      questions: quiz_questions.slice(0, 2)
    },
    {
      type: 'survey-multi-choice',
      questions: quiz_questions.slice(2, 4)
    },
    {
      type: 'survey-multi-choice',
      questions: quiz_questions.slice(4, 6)
    }
  ],
  loop_function: function() {
    return quiz_check_function(quiz_questions, 'all')
  },
  on_finish: function() {
    // Hide Mouse
    var stylesheet = document.styleSheets[0];
    stylesheet.insertRule("* {cursor: none;}", stylesheet.cssRules.length);
  },
  on_load: function() {
    // Return mouse
    var stylesheet = document.styleSheets[0];
    stylesheet.deleteRule(stylesheet.cssRules.length - 1);
  }
}];

// Give feedback for each wrong answer
for (ii = 0; ii < quiz_questions.length; ii++) {
  instructions_quiz[0].timeline.push({
    timeline: [{
      type: 'html-keyboard-response',
      choices: [32],
      stimulus: '<div class="instructions"><p>You got this question wrong:</p> \
                <p><i>' +
        quiz_questions[ii].prompt +
        '</i></p><p>' +
        quiz_questions[ii].explanation +
        '</p><p>Press the space bar to continue.',
      category: 'quiz-feedback'
    }],
    conditional_function: eval( // This is in eval to freeze the ii indicator
      "() => quiz_check_function(quiz_questions, " + ii + ")")
  });
}

// Add repeat message
instructions_quiz[0].timeline.push({
  timeline: [{
    type: 'html-keyboard-response',
    choices: [32],
    stimulus: '<div class="instructions"><p>Press the space bar to repeat the quiz</p></div>'
  }],
  conditional_function: function() {
    return quiz_check_function(quiz_questions, 'all')
  }
});

// Game start messages
instructions_quiz = instructions_quiz.concat([{
    stimulus: '<div class="instructions"><p>You now know how to play the color \
  discovery game. You are ready to proceed and play.</p><p>Today you will \
  play five games, winning bonus money on each one.</p>\
  <p>Each game may have a different number of tables.</p>\
    </p><p>Press the space bar to continue.</p></div>',
    type: 'html-keyboard-response',
    choices: [32]
  },
  {
    stimulus: '<div class="instructions"><p>In the following games, you will have\
    <i>limited time to choose a table or a deck</i>. If you take more than 3 seconds \
    to respond, a message will be displayed, and you will miss out on the \
    opportunity to sample that card. You might feel pressured at first, but you \
    will get used to it quickly.</p><p>After each game \
    you may be asked to answer a few short questions.</p><p>You may also take a short break after \
    each game.</p><p>Press the space bar to continue.</p></div>',
    type: 'html-keyboard-response',
    choices: [32]
  },
  {
    stimulus: '<div class="instructions"><p>You will now start the first game.</p>\
    <p>Press the space bar to being.</p></div>',
    type: 'html-keyboard-response',
    choices: [32]
  }
]);

var reminder_instructions = insert_fsprompt([{
    stimulus: '<div class="instructions"><p>Welcome back!</p>\
    <p>Today you will be playing the same card color discovery game from last \
    time. The rules are exactly the same.</p><p>You will be playing six \
    rounds of the game. You can take a short break between the rounds</p>\
    <p>Press the space bar to continue.</p></div>'
  },
  {
    stimulus: '<div class="instructions">\
    <p>Remember: Each game has a learning stage, and a test stage.</p>\
    <p>In the learning stage, you get to sample a card from one deck at a time,\
    by choosing a table and then a deck.</p>\
    <p>On each table one deck has more cards of one color, while the other has \
    more cards of the other color.</p>\
    <p>Your goal is to remember the color differences between the decks on each \
    of the tables.</p>\
    <p>Press the space bar to continue.</p></div>'
  },
  {
    stimulus: '<div class="instructions"><p>At any given moment, the learning \
    stage might end, and you will move on to the test stage.</p>\
    <p>In the test, you will visit the four tables, and will have to choose the \
    deck with more cards of the rewarding color in it.</p>\
    <p>Every correct choice you make will add 25 cents to your bonus payment, \
    meaning you can make an extra $6 today.</p>\
    <p>Press the space bar to continue.</p></div>'
  },
  {
    stimulus: '<div class="instructions"><p>Before you start the first game, \
    you will answer a short quiz about the instructions, to make sure you remember \
    how to play the game.</p><p> It is important that you understand the instructions \
    well so that you have a chance of winning maximum bonus payment.</p>\
    <p>Press the space bar to continue.</p></div>'
  }
]);

var reminder_quiz_questions = jsPsych.randomization.shuffle([{
    prompt: 'How much money is each card of the correct \
    color worth in the <i>learning stage</i>?',
    options: jsPsych.randomization.shuffle(['$0', '5 cents', '25 cents',
      '$6'
    ]),
    required: true,
    correct: '$0',
    explanation: "You don't get bonus payment in the learning stage. Your goal is \
    to learn the color differences at each table, and so win bonus money in the test \
    stage."
  },
  {
    prompt: 'How much money will you earn for every correct choice you make on \
      the <i>test stage</i>?',
    options: jsPsych.randomization.shuffle(['$0', '5 cents', '25 cents',
      '$6'
    ]),
    required: true,
    correct: '25 cents',
    explanation: "For each correct choice that you make in the test stage, \
    you get an extra $0.25."
  },
  {
    prompt: 'Which tables will you visit in the test stage?',
    options: jsPsych.randomization.shuffle(['All tables in the game',
      'Any one table of my choice',
      'Two random tables', 'Any number of tables that I choose'
    ]),
    required: true,
    correct: 'All tables in the game',
    explanation: "You will be tested at each and every table in the game."
  },
  {
    prompt: 'What is your goal in the learning stage?',
    options: jsPsych.randomization.shuffle(['Flip the most rewarding cards',
      'Sample cards from the only one deck',
      'Learn the color differences between the decks on the best table',
      'Learn the color differences between the decks on the each table'
    ]),
    required: true,
    correct: 'Learn the color differences between the decks on the each table',
    explanation: "Your goal is to learn the color differences between the decks \
    on each table. Learning this will allow you to answer the test question correctly."
  },
  {
    prompt: 'How many cards will you get to sample in the learning stage \
    before being tested?',
    options: jsPsych.randomization.shuffle(['10 at each table', '40 cards overall',
      'A random number', 'As much as I want'
    ]),
    required: true,
    correct: 'A random number',
    explanation: "The length of the learning stage is random: At any moment it \
      could stop, and you will be tested on your knowledge."
  },
  {
    prompt: 'In a game with blue and yellow cards, which of the following is \
      <b>not</b> possible?',
    options: [
      'One deck has mostly blue cards, while the other has mostly yellow cards',
      'Both decks have mostly blue cards, but deck 1 has more blue cards than deck 2',
      'Both decks have mostly yellow cards, but deck 1 has more yellow cards than deck 2',
      'All of these options are possible'
    ],
    required: true,
    correct: 'All of these options are possible',
    explanation: "Each deck could have mostly blue or mostly yellow cards. Both \
      decks could have mostly card of the same color. But there will always be a \
      deck with more blue cards, and a deck with more yellow cards"
  }
]);

var reminder_quiz = [{
  timeline: [{
      type: 'survey-multi-choice',
      questions: reminder_quiz_questions.slice(0, 2)
    },
    {
      type: 'survey-multi-choice',
      questions: reminder_quiz_questions.slice(2, 4)
    },
    {
      type: 'survey-multi-choice',
      questions: reminder_quiz_questions.slice(4, 6)
    }
  ],
  loop_function: function() {
    return quiz_check_function(reminder_quiz_questions, 'all')
  },
  on_finish: function() {
    // Hide Mouse
    var stylesheet = document.styleSheets[0];
    stylesheet.insertRule("* {cursor: none;}", stylesheet.cssRules.length);
  },
  on_load: function() {
    // Return mouse
    var stylesheet = document.styleSheets[0];
    stylesheet.deleteRule(stylesheet.cssRules.length - 1);
  }
}];

// Give feedback for each wrong answer
for (ii = 0; ii < reminder_quiz_questions.length; ii++) {
  reminder_quiz[0].timeline.push({
    timeline: [{
      type: 'html-keyboard-response',
      choices: [32],
      stimulus: '<div class="instructions"><p>You got this question wrong:</p> \
              <p><i>' +
        reminder_quiz_questions[ii].prompt +
        '</i></p><p>' +
        reminder_quiz_questions[ii].explanation +
        '</p><p>Press the space bar to continue.',
      category: 'quiz-feedback'
    }],
    conditional_function: eval( // This is in eval to freeze the ii indicator
      "() => quiz_check_function(reminder_quiz_questions, " + ii + ")")
  });
}

// Add repeat message
reminder_quiz[0].timeline.push({
  timeline: [{
    type: 'html-keyboard-response',
    choices: [32],
    stimulus: '<div class="instructions"><p>Press the space bar to repeat the quiz</p></div>'
  }],
  conditional_function: function() {
    return quiz_check_function(reminder_quiz_questions, 'all')
  }
});

// Game start message
reminder_quiz.push({
  stimulus: '<div class="instructions"><p>You are now ready to start playing.</p>\
    </p><p>Press the space bar to begin.</p></div>',
  type: 'html-keyboard-response',
  choices: [32]
});
