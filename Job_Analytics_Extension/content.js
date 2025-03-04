// Function to extract job description from the page
function extractJobDescription() {
  let jobDescriptionElement = document.querySelector(
    ".jobs-description__content"
  );

  if (!jobDescriptionElement) {
    console.error("Job description not found!");
    return "";
  }

  return jobDescriptionElement.innerText;
}

// Function to calculate match percentage between resume skills and job skills
function calculateMatchPercentage(resumeSkills, jobSkills) {
  if (!resumeSkills || !jobSkills) {
    return 0;
  }
  const matchedSkills = jobSkills.filter((skill) =>
    resumeSkills.map((s) => s.toLowerCase()).includes(skill.toLowerCase())
  );
  return ((matchedSkills.length / jobSkills.length) * 100).toFixed(2);
}

// Chrome runtime listener for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyzeJob") {
    const jobSkills = request.jobSkills;
    const matchPercentage = calculateMatchPercentage(resumeSkills, jobSkills);
    const missingSkills = jobSkills.filter(
      (skill) =>
        !resumeSkills.map((s) => s.toLowerCase()).includes(skill.toLowerCase())
    );

    document.getElementById(
      "matchPercentage"
    ).textContent = `${matchPercentage}%`;
    document.getElementById("requiredSkills").textContent =
      jobSkills.join(", ");
    document.getElementById("missingSkills").textContent =
      missingSkills.join(", ");
  }
});

// Debugging: Print extracted text
console.log("Extracted Job Description:", extractJobDescription());
