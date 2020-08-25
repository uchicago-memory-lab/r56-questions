
// The way we're building this isn't exactly what is defined on jspsych.org. They advise to use timeline_variables for
// easy randomization and sampling, but since we need to do a bunch of different *types* of experiments in addition to a
// different trials, it's easier to build these helper functions and then define our own sampling structure.
// In addition this allows this code to be more easily re-usable down the line.

async function getData(url) {
    const response = await fetch(url);

    return response.json()
}

let IMPORTANT_COLUMNS = ['item', 'response', 'rt']

let NUM_CODES = {'96': 0,
'97': 1,
'98': 2,
'99': 3,
'100': 4,
'101': 5,
'102': 6,
'103': 7,
'104': 8,
'105': 9,
'48': 0,
'49': 1,
'50': 2,
'51': 3,
'52': 4,
'53': 5,
'54': 6,
'55': 7,
'56': 8,
'57': 9}

let stroopCodes = {
    'K': 'Black',
    'G': 'Green',
    'P': 'Purple',
    'R': 'Red',
    'Y': 'Yellow'
}

var LAST_UPLOAD = 0

// TODO: Do some magic on the item tags so that they're like IitemnumTtrialnum

let storeDataTag = {stored: true}

function saveData() {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'write_data.php');
    xhr.setRequestHeader('Content-Type', 'application/json');
    data = JSON.parse(jsPsych.data.get().filterCustom(testItemFinder).json())
    try{LAST_UPLOAD = data[data.length - 1].trial_index;}
    catch{LAST_UPLOAD = 0}

    for(let i in data){
        if(!data[i].response){
            if (data[i].key_press){
                data[i].response = data[i].key[data[i].key_press]
                if (data[i].key_press instanceof Array){
                    data[i].response = []
                    answer = []
                    for(let j in data[i].key_press){
                        data[i].response.push(data[i].key[data[i].key_press[j]])
                        answer.push(data[i].key[data[i].answer[j]])
                    }
                    data[i].answer = answer
                }else {data[i].answer = data[i].key[data[i].answer]}
            }else if (data[i].button_pressed) {
                data[i].response = data[i].key[parseInt(data[i].button_pressed)]
        }}
    }
    console.log(data)

    xhr.send(JSON.stringify(data));
}

function testItemFinder(jsPsychData){
    /** Input should be in the form of jsPsych.data.get(), so this works with .filterCustom() */
    if ('stored' in jsPsychData){
        return jsPsychData.stored && jsPsychData.trial_index > LAST_UPLOAD
    }
    return false
}

function dumpData(){
    console.log(jsPsych.data.get().filterCustom(testItemFinder).json())
}

function range(start, end) {
    if(start === end) return [start];
    return [start, ...range(start + 1, end)];
}

let memorize_command = {type: 'html-keyboard-response',
    stimulus: 'Memorize the items.',
    prompt:'<p style="font-size:32px">Press any key to continue...<p>'};

let ALL_NUMBERS_PLUS_BACKSPACE_AND_ENTER =
    [8, 13, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105]

let ALL_KEYS_BUT_ENTER = range(0, 222).filter(function(value){return value !== 13})

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

async function EMWordStim(stimuli, choices, data){
    let task = {};
    let timeline = [];
    timeline.push(memorize_command)
    for (const i in stimuli){
        timeline.push({type: 'html-keyboard-response', stimulus: stimuli[i],
            choices: jsPsych.NO_KEYS, trial_duration: 1000})
        timeline.push({type: 'html-keyboard-response', stimulus: '<p></p>',
            choices: jsPsych.NO_KEYS, trial_duration: 1000});
    }
    timeline.push(await EMDistractors())
    for (let i in choices) {
        data['item_type'] = 'EMWordStim';
        let answer = stimuli.filter(x => choices[i].includes(x));
        data['answer'] = answer[0];
        let rechoice = fisherYates(choices[i]);
        data['key'] = rechoice;
        timeline.push({
            type: 'html-button-response',
            stimulus: "Which did you memorize before?",
            choices: rechoice,
            data: {...storeDataTag, ...data}
        });
    }

    timeline.push({
        type: 'call-function',
        func: saveData
    })
    task['timeline'] = timeline;
    task['data'] = data;
    return task;
}

