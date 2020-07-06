
// The way we're building this isn't exactly what is defined on jspsych.org. They advise to use timeline_variables for
// easy randomization and sampling, but since we need to do a bunch of different *types* of experiments in addition to a
// different trials, it's easier to build these helper functions and then define our own sampling structure.
// In addition this allows this code to be more easily re-usable down the line.

async function getData(url) {
    const response = await fetch(url);

    return response.json()
}

function range(start, end) {
    if(start === end) return [start];
    return [start, ...range(start + 1, end)];
}

let memorize_command = {type: 'html-keyboard-response',
    stimulus: 'Memorize the items.',
    prompt:'Press any key to continue...'};

let ALL_NUMBERS_PLUS_BACKSPACE_AND_ENTER =
    [8, 13, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105]

let ALL_KEYS_BUT_ENTER = range(0, 222).filter(function(value, index, arr){return value !== 13})

function imgLocStim(name){
    return '<img src="./img/' + name + '.jpg">'
}

function imgLocChoice(name){
    return '<img src="./img/' + name + '.jpg" style="vertical-align: middle" height="200px">'
}
// most of the work is being done plugin-side, since a lot of it is abstracted away to the question set. So this is just
// a shortcut function for our particular brand of distractor questions.

async function EMDistractors(){
    let distractors = await getData('questions/json/distractors.json')
    let d_questions = [];
    let d_answers = [];
    for(let i in distractors){
        d_answers.push(distractors[i][1]);
        d_questions.push(distractors[i][0]);
    }
    let timeline = [];
    timeline.push({type: 'html-keyboard-response',
    stimulus: 'True/False Math Problems',
    trial_duration: 3000,
    choices: jsPsych.NO_KEYS});
    timeline.push({type: 'html-buttons-for-duration',
        question_set: d_questions,
        answer_set: d_answers,
        duration: 12000,
        choices: ['True', 'False'],
        randomize_order: true
    });
    return {timeline: timeline};
}

async function EMWordStim(stims, choices, data){
    let task = {};
    let answer = stims.filter(x => choices.includes(x));
    let timeline = [];
    timeline.push(memorize_command)
    for (const i in stims){
        timeline.push({type: 'html-keyboard-response', stimulus: stims[i],
            choices: jsPsych.NO_KEYS, trial_duration: 1000})
    }
    timeline.push(await EMDistractors())
    for (let i in choices) {
        timeline.push({
             type: 'html-button-response',
            stimulus: "Which did you see?",
            choices: choices[i]
        });
    }
    data['trial_type'] = 'Episodic Memory Word Stimuli';
    data['answer'] = answer[0];
    task['timeline'] = timeline;
    task['data'] = data;
    return task;
}

async function EMObjectPicture(stims, choices, data){
    let task = {};
    let answer = stims.filter(x => choices.includes(x));
    let timeline = [];
    timeline.push(memorize_command)
    for (const i in stims){
        timeline.push({type: 'html-keyboard-response', stimulus: imgLocStim(stims[i]),
            choices: jsPsych.NO_KEYS, trial_duration: 1000})
    }

    timeline.push(await EMDistractors())

    for (let i in choices) {
        let promptLines = [];
        for (const j in choices[i]) {
            promptLines.push(imgLocChoice(choices[i][j]))
        }
        timeline.push({
            type: 'html-button-response',
            stimulus: "Which did you see?",
            choices: promptLines
        });
    }
    data['answer'] = answer[0];
    data['trial_type'] = 'Episodic Memory Image Stimuli';
    task['timeline'] = timeline;
    task['data'] = data;
    return task;
}

let colorChart = {R: '#F93943',
        G: '#33673B',
        B: '#445E93',
        O: '#FE9920',
        Y: '#FE9920',
        P: '#662C91',
        W: '#F4F1DE',
        K: '#000000'}

let wordChart = {R: 'red',
    G: 'green',
    B: 'blue',
    Y: 'yellow',
    P: 'purple',
    K: 'black'}

