

document.addEventListener('DOMContentLoaded', main, false);

let nameToFunc = {EMWordStim: EMWordStim,
             EMObjectPicture: EMObjectPicture,
             EFRuleID: EFRuleID,
             SMObjectNaming: SMObjectNaming,
             WMForwardDigitSpan: WMForwardDigitSpan,
             WMBackwardDigitSpan: WMBackwardDigitSpan,
             EFStroop: EFStroop,
             PSStringComparison: PSStringComparison};



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
    } else if (params.includes('delay')){
        let dparam = parseInt(dat['stimsType'].slice(0, -1));
        return tarfunc(dat['stimuli'], dparam*1000, data); // We have to convert seconds to ms
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
        prompt: 'Press any key to continue...'
    });
    let tarNums = itemsByDifficulty(qBlock, 'easy');
    let orderedNums = fisherYates(tarNums);
    for (const i in orderedNums){
        timeline.push(await dat2Func(qBlock[orderedNums[i]]));
    }
    block['timeline'] = timeline;
    return block;
}

async function medBlock(qBlock){
    let block = {};
    let timeline = [];
    timeline.push({
        type: 'html-keyboard-response',
        stimulus: 'Block 1 of 3',
        prompt: 'Press any key to continue...'
    });
    let tarNums = itemsByDifficulty(qBlock, 'medium');
    let orderedNums = fisherYates(tarNums);
    for (const i in orderedNums){
        timeline.push(await dat2Func(qBlock[orderedNums[i]]));
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
        prompt: 'Press any key to continue...'
    })
    let tarNums = itemsByDifficulty(qBlock, 'practice');
    let instructions = await getData('./instructions.json')
    for (const i in tarNums){
        timeline.push({
            type: 'html-keyboard-response',
            stimulus: instructions[qBlock[tarNums[i]]['kind']],
            prompt: 'Press any key to continue...'
        })
        timeline.push(await dat2Func(qBlock[tarNums[i]]));
    }
    block['timeline'] = timeline;
    return block

}

async function hardBlock(qBlock){
    let block = {};
    let timeline = [];
    timeline.push({
        type: 'html-keyboard-response',
        stimulus: 'Block 1 of 3',
        prompt: 'Press any key to continue...'
    })
    let tarNums = itemsByDifficulty(qBlock, 'hard');
    let orderedNums = fisherYates(tarNums);
    for (const i in orderedNums){
        timeline.push(await dat2Func(qBlock[orderedNums[i]]));
    }
    block['timeline'] = timeline;
    return block
}



async function main() {
    let timeline = [];
    timeline.push({
        type: 'html-keyboard-response',
        stimulus: 'Welcome to the R56!',
        prompt: 'Press any key to continue...'
    })
    let qBlock = await loadQuestions();

    timeline.push({type: 'fullscreen', fullscreen_mode: true});

    timeline.push(await practiceBlock(qBlock))

    timeline.push(await easyBlock(qBlock));
    timeline.push(await medBlock(qBlock))
    timeline.push(await hardBlock(qBlock))


    timeline.push({type: 'fullscreen', fullscreen_mode: false});



    jsPsych.init({timeline: timeline});
}

