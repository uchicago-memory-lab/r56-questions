jsPsych.plugins["timed-html-comparison"] = (function() {

    var plugin = {};

    plugin.info = {
        name: "timed-html-comparison",
        parameters: {
            stimuli_1: {
                type: jsPsych.plugins.parameterType.STRING, // BOOL, STRING, INT, FLOAT, FUNCTION, KEYCODE, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
                default: undefined
            },
            stimuli_2: {
                type: jsPsych.plugins.parameterType.STRING,
                default: undefined
            },
            time_limit: {
                type: jsPsych.plugins.parameterType.INT,
                default: 5000
            },
            choices: {
                type: jsPsych.plugins.parameterType.KEYCODE,
                default: jsPsych.ALL_KEYS
            }
        }
    }

    plugin.trial = function(display_element, trial) {

        let after_response = function(info){

            display_element.querySelector('#jspsych-timed-html-comparison').className += ' responded';

        };
        let keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
            callback_function: after_response,
            valid_responses: trial.choices,
            rt_method: 'performance',
            persist: false,
            allow_held_key: false
        });
        let new_html = '<div id="jspsych-timed-html-comparison"><div>' + trial.stimuli_1[0] + '</div><div>' +
            trial.stimuli_2[0] + '</div></div>';

        // start the response listener
        if (trial.choices !== jsPsych.NO_KEYS) {
        }

        let response = {
            rt: null,
            keys: []
        };


        let end_trial = function () {

            // kill any remaining setTimeout handlers
            jsPsych.pluginAPI.clearAllTimeouts();

            // kill keyboard listeners
            if (typeof keyboardListener !== 'undefined') {
                jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
            }

            // gather the data to store for the trial
            let trial_data = {
                "rt": response.rt,
                "stimulus": trial.stimulus,
                "key_press": response.key
            };

            // clear the display
            display_element.innerHTML = '';

            // move on to the next trial
            jsPsych.finishTrial(trial_data);
        };
    };

    return plugin;
})();