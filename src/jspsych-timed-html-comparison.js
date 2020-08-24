jsPsych.plugins["timed-html-comparison"] = (function() {

    let plugin = {};

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
            },
            prompt: {
                type: jsPsych.plugins.parameterType.STRING,
                default: null
            }
        }
    }

    plugin.trial = function(display_element, trial) {


        let response = {
            rt: [],
            key: []
        };

        let t = 0;

        if (trial.time_limit !== null) {
            jsPsych.pluginAPI.setTimeout(function() {
                end_trial();
            }, trial.time_limit);
        }

        let after_response = function(info){

            display_element.querySelector('#jspsych-timed-html-comparison').className += ' responded';

            response.rt.push(info.rt);
            response.key.push(info.key);
            t += 1;
            innerTrial(t)
            if(t === trial.stimuli_1.length){
                end_trial()
            }
        };

        if (trial.choices !== jsPsych.NO_KEYS) {
            var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: after_response,
                valid_responses: trial.choices,
                rt_method: 'performance',
                persist: true,
                allow_held_key: false
            });
        }

        let innerTrial = function(trialNum){
            // noinspection UnnecessaryLocalVariableJS
            let new_html = '<div id="jspsych-timed-html-comparison" class="container object"><div>' + trial.stimuli_1[trialNum] + '</div><div>' +
                trial.stimuli_2[trialNum] + '</div></div>';

            if(trial.prompt){
                new_html += trial.prompt
            }

            display_element.innerHTML = new_html;
        }

        var end_trial = function () {

            // kill any remaining setTimeout handlers
            jsPsych.pluginAPI.clearAllTimeouts();

            // kill keyboard listeners
            if (typeof keyboardListener !== 'undefined') {
                jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
            }

            let t_left = trial.stimuli_1.length - t

            for(let i = 0; i < t_left; i++){
                response.rt.push(0);
                response.key.push(null);
            }


            // gather the data to store for the trial
            let trial_data = {
                "rt": response.rt,
                "stimulus": trial.stimulus,
                "key_press": response.key,

            };


            // clear the display
            display_element.innerHTML = '';

            // move on to the next trial
            jsPsych.finishTrial(trial_data);
        };


        innerTrial(t)



    };

    return plugin;
})();