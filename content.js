console.log("DTR Content Script loaded and waiting for commands...");

// --- HELPER FUNCTION: TEXT INPUTS ---
function fillTextInput(questionTitle, value) {
  console.log("Searching for text question: " + questionTitle + "...");

  // Find the span containing the question title
  const allTextElements = Array.from(
    document.querySelectorAll(".text-format-content"),
  );
  const questionSpan = allTextElements.find((el) =>
    el.textContent.trim().includes(questionTitle),
  );

  if (!questionSpan) {
    console.error(
      "FAILED: Could not find question containing '" + questionTitle + "'",
    );
    return;
  }

  // Find the container and the input box inside it
  const questionContainer = questionSpan.closest(
    '[data-automation-id="questionItem"]',
  );
  if (questionContainer) {
    const inputField = questionContainer.querySelector(
      'input[data-automation-id="textInput"]',
    );
    if (inputField) {
      inputField.value = value;
      inputField.dispatchEvent(new Event("input", { bubbles: true }));
      console.log("Successfully injected value for '" + questionTitle + "'.");
    } else {
      console.error(
        "FAILED: Found the question, but could not find the text input field.",
      );
    }
  }
}

// --- HELPER FUNCTION: DROPDOWNS ---
function selectDropdownOption(questionTitle, optionToSelect) {
  if (!optionToSelect) {
    console.log(
      "Skipping dropdown '" +
        questionTitle +
        "' because no value was provided.",
    );
    return;
  }

  console.log("Searching for dropdown question: " + questionTitle + "...");

  // Find the span containing the question title
  const allTextElements = Array.from(
    document.querySelectorAll(".text-format-content"),
  );
  // Using .includes() because MS Forms sometimes adds invisible spaces (&nbsp;)
  const questionSpan = allTextElements.find((el) =>
    el.textContent.trim().includes(questionTitle),
  );

  if (!questionSpan) {
    console.error(
      "FAILED: Could not find question containing '" + questionTitle + "'",
    );
    return;
  }

  // Find the container and click the dropdown button
  const questionContainer = questionSpan.closest(
    '[data-automation-id="questionItem"]',
  );
  const dropdownButton = questionContainer.querySelector(
    '[role="button"][aria-haspopup="listbox"]',
  );

  if (dropdownButton) {
    dropdownButton.click();
    console.log(
      "Opened dropdown for '" +
        questionTitle +
        "'. Waiting 300ms for menu to render...",
    );

    // Wait for animation, then click the option
    setTimeout(() => {
      const allOptions = Array.from(
        document.querySelectorAll('[role="option"]'),
      );
      const targetOption = allOptions.find(
        (el) => el.textContent.trim() === optionToSelect,
      );

      if (targetOption) {
        targetOption.click();
        console.log(
          "Successfully selected '" +
            optionToSelect +
            "' for '" +
            questionTitle +
            "'.",
        );
      } else {
        console.error(
          "FAILED: Could not find option '" + optionToSelect + "' in the list.",
        );
      }
    }, 300); // 300ms delay
  } else {
    console.error(
      "FAILED: Could not find a dropdown button for '" + questionTitle + "'",
    );
  }
}

// --- HELPER FUNCTION: RESET FORM ---
function resetForm() {
  console.log("Resetting all injected values...");

  // Reset all text inputs
  const allTextInputs = Array.from(
    document.querySelectorAll('input[data-automation-id="textInput"]'),
  );
  allTextInputs.forEach((input) => {
    input.value = "";
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });

  // Reset all dropdown selections
  const allDropdowns = Array.from(
    document.querySelectorAll('[role="button"][aria-haspopup="listbox"]'),
  );
  allDropdowns.forEach((dropdown) => {
    // Clear the aria-label to reset the dropdown display
    dropdown.setAttribute("aria-label", "");
  });

  console.log("Form reset completed.");
}

// --- PAGE REFRESH/UNLOAD LISTENER ---
window.addEventListener("beforeunload", () => {
  resetForm();
});

// --- FORM SUBMISSION LISTENER ---
document.addEventListener("submit", (e) => {
  console.log("Form submitted. Resetting injected values...");
  resetForm();
});

// --- MAIN EVENT LISTENER ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received from popup:", request);

  if (request.action === "fillTimeIn") {
    console.log("Action 'fillTimeIn' triggered. Filling out form...");
    const selectedLogType = request.logType || "In";
    const locationValue = "";
    const siteValue = "";

    // 1. Complete Name (From config)
    fillTextInput("Complete Name", DTR_CONFIG.fullName);

    // 2. EID (From config)
    fillTextInput("EID", DTR_CONFIG.eid);

    // 3. Type of Log (Dynamic from extension popup)
    selectDropdownOption("Type of Log", selectedLogType);

    // 4. Location (Skipped / Manual)
    selectDropdownOption("Location", locationValue);

    // 5. Mentor's Name (From config)
    fillTextInput("Name of Mentor", DTR_CONFIG.mentorName);

    // 6. Site (Skipped / Manual)
    selectDropdownOption("Site (Intern Location)", siteValue);

    console.log("DTR Auto-Fill routine initiated.");
  }
});
