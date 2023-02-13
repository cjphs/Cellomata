let preset_rulesets = new Map();

newTemplate = function() {
    let sel = document.getElementById("template_selection_box").value;
    loadPreset(sel);
}

preset_rulesets.set("life",
`Void, Dead, Alive
@colors
black, black, white

p = .2

Void ->
Alive with chance p
Dead otherwise.

Dead ->
Alive if 3*Alive nearby
Dead otherwise.

Alive ->
Alive if [2,3]*Alive nearby
Dead otherwise.

@width 100
@height 100
@wrap true`);

preset_rulesets.set("rockpaperscissors",
`Nil, Rock, Paper, Scissors
@colors
black, red, yellow, orange

Nil ->
Rock with chance .3
Paper with chance .3
Scissors with chance .3
Nil.

t = 3
p = 1

Rock ->
Paper with prob p if >=t*Paper nearby
Rock otherwise.

Paper ->
Scissors with prob p if >=t*Scissors nearby
Paper otherwise.

Scissors ->
Rock with prob p if >=t*Rock nearby
Scissors otherwise.

@width 100
@height 100
@wrap false`);

function loadPreset(preset_id) {
    document.getElementById("rule_input_box").innerHTML = preset_rulesets.get(preset_id);
    updateRules(true);
}