async function EMObjectPicture(stimuli, choices, data){
    let task = {};
    let timeline = [];
    timeline.push(memorize_command)
    for (const i in stimuli){
        timeline.push({type: 'html-keyboard-response', stimulus: imgLocStim(stimuli[i]),
            choices: jsPsych.NO_KEYS, trial_duration: 1000})
        timeline.push({type: 'html-keyboard-response', stimulus: '<p></p>',
            choices: jsPsych.NO_KEYS, trial_duration: 1000});
    }

    timeline.push(await EMDistractors())

    for (let i in choices) {
        let promptLines = [];
        let rechoice = fisherYates(choices[i])
        let answer = stimuli.filter(x => choices[i].includes(x));

        for (const j in rechoice) {
            promptLines.push(imgLocChoice(rechoice[j]))
        }
        data['answer'] = answer[0];
        data['item_type'] = 'Episodic Memory Image Stimuli';
        data['key'] = rechoice;
        timeline.push({
            type: 'html-button-response',
            stimulus: "Which did you see?",
            choices: promptLines,
            data: {...storeDataTag, ...data}
        });
    }
    timeline.push({
        type: 'call-function',
        func: saveData
    })
    task['timeline'] = timeline;
    task['data'] = data;
    return task;
}
let colorChart = {R: '#F94D56',
        G: '#3D7B46',
        B: '#1495CC',
        O: '#E05200',
        Y: '#FDE74C',
        P: '#662C91',
        W: '#F4F1DE',
        K: '#000000'}

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

    let timeline = [];
    timeline.push({type: 'html-keyboard-response',
        stimulus: '<p>Which is the most frequent feature:</p><p>Shape, Color, or Number?</p>',
        prompt:'<p style="font-size:32px">Press any key to continue...<p>'});
        for(let i in stimuli){
            for(let j in stimuli[i]){
                shapes.push(stimuli[i][j][0])
                colors.push(stimuli[i][j][1])
                numbers.push(stimuli[i][j][2])}
            let uniques = [shapes, colors, numbers].map(countUnique)
            let answerIndex = argMin(uniques)
            data['answer'] = answerIndex
            data['item_type'] = 'EFRuleID';
            data['key'] = ['shape', 'color', 'number']

            function draw(){
                drawRuleID(stimuli[i], 50);
            }

            timeline.push({type: 'canvas-button-response',
                func: draw,
                canvas_id: 'ruleID',
                stimulus: 'Which is the most frequent feature?',
                choices: ['Shape', 'Color', 'Number'],
                data: {...storeDataTag, ...data}
                })

            timeline.push({type: 'html-keyboard-response', stimulus: '<p></p>',
                choices: jsPsych.NO_KEYS, trial_duration: 250});

        }
        timeline.pop() // gets rid of the break on the last one, we don't need it before the next trial.


    timeline.push({
        type: 'call-function',
        func: saveData
    })
    task['timeline'] = timeline;
    task['data'] = data;
    return task;
}

function SMObjectNaming(stimuli, choices, data){
    // Just so it's written down somewhere: I resized all the images to around 500x500. This is to make rendering and
    // loading easier. (Aspect ratio was maintained as much as possible)

    let task = {};
    let timeline = [];
    timeline.push({type: 'html-keyboard-response',
        stimulus: "Click the name for each object.",
        prompt: "<p style='font-size:32px'>Press any key to continue...<p>"})
    let stimshuf = fisherYates(stimuli)
    for(let i in stimshuf) {
        let answer = stimshuf[i]
        data['answer'] = answer
        data['key'] = choices[i]
        timeline.push({
            type: 'image-button-response',
            stimulus: './img/' + stimshuf[i] + '.jpg',
            choices: choices[i],
            data: {...storeDataTag, ...data}
        })
    }
    data['item_type'] = 'SMObjectNaming';
    timeline.push({
        type: 'call-function',
        func: saveData
    })
    task['timeline'] = timeline;
    task['data'] = data;
    return task;


}

