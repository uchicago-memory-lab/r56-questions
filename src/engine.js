
let LONGTERMS = [1, 7, 6]

document.addEventListener('DOMContentLoaded', main, false);

let nameToFunc = {EMWordStim: EMWordStim,
             EMObjectPicture: EMObjectPicture,
             EFRuleID: EFRuleID,
             SMObjectNaming: SMObjectNaming,
             WMForwardDigitSpan: WMForwardDigitSpan,
             WMBackwardDigitSpan: WMBackwardDigitSpan,
             EFStroop: EFStroop,
             endSurvey: endSurvey,
             PSStringComparison: PSStringComparison};

let pressAny = '<p style="font-size:32px">Press any key to continue...<p>'

function fisherYates(tarArray){
    let array = JSON.parse(JSON.stringify(tarArray));
    for(let i = array.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * i);
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array
}

function getParams(func) {
    /**
     * Helper function stolen from geeksforgeeks.
     * https://www.geeksforgeeks.org/how-to-get-the-javascript-function-parameter-names-values-dynamically/
     * @type {string}
     */

    // String representaation of the function code
    var str = func.toString();

    // Remove comments of the form /* ... */
    // Removing comments of the form //
    // Remove body of the function { ... }
    // removing '=>' if func is arrow function
    str = str.replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/(.)*/g, '')
        .replace(/{[\s\S]*}/, '')
        .replace(/=>/g, '')
        .trim();

    // Start parameter names after first '('
    var start = str.indexOf("(") + 1;

    // End parameter names is just before last ')'
    var end = str.length - 1;

    var result = str.substring(start, end).split(", ");

    var params = [];

    result.forEach(element => {

        // Removing any default value
        element = element.replace(/=[\s\S]*/g, '').trim();

        if(element.length > 0)
            params.push(element);
    });

    return params;
}

async function loadQuestions() {
    return getData('questions/json/qblock.json')
}
function dat2Func(dat){
    /**
     * A function that takes in the generalized question data object (defined in qblock.json) and does a smart-conversion
     * into a jsPsych trial object.
     */

    let data = {stims_type: dat['stimsType'], item: dat['taskNum'], difficulty: dat['difficulty']};

    let tarfunc = nameToFunc[dat['kind']];
    let params = getParams(tarfunc);
    if (params.includes('choices')){
        return tarfunc(dat['stimuli'], dat['trials'], data);
    } else if (params.includes('delay')) {
        let dparam = parseInt(dat['stimsType'].slice(0, -1));
        return tarfunc(dat['stimuli'], dparam * 1000, data); // We have to convert seconds to ms
    } else if (params.includes('question')){
        return tarfunc(dat['stimuli'][0])
    } else {
        return tarfunc(dat['trials'], data);
    }


}

function itemsByDifficulty(qBlock, difficulty){
    return Object.keys(qBlock).filter((key) => qBlock[key]['difficulty'] === difficulty);
}

async function easyBlock(qBlock){
    let block = {};
    let timeline = [];

    timeline.push({
        type: 'html-keyboard-response',
        stimulus: 'Block 1 of 3',
        prompt: pressAny
    });

    let tarNums = itemsByDifficulty(qBlock, 'easy');
    let orderedNums = fisherYates(tarNums);
    for (const i in orderedNums){
        timeline.push(await dat2Func(qBlock[orderedNums[i]]));
    }
    // Oh the humanity why.

    // Basically this is putting the on_finish marker on the absolute last jsPsych task. Because for some reason
    // jsPsych is set up so that if you apply on_finish to a timeline, it runs it on finishing EVERY SUBTASK WHYYYYYYYY
    let litem = await timeline[timeline.length - 1]
    let ltask = await litem['timeline'][litem['timeline'].length - 1]
    ltask['on_finish'] = async function(data){
        jsPsych.init(await medBlock(qBlock))
    }
    block['timeline'] = timeline;
    return block;
}



