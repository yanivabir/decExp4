# Code to run the color card discovery task
For details of this task see Abir, Y. Shadlen, M. N. & Shohamy, D. (Under review). Human Exploration Strategically Balances Approaching and Avoiding Uncertainty.

This task is coded in jsPsych. A running web server is needed to be able to view the task in a browser.

## File description
```
.
├── templates/
│   ├── indexN.html - landing page for session N
│   ├── consent.html - consent form
│   ├── expN.html - task page for session N
│   └── write_data.php - writes csv file with data to server data folder
├── static/
│   ├── css/
│   │   └── jspsyhc.css - this contains custom css for this task
│   ├── images - all images
│   └── js - javascript files/
│       ├── gsap - animation library
│       ├── jspsych - jspysch library
│       ├── instructions.js - task instructions
│       ├── taskN.js - main js file for session N
│       ├── aux_functions.js - tasks variables shared across sessions
│       └── lib - javscript libraries
├── Make_session_whitelist.jl - Julia script to perform exclusions, make list of participants to invite
└── README.md - this file
```
