

document.addEventListener('DOMContentLoaded',main,false);

let nameToFunc = {EMWordStim: EMWordStim,
             EMObjectPicture: EMObjectPicture,
             EFRuleID: EFRuleID,
             SMObjectNaming: SMObjectNaming,
             WMForwardDigitSpan: WMForwardDigitSpan,
             WMBackwardDigitSpan: WMBackwardDigitSpan,
             EFStroop: EFStroop,
             PSStringComparison: PSStringComparison};



function fisherYates(tarArray){
    let array = JSON.parse(JSON.stringify(tarArray))
    for(let i = array.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * i)
        const temp = array[i]
        array[i] = array[j]
        array[j] = temp
    }
    return array
}

async function loadQuestions(){
    let qBlock = {}
    for (const kind in Object.keys(nameToFunc)){
        qBlock[Object.keys(nameToFunc)[kind]] = await getData('questions/json/' + Object.keys(nameToFunc)[kind] + '.json')
    }
    return qBlock
}

function dat2Func(dat){
    /**
     * A function that takes in the generalized question data object (defined in qblock.json) and does a smart-conversion
     * into a jsPsych trial object.
     */
    let data = {stims_type: dat['stimsType'], item: dat['taskNum']}


}

async function easyBlock(qBlock){
    let block = {};
    let timeline = [];
    timeline.push({
        type: 'html-keyboard-response',
        stimulus: 'Block 1 of 3',
        prompt: 'Press any key to continue...'
    })
    let tarNums = ['33', '1', '635', '451']
    // TODO: Figure out if tarNums needs to be manual or auto.
    for (const i in tarNums){
        timeline.push(dat2Func(qBlock[tarNums[i]]))
    }


    block['timeline'] = timeline
    return block
}

async function main() {
    let timeline = [];
    timeline.push({
        type: 'html-keyboard-response',
        stimulus: 'Welcome to the R56!',
        prompt: 'Press any key to continue...'
    })
    let qBlock = await loadQuestions()

    // timeline.push({type: 'fullscreen', fullscreen_mode: true})

    // timeline.push(await EMWordStim(['anger', 'bread', 'army'],
    //     [['anger', 'white', 'cat', 'coal'], ['woman', 'mountain', 'music', 'bread'], ['bird', 'stomach', 'army', 'net']],
    //     {stims_type: 'nonsense', item: 1}));
    //
    // timeline.push(await EMObjectPicture(['chessboard', 'tennisracquet', 'babushkadolls'],
    //     [['ringbinder', 'chessboard', 'cookingpan', 'motorcycle'], ['nunchaku', 'tennisracquet', 'ceilingfan', 'pokercard'],
    //     ['coin', 'babushkadolls', 'easteregg_redo', 'orifan']],
    //     {stims_type: 'all unrelated', item: 9}))
    //
    //
    // timeline.push(EFRuleID([['DB7', 'CO4', 'CR2'], ['HG5', 'SP1', 'HR2'], ['TP5', 'CP3', 'HG9']],
    //         {stims_type: 'RuleID', item: 'EFRIP'}))
    //
    // let ON_TEST = ['butterfly', 'muffin', 'flag', 'coffee'];
    //
    // timeline.push(SMObjectNaming(['butterfly', 'flag', 'muffin'], [ON_TEST, fisherYates(ON_TEST), fisherYates(ON_TEST)],
    //     {stims_type: 'object_naming', item:'SMONP'}))
    //
    //
    // timeline.push(WMForwardDigitSpan([872, 345, 982], 1, {item: 'WMFDP'}))
    //
    // timeline.push(WMBackwardDigitSpan([519, 762, 123], 1, {item: 'WMBDP'}))
    //
    // timeline.push(EFStroop([['Black.G', 'Green.R', 'purple.P'], ['Red.R', 'green.R', 'Black.K'], ['Purple.P', 'Green.R', 'Red.G']], 4, {item: 'EFSTP'}))


    // timeline.push(PSStringComparison(['AA-AA', 'BB-BB', 'AB-34'], 6000, {item: 'PSSCP'}))

    // timeline.push({type: 'fullscreen', fullscreen_mode: false})

    // timeline.push(await easyBlock(qBlock))

    timeline.push({type: 'html-keyboard-response',
    stimulus: 'You have completed the Practice round!',
    prompt: "Press any key to continue..."})

    jsPsych.init({timeline: timeline});
}