function drawRuleID(stimuli, scale) {
    // Draws on the canvas.
    let canvas = document.getElementById('ruleID');
    let step = 1000 / (stimuli.length + 1);
    let objectCenters =   Array(Math.ceil(1000.0 / step)).fill(0).map((x, y) => x + y * step);
    objectCenters.shift();


    for(const i in stimuli){
        let ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.font = '32px Open Sans';
        ctx.textBaseline= 'middle';
        ctx.textAlign = 'center';

        let shapeCode = stimuli[i][0];
        let colorCode = stimuli[i][1];
        let number = stimuli[i][2];
        if(shapeCode === 'D'){
            ctx.fillStyle = colorChart[colorCode]
            ctx.moveTo(objectCenters[i]-scale, 75)
            ctx.lineTo(objectCenters[i], 75 + scale*Math.SQRT2)
            ctx.lineTo(objectCenters[i]+scale, 75)
            ctx.lineTo(objectCenters[i], 75 - scale*Math.SQRT2)
            ctx.closePath()
            ctx.fill()

            ctx.fillStyle = colorChart.W
            ctx.fillText(number, objectCenters[i], 75)

            }

        if(shapeCode === 'S'){
            ctx.fillStyle = colorChart[colorCode]
            ctx.fillRect(objectCenters[i]-scale, 75-scale, 2*scale, 2*scale)

            ctx.fillStyle = colorChart.W
            ctx.fillText(number, objectCenters[i], 75)
        }

        if(shapeCode === 'T'){
            ctx.fillStyle = colorChart[colorCode]
            ctx.moveTo(objectCenters[i], 75 - scale*Math.SQRT2*Math.sqrt(3)*0.5)
            ctx.lineTo(objectCenters[i]-scale*Math.SQRT2,
                75+scale*0.5*Math.SQRT2*Math.sqrt(3))
            ctx.lineTo(objectCenters[i]+scale*Math.SQRT2,
                75+scale*0.5*Math.SQRT2*Math.sqrt(3))
            ctx.closePath()
            ctx.fill()

            ctx.fillStyle = colorChart.W
            ctx.fillText(number, objectCenters[i], 75)
        }

        if(shapeCode === 'C'){
            ctx.fillStyle = colorChart[colorCode]
            ctx.moveTo(objectCenters[i], 75 - scale)
            ctx.arc(objectCenters[i], 75, scale*Math.sqrt(2), 0, Math.PI * 2, true)
            ctx.fill()

            ctx.fillStyle = colorChart.W
            ctx.fillText(number, objectCenters[i], 75)
        }

        if(shapeCode === 'H'){
            ctx.fillStyle = colorChart[colorCode]
            ctx.moveTo(objectCenters[i] + scale*Math.SQRT2, 75)
            ctx.lineTo(objectCenters[i] + 0.5*scale*Math.SQRT2, 75 + 0.5*Math.SQRT2*scale*Math.sqrt(3))
            ctx.lineTo(objectCenters[i] - 0.5*scale*Math.SQRT2, 75 + 0.5*Math.SQRT2*scale*Math.sqrt(3))
            ctx.lineTo(objectCenters[i] - scale*Math.SQRT2, 75)
            ctx.lineTo(objectCenters[i] - 0.5*scale*Math.SQRT2, 75 - 0.5*Math.SQRT2*scale*Math.sqrt(3))
            ctx.lineTo(objectCenters[i] + 0.5*scale*Math.SQRT2, 75 - 0.5*Math.SQRT2*scale*Math.sqrt(3))
            ctx.fill()

            ctx.fillStyle = colorChart.W
            ctx.fillText(number, objectCenters[i], 75)
        }

        }
    }

function countUnique(array){
    return new Set(array).size;
}

function argMin(array) {
    return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] < r[0] ? a : r))[1];
}

function EFRuleID(stimuli, data){
    let task = {};
    let shapes = [];
    let colors = [];
    let numbers = [];
    for(const i in stimuli){
        shapes.push(stimuli[i][0])
        colors.push(stimuli[i][1])
        numbers.push(stimuli[i][2])
    }
    let uniques = [shapes, colors, numbers].map(countUnique)
    let answerIndex = argMin(uniques)


    let timeline = [];
    timeline.push({type: 'html-keyboard-response',
        stimulus: 'Which is the most frequent feature: Shape, Color, or Number?',
        prompt:'Press any key to continue...'});
        for(let i in stimuli){
            function draw(){
                drawRuleID(stimuli[i], 50);
            }

            timeline.push({type: 'canvas-button-response',
                func: draw,
                canvas_id: 'ruleID',
                stimulus: 'Which is the most frequent feature?',
                choices: ['Shape', 'Color', 'Number']
                })}

    data['answer'] = ['Shape', 'Color', 'Number'][answerIndex]
    data['trial_type'] = 'Executive Function Rule Identification';
    task['timeline'] = timeline;
    task['data'] = data;
    return task;
}

