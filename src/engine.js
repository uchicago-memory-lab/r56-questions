

document.addEventListener('DOMContentLoaded',main,false);

function main() {
    let timeline = [];
    timeline.push({
        type: 'html-keyboard-response',
        stimulus: 'Welcome to the R56!',
        prompt: 'Press any key to continue...'
    })

// timeline.push(EMWordStim(['blurp', 'wollen', 'quavied'],
//     ['koaya', 'quavied', 'loonsty', 'fealong'],
//     {stims_type: 'nonsense', item: 1}));
//
// timeline.push(EMObjectPicture(['chessboard', 'tennisracquet', 'babushkadolls'],
//     ['ringbinder', 'chessboard', 'cookingpan', 'motorcycle'],
//     {stims_type: 'all unrelated', item: 9}))

// timeline.push(EFRuleID(['DB7', 'CO4', 'TR2', 'SP4', 'HG9'],
//         {stims_type: 'RuleID', item: 'EFRIP'}))

// timeline.push(SMObjectNaming(['fish', 'stairs', 'marker', 'glue'], 'fish',
//     {stims_type: 'object_naming', item:'SMONP'}))

timeline.push(WMForwardDigitSpan(872, 3, {item: 'WMFDP'}))

    jsPsych.init({timeline: timeline});
}