async function medBlock(qBlock){
    let block = {};
    let timeline = [];

    timeline.push({
        type: 'html-keyboard-response',
        stimulus: 'Block 2 of 3',
        prompt: pressAny
    });
    let tarNums = itemsByDifficulty(qBlock, 'medium');
    let orderedNums = fisherYates(tarNums);
    for (const i in orderedNums){
        timeline.push(await dat2Func(qBlock[orderedNums[i]]));
    }

    // I'm sure this is the right design decision on jsPsych's part, considering that very very few of us do adaptive
    // testing research and even fewer of us do it online.

    let litem = await timeline[timeline.length - 1]
    let ltask = await litem['timeline'][litem['timeline'].length - 1]
    ltask['on_finish'] = async function(data){
        jsPsych.init(await hardBlock(qBlock))
    }
    block['timeline'] = timeline;
    return block
}

async function practiceBlock(qBlock){
    let block = {};
    let timeline = [];
    timeline.push({
        type: 'html-keyboard-response',
        stimulus: 'First, some practice.',
        prompt: pressAny
    })
    let tarNums = itemsByDifficulty(qBlock, 'practice');
    let instructions = await getData('./src/instructions.json')
    for (const i in tarNums){
        timeline.push({
            type: 'html-keyboard-response',
            stimulus: instructions[qBlock[tarNums[i]]['kind']],
            prompt: pressAny
        })
        timeline.push(await dat2Func(qBlock[tarNums[i]]));
        timeline.push({
            type: 'html-keyboard-response',
            stimulus: instructions[qBlock[tarNums[i]]['kind']+'FB'],
            prompt: pressAny
        })
        console.log(instructions)
    }

    timeline.push({type: 'html-button-response',
        stimulus: 'Would you like to repeat the practice round?',
        choices: ['yes', 'no'],
        on_finish: async function (data) {

            if (data['button_pressed'] === '1') {
                jsPsych.init(await easyBlock(qBlock))
            } else {
                jsPsych.init(await practiceBlock(qBlock))
            }}})
    block['timeline'] = timeline;
    return block}


async function hardBlock(qBlock){
    let block = {};
    let timeline = [];

    timeline.push({
        type: 'html-keyboard-response',
        stimulus: 'Block 3 of 3',
        prompt: pressAny
    })
    let tarNums = itemsByDifficulty(qBlock, 'hard');
    let orderedNums = fisherYates(tarNums);
    for (const i in orderedNums){
        timeline.push(await dat2Func(qBlock[orderedNums[i]]));
    }
    let litem = await timeline[timeline.length - 1]
    let ltask = await litem['timeline'][litem['timeline'].length - 1]
    ltask['on_finish'] = async function(data){
        jsPsych.init(await endBlock(qBlock))
    }
    block['timeline'] = timeline;

    return block
}

async function endBlock(qBlock){
    let block = {};
    let timeline = [];
    timeline.push({
        type: 'html-keyboard-response',
        stimulus: "You're almost done! Just a few more items to test your longer term memory, and then a short survey",
        prompt: pressAny
    })
    for(let i in LONGTERMS){
        let dat = qBlock[LONGTERMS[i].toString()]
        let data = {stims_type: dat['stimsType'], item: dat['taskNum'], difficulty: dat['difficulty']};
        timeline.push(EMLongTerm(dat['stimuli'], dat['trials'], data))
    }
    let surveyQs = itemsByDifficulty(qBlock, 'survey')
    timeline.push({
        type: 'html-keyboard-response',
        stimulus: "For each of the following abilities, please rate yourself compared to an <b> average person </b> your age with normal cognitive abilities.",
        prompt: pressAny
    })
    let rSurveyQs = fisherYates(surveyQs)
    for (const i in rSurveyQs){
        let dat = qBlock[rSurveyQs[i].toString()]
        timeline.push(endSurvey(dat['stimuli']))
    }
    timeline.push({type: 'call-function', func: document.exitFullscreen()})
    timeline.push({type: 'html-keyboard-response', stimulus: "Thanks for taking the time to do this experiment!",
    choices: jsPsych.NO_KEYS})
    block['timeline'] = timeline;
    return block
}

async function main() {
    let timeline = [];
    timeline.push({
        type: 'html-keyboard-response',
        stimulus: 'Welcome to the Experiment! <p> This window will switch to fullscreen mode when you continue.</p>',
        prompt: pressAny
    })

    timeline.push({
        type: 'call-function',
        func: function() {document.documentElement.requestFullscreen()}
    })

    let qBlock = await loadQuestions();


    timeline.push(await practiceBlock(qBlock));





    jsPsych.init({timeline: timeline});
}
