jsPsych.plugins["canvas-keyboard-response"] = (function() {

    var plugin = {};

    plugin.info = {
        name: "canvas-keyboard-response",
        description: 'Creates a canvas, then runs the function you supply.',
        parameters: {
            func: {
                type: jsPsych.plugins.parameterType.FUNCTION, 
                default: undefined,
                pretty_name: 'Function',
                descripton: 'Function to call.'
            },
            prompt: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Prompt',
                default: undefined,
                description: 'The HTML string to be displayed above the canvas.'
            },
            canvas_id:{
              type: jsPsych.plugins.parameterType.STRING,
              pretty_name: 'Canvas ID',
              default: 'canvas',
              description: 'The ID of the canvas html block.'
            },
            choices: {
                type: jsPsych.plugins.parameterType.KEYCODE,
                array: true,
                pretty_name: 'Choices',
                default: jsPsych.ALL_KEYS,
                description: 'The keys the subject is allowed to press to respond to the stimulus.'
            },
            stimulus_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Stimulus duration',
                default: null,
                description: 'How long to hide the stimulus.'
            },
            trial_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Trial duration',
                default: null,
                description: 'How long to show trial before it ends.'
            },
            response_ends_trial: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Response ends trial',
                default: true,
                description: 'If true, trial will end when subject makes a response.'
            },
        }
    };

    plugin.trial = function(display_element, trial) {

        var new_html = '<canvas id="'+trial.canvas_id+'" width="1000" style="border: transparent"></canvas><p>';

        if(trial.prompt !== null){
            new_html += trial.prompt + "</p>";
        }

        display_element.innerHTML = new_html;
        trial.func()
        var response = {
            rt: null,
            key: null
        };

        // function to end trial when it is time
        var end_trial = function() {

            // kill any remaining setTimeout handlers
            jsPsych.pluginAPI.clearAllTimeouts();

            // kill keyboard listeners
            if (typeof keyboardListener !== 'undefined') {
                jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
            }

            // gather the data to store for the trial
            var trial_data = {
                "rt": response.rt,
                "stimulus": trial.stimulus,
                "key_press": response.key
            };

            // clear the display
            display_element.innerHTML = '';

            // move on to the next trial
            jsPsych.finishTrial(trial_data);
        };

        // function to handle responses by the subject
        var after_response = function(info) {

            // after a valid response, the stimulus will have the CSS class 'responded'
            // which can be used to provide visual feedback that a response was recorded
            display_element.querySelector('#jspsych-html-keyboard-response-stimulus').className += ' responded';

            // only record the first response
            if (response.key == null) {
                response = info;
            }

            if (trial.response_ends_trial) {
                end_trial();
            }
        };

        if (trial.choices !== jsPsych.NO_KEYS) {
            var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: after_response,
                valid_responses: trial.choices,
                rt_method: 'date',
                persist: false,
                allow_held_key: false
            });
        }

        // hide stimulus if stimulus_duration is set
        if (trial.stimulus_duration !== null) {
            jsPsych.pluginAPI.setTimeout(function() {
                display_element.querySelector('#jspsych-html-keyboard-response-stimulus').style.visibility = 'hidden';
            }, trial.stimulus_duration);
        }

        // end trial if trial_duration is set
        if (trial.trial_duration !== null) {
            jsPsych.pluginAPI.setTimeout(function() {
                end_trial();
            }, trial.trial_duration);
        }



        // data saving
        var trial_data = {
            parameter_name: 'parameter value'
        };

        // end trial
        jsPsych.finishTrial(trial_data);
    };

    return plugin;
})();