import Grid from "./Grid.js";
import { interpretRules } from "./interpreter.js";
import presetRulesets from "./presets";

import ace from "ace-builds";
import "ace-builds/src-noconflict/theme-terminal";
import "ace-builds/src-noconflict/mode-python";

const canvas = document.getElementById("grid-canvas");
const ctx = canvas.getContext("2d");

const editorTheme = "ace/theme/terminal";

let gridWidth = 64;
let gridHeight = 64;

let cellWidth = canvas.clientWidth / gridWidth;
let cellHeight = canvas.clientHeight / gridHeight;

function recalculateGridSize() {
  pause();

  cellWidth = canvas.clientWidth / gridWidth;
  cellHeight = canvas.clientHeight / gridHeight;

  grid.width = gridWidth;
  grid.height = gridHeight;

  resetGrid(rules, false);
}

let grid = null;
let playing = false;

let frame = 0;

let selectedCellState = "";
let selectedCellElement = null;

let stateCols = {};

const draw = function () {
  if (grid == null) {
    return;
  }

  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      ctx.fillStyle = stateCols[grid.getCellState(x, y)];
      ctx.fillRect(
        Math.floor(cellWidth * x),
        Math.floor(cellHeight * y),
        Math.ceil(cellWidth),
        Math.ceil(cellHeight),
      );
    }
  }
};

const pauseUnpause = function () {
  if (playing) {
    pause();
  } else {
    unpause();
    play();
  }
};

const pause = function () {
  playing = false;
  document.getElementById("play-button").innerHTML = "Play";
};

const unpause = function () {
  playing = true;
  document.getElementById("play-button").innerHTML = "Pause";
};

const play = function () {
  if (!playing) {
    return;
  }

  if (frame++ % 10 === 0) {
    evolveDraw();
  }

  requestAnimationFrame(play);
};

const cssAnim = function (element, animation) {
  const canv = document.getElementById(element);
  if (canv == null) {
    return;
  }
  canv.style.animation = "none";
  canv.offsetWidth;
  canv.style.animation = animation;
};

const selectCellState = function (state) {
  if (selectedCellElement != null) {
    selectedCellElement.classList.remove("border", "border-white");
  }

  selectedCellElement = document.getElementById(state);
  selectedCellElement.classList.add("border", "border-white");

  selectedCellState = state;
};

let rules = null;

const updateRules = function (reset = false) {
  const ruleString = editor.getSession().getValue() || rules;
  if (ruleString == "") {
    return;
  }

  const interpreted = interpretRules(ruleString);

  gridWidth = interpreted.gridWidth;
  gridHeight = interpreted.gridHeight;

  rules = interpreted.ruleset;
  stateCols = interpreted.stateCols;

  const statesBox = document.getElementById("state_picker");

  statesBox.innerHTML = "";
  rules.states.forEach((s) => {
    const cellElement = document.createElement("div");
    cellElement.id = s;
    cellElement.className = "state rounded m-1";
    cellElement.style.backgroundColor = stateCols[s];

    cellElement.title = s;

    cellElement.onclick = function () {
      selectCellState(s);
    };

    statesBox.appendChild(cellElement);
  });

  if (
    grid == null ||
    interpreted.gridWidth != grid.width ||
    interpreted.gridHeight != grid.height
  ) {
    grid = new Grid(
      interpreted.gridWidth,
      interpreted.gridHeight,
      rules,
      stateCols,
      interpreted.wrap,
    );
    recalculateGridSize();
  } else {
    grid.rules = rules;
  }

  if (reset) {
    // if (recalcGridSize) { recalculateGridSize() }
    recalculateGridSize();
    resetGrid(rules);
  } else {
    selectCellState(selectedCellState);
  }
};

const clearGrid = function () {
  grid.resetGrid();
  selectCellState(grid.rules.getDefaultState());
  draw();
};

const resetGrid = function (rules, existingStates = true) {
  grid.resetGrid(existingStates);
  selectCellState(rules.getDefaultState());
  draw();
};

