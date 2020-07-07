

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

async function easyBlock(){
    let block = {};
    let timeline = [];
    timeline.push({
        type: 'html-keyboard-response',
        stimulus: 'Block 1 of 3',
        prompt: 'Press any key to continue...'
    })
    let qBlock = await loadQuestions()
    let RID = qBlock['EFRuleID'].filter(function (obj){return obj['difficulty'] === 'easy'})
    for (const i in RID){
        timeline.push(EFRuleID(RID[i]['trials'], {stims_type: RID[i]['stimsType'], item: RID[i]['taskNum']}))
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
    // timeline.push(SMObjectNaming([ON_TEST, fisherYates(ON_TEST), fisherYates(ON_TEST)], ['butterfly', 'flag', 'muffin'],
    //     {stims_type: 'object_naming', item:'SMONP'}))
    //
    //
    // timeline.push(WMForwardDigitSpan([872, 345, 982], 1, {item: 'WMFDP'}))
    //
    // timeline.push(WMBackwardDigitSpan([519, 762, 123], 1, {item: 'WMBDP'}))
    //
    // timeline.push(EFStroop([['KG', 'GR', 'PP'], ['RR', 'GR', 'KK'], ['PP', 'GR', 'RG']], 4, {item: 'EFSTP'}))


    // timeline.push(PSStringComparison(['AA-AA', 'BB-BB', 'AB-34'], 6000, {item: 'PSSCP'}))

    // timeline.push({type: 'fullscreen', fullscreen_mode: false})

    timeline.push(await easyBlock())

    timeline.push({type: 'html-keyboard-response',
    stimulus: 'You have completed the Practice round!',
    prompt: "Press any key to continue..."})

    jsPsych.init({timeline: timeline});
}