function SMObjectNaming(choices, stimuli, data){
    // Just so it's written down somewhere: I resized all the images to around 500x500. This is to make rendering and
    // loading easier. (Aspect ratio was maintained as much as possible)

    let task = {};
    let timeline = [];
    timeline.push({type: 'html-keyboard-response',
        stimulus: "Choose the name for each object.",
        prompt: "Press any key to continue...."})

    for(let i in stimuli) {
        timeline.push({
            type: 'image-button-response',
            stimulus: './img/' + stimuli[i] + '.jpg',
            choices: choices[i],
            text_answer: stimuli[i]
        })
    }
    data['trial_type'] = 'Semantic Memory Object Naming';
    task['timeline'] = timeline;
    task['data'] = data;
    return task;


}

function WMForwardDigitSpan(stimuli, delay, data){
    let repeats;
    let task = {};
    let timeline = [];
    timeline.push({type: 'html-keyboard-response',
    stimulus:'Rehearse the numbers for forward recall (first to last)',
    prompt: 'Press any key to continue...'});
    console.log(ALL_KEYS_BUT_ENTER)
    for (let j in stimuli) {
        let numbers = stimuli[j].toString()
        for (const i in numbers) {
            timeline.push({
                type: 'html-keyboard-response', stimulus: '<p style="font-size: 100px">' + numbers[i] + '</p>',
                choices: jsPsych.NO_KEYS, trial_duration: 1000
            })
        }
        timeline.push({
            type: 'html-keyboard-response',
            stimulus: 'Rehearse the numbers in forward order.',
            choices: jsPsych.NO_KEYS, trial_duration: 1000 * delay
        });

        timeline.push({
            type: 'string-entry',
            prompt: '<p>Type the numbers in forward order (first to last), press enter/return to send.</p>',
            answer: stimuli[j].toString(),
            choices: ALL_NUMBERS_PLUS_BACKSPACE_AND_ENTER,
            entry_size: 100
        });

        timeline.push({
            type: 'html-keyboard-response',
            stimulus: 'Press any key (except return/enter) to continue',
            choices: ALL_KEYS_BUT_ENTER
        })


        if (countUnique(numbers) === numbers.length) {
            // noinspection JSDuplicatedDeclaration
            repeats = ' no repeats';
        } else {
            // noinspection JSDuplicatedDeclaration
            repeats = ' repeats';
        }
        var numlen = numbers.length
    }

    data['stims_type'] = numlen + ' digits' + repeats;
    data['trial_type'] = 'Working Memory Forward Span';
    task['timeline'] = timeline;
    task['data'] = data;
    return task;

}

function WMBackwardDigitSpan(stimuli, delay, data){
    let repeats;
    let task = {};
    let timeline = [];
    timeline.push({type: 'html-keyboard-response',
        stimulus:'Rehearse the numbers for backward recall (last to first)',
        prompt: 'Press any key to continue...'});
    for(let j in stimuli){
        let numbers = stimuli[j].toString();
        let splitNumbers = numbers.split("");
        let reverseArray = splitNumbers.reverse();
        let reverseNumbers = reverseArray.join("")

        for(const i in reverseNumbers){
            timeline.push({type: 'html-keyboard-response', stimulus: '<p style="font-size: 100px">' + reverseNumbers[i] + '</p>',
                choices: jsPsych.NO_KEYS, trial_duration: 1000})
        }
        timeline.push({type: 'html-keyboard-response',
            stimulus: 'Rehearse the numbers in backward order.',
            choices: jsPsych.NO_KEYS, trial_duration: 1000*delay});

        timeline.push({type: 'string-entry',
            prompt:'<p>Type the numbers in backward order (first to last), press enter/return to send.</p>',
            answer: stimuli[j].toString(),
            choices: ALL_NUMBERS_PLUS_BACKSPACE_AND_ENTER,
            entry_size: 100});


        if(countUnique(numbers) === numbers.length){
            // noinspection JSDuplicatedDeclaration
            repeats = ' no repeats';
        } else {
            // noinspection JSDuplicatedDeclaration
            repeats = ' repeats';
        }
        var numlen = numbers.length
    }

    data['stims_type'] = numlen + ' digits' + repeats;
    data['trial_type'] = 'Working Memory Backward Span';
    task['timeline'] = timeline;
    task['data'] = data;
    return task;
}

