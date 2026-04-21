document.getElementById("fillTimeIn").addEventListener("click", async () => {
  const logType = document.getElementById("logType").value;

  // Get the active tab in the current window
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Send a message to the content.js script running on that tab
  chrome.tabs.sendMessage(tab.id, { action: "fillTimeIn", logType });
});