function WMForwardDigitSpan(stimuli, delay, data){
    let repeats;
    let task = {};
    let timeline = [];
    timeline.push({type: 'html-keyboard-response',
    stimulus:'Rehearse the numbers in forward order. (first to last)',
    prompt: '<p style="font-size:32px">Press any key to continue...<p>'});
    for (let j in stimuli) {

        let numbers = stimuli[j].toString()
        if (countUnique(numbers) === numbers.length) {
            // noinspection JSDuplicatedDeclaration
            repeats = ' no repeats';
        } else {
            // noinspection JSDuplicatedDeclaration
            repeats = ' repeats';
        }
        var numlen = numbers.length
        

        data['stims_type'] = numlen + ' digits' + repeats;
        data['item_type'] = 'WMForwardDigitSpan';
        data['answer'] = stimuli[j];

        for (const i in numbers) {
            timeline.push({
                type: 'html-keyboard-response', stimulus: '<p style="font-size: 100px">' + numbers[i] + '</p>',
                choices: jsPsych.NO_KEYS, trial_duration: 1000
            });
            timeline.push({type: 'html-keyboard-response', stimulus: '<p></p>',
                choices: jsPsych.NO_KEYS, trial_duration: 1000});
        }
        timeline.push({
            type: 'html-keyboard-response',
            stimulus: '+',
            choices: jsPsych.NO_KEYS, trial_duration: delay
        });
        
        timeline.push({
            type: 'string-entry',
            prompt: '<p>Type the numbers in forward order (first to last), press enter/return to send.</p>',
            answer: stimuli[j].toString(),
            choices: ALL_NUMBERS_PLUS_BACKSPACE_AND_ENTER,
            entry_size: 100,
            data: {...storeDataTag, ...data}
        });

        timeline.push({
            type: 'html-keyboard-response',
            stimulus: 'Press space to continue...',
            choices: ALL_KEYS_BUT_ENTER
        })


    }
    timeline.push({
        type: 'call-function',
        func: saveData
    })
    task['timeline'] = timeline;
    task['data'] = data;
    return task;

}

function WMBackwardDigitSpan(stimuli, delay, data){
    let repeats;
    let task = {};
    let timeline = [];
    timeline.push({type: 'html-keyboard-response',
        stimulus:'Rehearse the numbers in reverse order. (last to first)',
        prompt: '<p style="font-size:32px">Press any key to continue...<p>'});
    for(let j in stimuli){
        let numbers = stimuli[j].toString();
        let splitNumbers = numbers.split("");
        let reverseArray = splitNumbers.reverse();
        let reverseNumbers = reverseArray.join("")
        
        if(countUnique(numbers) === numbers.length){
            // noinspection JSDuplicatedDeclaration
            repeats = ' no repeats';
        } else {
            // noinspection JSDuplicatedDeclaration
            repeats = ' repeats';
        }
        var numlen = numbers.length

        data['stims_type'] = numlen + ' digits' + repeats;
        data['item_type'] = 'WMBackwardDigitSpan';
        data['answer'] = stimuli[j]
        task['timeline'] = timeline;

        for(const i in reverseNumbers){
            timeline.push({type: 'html-keyboard-response', stimulus: '<p style="font-size: 100px">' + reverseNumbers[i] + '</p>',
                choices: jsPsych.NO_KEYS, trial_duration: 1000})
            timeline.push({type: 'html-keyboard-response', stimulus: '<p></p>',
                choices: jsPsych.NO_KEYS, trial_duration: 1000})
        }
        timeline.push({type: 'html-keyboard-response',
            stimulus: '+',
            choices: jsPsych.NO_KEYS, trial_duration: delay});

        timeline.push({type: 'string-entry',
            prompt:'<p>Type the numbers in backward order (last to first), press enter/return to send.</p>',
            answer: stimuli[j].toString(),
            choices: ALL_NUMBERS_PLUS_BACKSPACE_AND_ENTER,
            entry_size: 100,
            data: {...storeDataTag, ...data}});

        
        timeline.push({
            type: 'html-keyboard-response',
            stimulus: 'Press space to continue...',
            choices: ALL_KEYS_BUT_ENTER
        })
        


    }
    timeline.push({
        type: 'call-function',
        func: saveData
    })


    task['data'] = data;
    return task;
}

