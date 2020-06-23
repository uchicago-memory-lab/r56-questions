
// The way we're building this isn't exactly what is defined on jspsych.org. They advise to use timeline_variables for
// easy randomization and sampling, but since we need to do a bunch of different *types* of experiments in addition to a
// different trials, it's easier to build these helper functions and then define our own sampling structure.
// In addition this allows this code to be more easily re-usable down the line.
let memorize_command = {type: 'html-keyboard-response',
    stimulus: 'Memorize the items.',
    prompt:'Press any key to continue...'};

function imgLocStim(name){
    return '<img src="./img/' + name + '.jpg">'
}

function imgLocChoice(name){
    return '<img src="./img/' + name + '.jpg" style="vertical-align: middle" height="150px">'
}

function EMWordStim(stims, choices, data){
    let task = {};
    let answer = stims.filter(x => choices.includes(x));
    let timeline = [];
    timeline.push(memorize_command)
    for (const i in stims){
        timeline.push({type: 'html-keyboard-response', stimulus: stims[i],
            choices: jsPsych.NO_KEYS, trial_duration: 1000})
    }
    // 49 - 57 are the key codes for 1-9, 0 is 48
    let possibleKeys = Array(choices.length).fill(49).map((x, y) => x + y);
    let promptLines = [];
    for (const i in choices){
        promptLines.push("<p>" + (parseInt(i) + 1) + " - " + choices[i] + "</p>")
    }
    let promptHTML = promptLines.join('')
    timeline.push({type: 'categorize-html',
        stimulus: "Which did you see?",
        prompt: promptHTML,
        // TODO: Uncomment these to turn off feedback before deployment.
        // correct_text: "",
        // incorrect_text: "",
        choices: possibleKeys,
        key_answer: possibleKeys[choices.findIndex(element => element === answer[0])]});
    data['trial_type'] = 'Episodic Memory Word Stimuli'
    task['timeline'] = timeline;
    task['data'] = data;
    return task;
}

function EMObjectPicture(stims, choices, data){
    let task = {};
    let answer = stims.filter(x => choices.includes(x));
    let timeline = [];
    timeline.push(memorize_command)
    for (const i in stims){
        timeline.push({type: 'html-keyboard-response', stimulus: imgLocStim(stims[i]),
            choices: jsPsych.NO_KEYS, trial_duration: 1000})
    }
    // 49 - 57 are the key codes for 1-9, 0 is 48
    let possibleKeys = Array(choices.length).fill(49).map((x, y) => x + y);
    let promptLines = [];
    for (const i in choices){
        promptLines.push("<p>" + (parseInt(i) + 1) + " - " + imgLocChoice(choices[i]) + "</p>")
    }
    let prompt_html = promptLines.join('')
    timeline.push({type: 'categorize-html',
        stimulus: "Which did you see?",
        prompt: prompt_html,
        // TODO: Uncomment these to turn off feedback before deployment.
        // correct_text: "",
        // incorrect_text: "",
        choices: possibleKeys,
        key_answer: possibleKeys[choices.findIndex(element => element === answer[0])]});
    data['trial_type'] = 'Episodic Memory Image Stimuli';
    task['timeline'] = timeline;
    task['data'] = data;
    return task;
}

let ruleIDColorChart = {R: '#F93943',
                        G: '#33673B',
                        B: '#445E93',
                        O: '#E9C46A',
                        P: '#501537'}

function EFRuleID(stimuli, data){
    let task = {};
    // TODO: Programmatically find the answer
    let timeline = [];
    timeline.push({type: 'html-keyboard-response',
        stimulus: 'What is the most frequent feature: Shape, Color, or Number?',
        prompt:'Press any key to continue...'});

    timeline.push({type: 'html-keyboard-response',
        stimulus: '<canvas></canvas>'
    })


    data['trial_type'] = 'Executive Function Rule Identification';
    task['timeline'] = timeline;
    task['data'] = data;
    return task;
}