const evolveDraw = function () {
  grid.step();
  draw();
};

draw();

/*
Event stuff
*/

document.onkeydown = function (e) {
  e = e || window;

  if (!e.ctrlKey) {
    return;
  }

  switch (e.key) {
    case "s":
      updateRules();
      draw();

      e.preventDefault();
      e.stopPropagation();
      break;

    case "x":
      clearGrid();
      break;
  }
};

let mouseDown = false;
canvas.addEventListener(
  "mousedown",
  function () {
    mouseDown = true;
  },
  false,
);
canvas.addEventListener(
  "mouseup",
  function () {
    mouseDown = false;
  },
  false,
);

canvas.addEventListener(
  "mousemove",
  (e) => {
    if (mouseDown) {
      // https://stackoverflow.com/a/42111623
      const rect = e.target.getBoundingClientRect();
      const x = e.clientX - rect.left; // x position within the element.
      const y = e.clientY - rect.top; // y position within the element.

      const cx = Math.floor(x / cellWidth);
      const cy = Math.floor(y / cellHeight);

      grid.setCellState(cx, cy, selectedCellState);

      draw();
    }
  },
  false,
);

function resizeGridElement() {
  var div = document.getElementById("grid-parent");
  var canvas = document.getElementById("grid-canvas");
  var row = document.getElementById("col-simulator");

  var divStyle = window.getComputedStyle(div);
  var rowStyle = window.getComputedStyle(row);

  var divWidth =
    div.offsetWidth -
    parseFloat(divStyle.paddingLeft) -
    parseFloat(divStyle.paddingRight);
  var rowHeight =
    row.offsetHeight -
    parseFloat(rowStyle.paddingTop) -
    parseFloat(rowStyle.paddingBottom) -
    16;

  var size = Math.min(divWidth, rowHeight);

  canvas.width = size;
  canvas.height = size;

  cellWidth = canvas.clientWidth / gridWidth;
  cellHeight = canvas.clientHeight / gridHeight;

  draw();
}

window.onload = function () {
  resizeGridElement();
};

window.onresize = function () {
  resizeGridElement();
};

const loadPreset = function (preset) {
  rules = presetRulesets.get(preset);

  window.history.pushState(
    { ruleset: rules },
    "Cellomata",
    `?preset=${preset}`,
  );

  editor.getSession().setValue(rules);
  updateRules(true);
};

let editor;

document.addEventListener("DOMContentLoaded", function () {
  const stepButton = document.getElementById("step");
  const playButton = document.getElementById("play-button");
  const clearButton = document.getElementById("clear-grid");
  const interpretButton = document.getElementById("updateRules");

  const presetSelect = document.getElementById("sel-preset");

  stepButton.disabled = false;
  playButton.disabled = false;
  clearButton.disabled = false;
  interpretButton.disabled = false;

  presetSelect.disabled = false;

  document.getElementById("step").addEventListener("click", function () {
    grid.step();
    draw();
  });
  document.getElementById("updateRules").addEventListener("click", updateRules);
  document.getElementById("clear-grid").addEventListener("click", clearGrid);
  document
    .getElementById("play-button")
    .addEventListener("click", pauseUnpause);

  document.getElementById("sel-preset").addEventListener("change", function () {
    loadPreset(this.value);
  });

  editor = ace.edit("rule_input_box", {
    mode: "ace/mode/javascript",
    selectionStyle: "text",
  });

  let textarea = document.querySelector('textarea[name="rule_input_box"]');
  textarea.setAttribute("hidden", true);

  editor.setTheme(editorTheme);
  editor.getSession().setMode("ace/mode/python");
  editor.getSession().setUseWrapMode(true);

  editor.getSession().on("change", function () {
    textarea.value = editor.getSession().getValue();
  });

  const urlParams = new URLSearchParams(window.location.search);
  const preset = urlParams.get("preset");
  if (preset) {
    loadPreset(preset);
  } else {
    loadPreset("life");
  }
});
