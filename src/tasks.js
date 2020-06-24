
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
        O: '#FE9920',
        P: '#501537',
        W: '#F4F1DE'}

function ruleID(stimuli, scale) {
    // Draws on the canvas.
    var canvas = document.getElementById('ruleID');
    let step = 1000 / (stimuli.length + 1);
    let objectCenters =   Array(Math.ceil(1000.0 / step)).fill(0).map((x, y) => x + y * step);
    objectCenters.shift();


    for(const i in stimuli){
        var ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.font = '32px Open Sans';
        ctx.textBaseline= 'middle';
        ctx.textAlign = 'center';

        let shapeCode = stimuli[i][0];
        let colorCode = stimuli[i][1];
        let number = stimuli[i][2];
        if(shapeCode === 'D'){
            ctx.fillStyle = ruleIDColorChart[colorCode]
            ctx.moveTo(objectCenters[i]-scale, 75)
            ctx.lineTo(objectCenters[i], 75 + scale*Math.SQRT2)
            ctx.lineTo(objectCenters[i]+scale, 75)
            ctx.lineTo(objectCenters[i], 75 - scale*Math.SQRT2)
            ctx.closePath()
            ctx.fill()

            ctx.fillStyle = ruleIDColorChart.W
            ctx.fillText(number, objectCenters[i], 75)

            }

        if(shapeCode === 'S'){
            ctx.fillStyle = ruleIDColorChart[colorCode]
            ctx.fillRect(objectCenters[i]-scale, 75-scale, 2*scale, 2*scale)

            ctx.fillStyle = ruleIDColorChart.W
            ctx.fillText(number, objectCenters[i], 75)
        }

        if(shapeCode === 'T'){
            ctx.fillStyle = ruleIDColorChart[colorCode]
            ctx.moveTo(objectCenters[i], 75 - scale*Math.SQRT2*Math.sqrt(3)*0.5)
            ctx.lineTo(objectCenters[i]-scale*Math.SQRT2,
                75+scale*0.5*Math.SQRT2*Math.sqrt(3))
            ctx.lineTo(objectCenters[i]+scale*Math.SQRT2,
                75+scale*0.5*Math.SQRT2*Math.sqrt(3))
            ctx.closePath()
            ctx.fill()

            ctx.fillStyle = ruleIDColorChart.W
            ctx.fillText(number, objectCenters[i], 75)
        }

        if(shapeCode === 'C'){
            ctx.fillStyle = ruleIDColorChart[colorCode]
            ctx.moveTo(objectCenters[i], 75 - scale)
            ctx.arc(objectCenters[i], 75, scale*Math.sqrt(2), 0, Math.PI * 2, true)
            ctx.fill()

            ctx.fillStyle = ruleIDColorChart.W
            ctx.fillText(number, objectCenters[i], 75)
        }

        if(shapeCode === 'H'){
            ctx.fillStyle = ruleIDColorChart[colorCode]
            ctx.moveTo(objectCenters[i] + scale*Math.SQRT2, 75)
            ctx.lineTo(objectCenters[i] + 0.5*scale*Math.SQRT2, 75 + 0.5*Math.SQRT2*scale*Math.sqrt(3))
            ctx.lineTo(objectCenters[i] - 0.5*scale*Math.SQRT2, 75 + 0.5*Math.SQRT2*scale*Math.sqrt(3))
            ctx.lineTo(objectCenters[i] - scale*Math.SQRT2, 75)
            ctx.lineTo(objectCenters[i] - 0.5*scale*Math.SQRT2, 75 - 0.5*Math.SQRT2*scale*Math.sqrt(3))
            ctx.lineTo(objectCenters[i] + 0.5*scale*Math.SQRT2, 75 - 0.5*Math.SQRT2*scale*Math.sqrt(3))
            ctx.fill()

            ctx.fillStyle = ruleIDColorChart.W
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

    function draw(){
        ruleID(stimuli, 50);
    }

    let possibleKeys = [90, 86, 77]; // Shape - Z, Color - V, Number - M

    timeline.push({type: 'canvas-keyboard-response',
        func: draw,
        canvas_id: 'ruleID',
        stimulus: 'Which is the most frequent feature: Shape, Color, or Number?',
        prompt: '<div class="container space-around"><div>Z - Shape</div><div>V - Color</div><div>M - Number</div></div>',
        choices: possibleKeys,
        key_answer: possibleKeys[answerIndex],
        text_answer: ['Shape', 'Color', 'Number'][answerIndex]
        })

    data['trial_type'] = 'Executive Function Rule Identification';
    task['timeline'] = timeline;
    task['data'] = data;
    return task;
}

function SMObjectNaming(choices, stimulus, data){
    let task = {};
    let timeline = [];
    timeline.push({type: 'html-keyboard-response',
        stimulus: "Choose the name for each object.",
        prompt: "Press any key to continue...."})

    let promptLines = [];
    let possibleKeys = Array(choices.length).fill(49).map((x, y) => x + y);

    for(const i in choices){
        promptLines.push("<p>" + (parseInt(i) + 1) + ' - ' + choices[i] + "</p>")
    }

    let promptHTML = promptLines.join('')
    timeline.push({type: 'categorize-image',
        stimulus: './img/'+stimulus+'.jpg',
        prompt: promptHTML,
        // TODO: Uncomment these to turn off feedback before deployment.
        // correct_text: "",
        // incorrect_text: "",
        choices: possibleKeys,
        key_answer: possibleKeys[choices.findIndex(element => element === stimulus)],
        text_answer: stimulus})
    data['trial_type'] = 'Semantic Memory Object Naming';
    task['timeline'] = timeline;
    task['data'] = data;
    return task;


}

function WMForwardDigitSpan(stimulus, delay, data){
    let task = {};
    let timeline = [];
    timeline.push({type: 'html-keyboard-response',
    stimulus:'Rehearse the numbers for forward recall (first to last)',
    prompt: 'Press any key to continue...'})

    let numbers = stimulus.toString()
    for(const i in numbers){
        timeline.push({type: 'html-keyboard-response', stimulus: numbers[i],
            choices: jsPsych.NO_KEYS, trial_duration: 1000})
    }
    timeline.push({type: 'html-keyboard-response',
        stimulus: 'Rehearse the numbers in forward order.',
        choices: jsPsych.NO_KEYS, trial_duration: 1000*delay})

    timeline.push({type: 'survey-html-form',
    preamble:'<p>Type the numbers in forward order (first to last)</p>',
    html:'<p><input name="numbers" type="number"/>'})



    if(countUnique(numbers) === numbers.length){
        // noinspection JSDuplicatedDeclaration
        var repeats = ' no repeats'
    } else {
        // noinspection JSDuplicatedDeclaration
        var repeats = ' repeats'
    }
    data['stims_type'] = numbers.length + ' digits' + repeats;
    data['trial_type'] = 'Episodic Memory Image Stimuli';
    task['timeline'] = timeline;
    task['data'] = data;
    return task;

}