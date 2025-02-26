(function () {
  "use strict";

  var clippy = require("./editor-libs/clippy");
  var mceEvents = require("./editor-libs/events");
  var mceUtils = require("./editor-libs/mce-utils");

  var exampleChoiceList = document.getElementById("example-choice-list");
  var exampleChoices = exampleChoiceList.querySelectorAll(".example-choice");
  var header = document.querySelector("header");
  var initialChoice = 0;
  var originalChoices = [];
  var output = document.getElementById("output");

  /**
   * Enables and initializes the live code editor
   */
  function enableLiveEditor() {
    header.classList.remove("hidden");
    exampleChoiceList.classList.add("live");
    output.classList.remove("hidden");

    for (var i = 0, l = exampleChoices.length; i < l; i++) {
      var exampleChoice = exampleChoices[i];
      var choiceButton = document.createElement('button');
      var choiceButtonText = document.createElement('span');

      choiceButton.setAttribute("type", "button");
      choiceButton.classList.add("example-choice-button")
      choiceButtonText.classList.add("visually-hidden");
      choiceButtonText.textContent = "Choose example " + ( i + 1);

      choiceButton.append(choiceButtonText);
      exampleChoice.append(choiceButton);

      originalChoices.push(exampleChoice.querySelector("code").textContent);

      if (exampleChoice.getAttribute("initial-choice")) {
        initialChoice = indexOf(exampleChoices, exampleChoice);
      }
    }

    mceEvents.register();
    handleResetEvents();
    handleChoiceHover();

    clippy.addClippy();
  }

  /**
   * Attached an event handler on the reset button, and handles
   * reset all the CSS examples to their original state
   */
  function handleResetEvents() {
    var resetButton = document.getElementById("reset");

    resetButton.addEventListener("click", function () {
      for (var i = 0, l = exampleChoices.length; i < l; i++) {
        var highlighted = Prism.highlight(
          originalChoices[i],
          Prism.languages.css
        );
        // IE11 does not support multiple selectors in `remove`
        exampleChoices[i].classList.remove("invalid");
        exampleChoices[i].classList.remove("selected");
        exampleChoices[i].querySelector("code").innerHTML = highlighted;
      }

      // if there is an initial choice set, set it as selected
      if (initialChoice) {
        mceEvents.onChoose(exampleChoices[initialChoice]);
        clippy.toggleClippy(exampleChoices[initialChoice]);
      } else {
        mceEvents.onChoose(exampleChoices[0]);
        clippy.toggleClippy(exampleChoices[0]);
      }
    });
  }

  function indexOf(exampleChoices, choice) {
    for (var i = 0, l = exampleChoices.length; i < l; i++) {
      if (exampleChoices[i] === choice) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Attach mouse events to example choices
   * for allowing clippy button to display on hover
   * and otherwise return to intial hidden state
   */
  function handleChoiceHover() {
    for (var i = 0, l = exampleChoices.length; i < l; i++) {
      var choice = exampleChoices[i];
      var copyBtn = choice.querySelector(".copy");
      copyBtn.setAttribute("aria-label", "Copy to clipboard");

      choice.addEventListener("mouseover", () => {
        copyBtn.setAttribute("aria-hidden", false);
      });
      choice.addEventListener("mouseout", () => {
        copyBtn.setAttribute("aria-hidden", true);
      });
    }
  }

  /* only show the live code view if JS is enabled and the property is supported.
    Also, only execute JS in our supported browsers. As `document.all`
    is a non standard object available only in IE10 and older,
    this will stop JS from executing in those versions. */
  if (
    mceUtils.isPropertySupported(exampleChoiceList.dataset) &&
    !document.all
  ) {
    enableLiveEditor();
    mceEvents.onChoose(exampleChoices[initialChoice]);
    clippy.toggleClippy(exampleChoices[initialChoice]);
  }
})();
