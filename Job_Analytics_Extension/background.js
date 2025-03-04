chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyzeJob") {
    console.log("Job skills received:", request.jobSkills);
    // Perform any background tasks here
  }
});