function EFStroop(stimuli, delay, data){
    let task = {};
    let timeline = [];
    timeline.push({type: 'html-keyboard-response',
        stimulus: '<p>Count the number of words with matching ink. For example, here <b>2</b> words match.</p>' +
            '<b><p style="color: '+ colorChart.G+'"> green </p>' + '<p style="color: '+ colorChart.R+'"> purple </p>' +
            '<p style="color: '+ colorChart.K+'"> black </p></b>',
        prompt: '<p style="font-size:32px">Press any key to continue...<p>'
    })
    data['item_type'] = 'EFStroop';

    for(let j in stimuli){
        let stimulus = stimuli[j].split(' ').filter((arg) => arg !== '')
        timeline.push({type: 'html-keyboard-response',
            stimulus: '<p>Count the number of words with matching ink.</p>',
            prompt: '<p style="font-size:32px">Press any key to continue...<p>'
        })

        let possibleKeys = Array(stimulus.length + 1).fill(48).map((x, y) => x + y);
        possibleKeys = possibleKeys.concat(Array(stimulus.length + 1).fill(96).map((x, y) => x + y));
        let correctAnswer = 0
        let stimLines = [];
        
        for (const i in stimulus) {
            let word = stimulus[i].split('.')
            if (word[0] === stroopCodes[word[1]]) {
                correctAnswer += 1;
            }
            stimLines.push('<p style="color: ' + colorChart[word[1]] + '"><b>' + word[0].toLowerCase() + '</b></p>')
        }
        data['answer'] = possibleKeys[correctAnswer];
        data['key'] = NUM_CODES;
        data['correct'] = undefined;
        // jspsych-categorize-html doesn't allow for OR-ing answers. This means it will always show 'correct' as false.
        // This line overloads it with an undefined, which keeps it from showing up in the POST at all.
        timeline.push({
            type: 'html-keyboard-response',
            stimulus: stimLines.join(''),
            choices: jsPsych.NO_KEYS,
            trial_duration: delay
        })

        let choices = Array(stimulus.length + 1).fill(0).map((x, y) => x + y);
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
            key_answer: 999,
            // This is to keep a warning from coming up, DO NOT USE THE 'correct' tag, it can't be manipulated to allow keypad usage.
            // Just to be safe, I suppressed 'correct' from even coming out.
            correct_text: "",
            incorrect_text: "",
            feedback_duration: 0,
            show_stim_with_feedback: false,
            data: {...storeDataTag, ...data}
        })

    }
    timeline.push({
        type: 'call-function',
        func: saveData
    })
    task['timeline'] = timeline;
    task['data'] = data;
    return task;
}

function PSStringComparison(stimuli, delay, data){
    let task = {};
    let timeline = [];
    timeline.push({type: 'html-keyboard-response',
    stimulus: 'Are the two items the SAME or DIFFERENT?',
    prompt: '<p>For SAME press "Q", for DIFFERENT press "P"</p>' + '<p>Go as fast as you can!</p>'+
        '<p><p style="font-size:32px">Press any key to continue...<p></p>'})

    let q_p = [80, 81]
    timeline.push({type: 'html-keyboard-response',
    stimulus: 'Press Q or P when Ready',
    prompt: '<div class="container bottom"> <div>Same - Q</div><div>&nbsp;</div><div>Different - P</div></div>',
    choices: q_p})

    let stimuli_1 = []
    let stimuli_2 = []
    let answer = []
    for(let i in stimuli){
        let stimsplit = stimuli[i].split('-')
        stimuli_1.push(stimsplit[0])
        stimuli_2.push(stimsplit[1])
        answer.push(q_p[stimsplit[0] === stimsplit[1] ? 1 : 0])
    }

    data['item_type'] = 'PSStringComparison';
    data['answer'] = answer
    console.log(answer)
    data['key'] = {'81': 'same', '80': 'different'}
    timeline.push({type: 'timed-html-comparison',
    stimuli_1: stimuli_1,
    stimuli_2: stimuli_2,
    choices: q_p,
    time_limit: delay,
    prompt: '<div class="container bottom"> <div>Same - Q</div><div>&nbsp;</div><div>Different - P</div></div>',
    data: {...storeDataTag, ...data}})

    timeline.push({
        type: 'call-function',
        func: saveData
    })
    task['timeline'] = timeline;
    
    task['data'] = data;
    return task;
}

function EMLongTerm(stimuli, choices, data){
    let task = {};
    let timeline = [];

    for (let i in choices) {
        let rechoice = fisherYates(choices[i])
        let answer = stimuli.filter(x => choices[i].includes(x));
        data['answer'] = answer[0];
        data['key'] = rechoice
        timeline.push({
            type: 'html-button-response',
            stimulus: "Which did you memorize before?", 
            choices: rechoice,
            data: {...storeDataTag, ...data}
        });
    }

    data['item_type'] = 'EMLongTerm';
    task['timeline'] = timeline;
    task['data'] = data;
    return task;
}

function endSurvey(question){
    let task = {};
    let data = {}
    let timeline = [];
    let options = ['Substantially Worse', 'Much Worse', 'Slightly Worse', 'Average', 'Slightly Better', 'Much Better', 'Substantially Better']
    let formoptions = []
    for(const i in options){
        formoptions.push('<p style="font-size:32px; line-height: 32px">' + options[i] + '</p>')
    }
    timeline.push({type: 'survey-likert',
    questions: [{prompt: '<p style="font-size:48px">' + question[0] + '</p>',
    labels: formoptions}],
    data: {...storeDataTag, ...data}})
    task['timeline'] = timeline;
    data['item_type'] = "End of Experiment Survey";
    task['data'] = data;
    return task;
}