function EFStroop(stimuli, duration, data){
    let task = {};
    let timeline = [];
    timeline.push({type: 'html-keyboard-response',
        stimulus: '<p>Count the number of words with matching ink. For example, here <b>2</b> words match.</p>' +
            '<p style="color: '+ colorChart.G+'"> green </p>' + '<p style="color: '+ colorChart.R+'"> purple </p>' +
            '<p style="color: '+ colorChart.K+'"> black </p>',
        prompt: 'Press any key to continue...'
    })

    for(let j in stimuli){
        timeline.push({type: 'html-keyboard-response',
            stimulus: '<p>Count the number of words with matching ink. For example, here <b>2</b> words match.</p>' +
                '<p style="color: '+ colorChart.G+'"> green </p>' + '<p style="color: '+ colorChart.R+'"> purple </p>' +
                '<p style="color: '+ colorChart.K+'"> black </p>',
            prompt: 'Press any key to continue...'
        })

        let possibleKeys = Array(stimuli[j].length + 1).fill(48).map((x, y) => x + y);

        let correctAnswer = 0
        let stimLines = [];
        for (const i in stimuli[j]) {
            if (stimuli[j][i][0] === stimuli[j][i][1]) {
                correctAnswer += 1;
            }
            stimLines.push('<p style="color: ' + colorChart[stimuli[j][i][1]] + '">' + wordChart[stimuli[j][i][0]] + '</p>')
        }
        timeline.push({
            type: 'html-keyboard-response',
            stimulus: stimLines.join(''),
            choices: jsPsych.NO_KEYS,
            trial_duration: 1000 * duration
        })

        let choices = Array(stimuli[j].length + 1).fill(0).map((x, y) => x + y);
        let choicePrompt = '<div class="container object">'
        for (const i in choices) {
            choicePrompt += '<div>' + i + '</div>'
        }
        choicePrompt += '</div>'

        timeline.push({
            type: 'categorize-html',
            stimulus: 'How many words had matching color?',
            prompt: choicePrompt,
            choices: possibleKeys,
            key_answer: possibleKeys[correctAnswer],
            correct_text: "",
            incorrect_text: "",
            feedback_duration: 0,
            show_stim_with_feedback: false
        })

    }

    data['trial_type'] = 'Executive Function Stroop Task';
    task['timeline'] = timeline;
    task['data'] = data;
    return task;
}

function PSStringComparison(stimuli, limit, data){
    let task = {};
    let timeline = [];
    timeline.push({type: 'html-keyboard-response',
    stimulus: 'As fast as you can, determine if the two items shown on the screen are the SAME or DIFFERENT',
    prompt: '<p>If they are the SAME press "Q", if they are DIFFERENT press "P"</p>' +
        '<p>Press any Key to Continue...</p>'})

    timeline.push({type: 'html-keyboard-response',
    stimulus: 'Get Ready!',
    prompt: '<div class="container reminders"> <div>Same - Q</div><div>Different - P</div></div>'})

    let stimuli_1 = []
    let stimuli_2 = []
    for(let i in stimuli){
        let stimsplit = stimuli[i].split('-')
        stimuli_1.push(stimsplit[0])
        stimuli_2.push(stimsplit[1])
    }
    timeline.push({type: 'timed-html-comparison',
    stimuli_1: stimuli_1,
    stimuli_2: stimuli_2,
    choices: [80, 81],
    time_limit: limit,
    prompt: '<div class="container bottom"> <div>Same - Q</div><div>&nbsp;</div><div>Different - P</div></div>'})

    data['trial_type'] = 'Processing Speed String Comparison';
    task['timeline'] = timeline;
    task['data'] = data;
    return task;
}

