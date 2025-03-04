document.addEventListener("DOMContentLoaded", function () {
  let skillsList = [];

  // Load skills from skills.json
  fetch(chrome.runtime.getURL("skills.json"))
    .then((response) => response.json())
    .then((data) => {
      skillsList = data.skills;
      console.log("Skills loaded:", skillsList);
    })
    .catch((error) => console.error("Error loading skills.json:", error));

  // Function to normalize text
  function normalizeText(text) {
    return text.toLowerCase().trim();
  }

  // Function to extract job description from the page
  function extractJobDescription() {
    const jobDescriptionElement =
      document.querySelector(".jobs-description__content") ||
      document.querySelector(".show-more-less-html") ||
      document.querySelector('[class*="description"]');

    if (!jobDescriptionElement) {
      console.error("Job description not found!");
      return "";
    }

    return jobDescriptionElement.innerText;
  }

  // Function to extract skills from text
  function extractSkills(text) {
    const lowercaseText = normalizeText(text);
    const foundSkills = skillsList.filter((skill) => {
      const regex = new RegExp(`\\b${skill.toLowerCase()}\\b`, "g");
      return regex.test(lowercaseText);
    });
    return foundSkills;
  }

  // Function to calculate match percentage
  function calculateMatchPercentage(resumeSkills, jobSkills) {
    if (jobSkills.length === 0) return 0; // Avoid division by zero
    const matchedSkills = jobSkills.filter((skill) =>
      resumeSkills.includes(skill)
    );
    return ((matchedSkills.length / jobSkills.length) * 100).toFixed(2);
  }

  // Function to match resume with job description
  function matchResumeWithJob(resumeText, jobDescription) {
    const resumeSkills = extractSkills(resumeText);
    const jobSkills = extractSkills(jobDescription);

    console.log("Resume Skills:", resumeSkills);
    console.log("Job Skills:", jobSkills);

    const matchPercentage = calculateMatchPercentage(resumeSkills, jobSkills);
    const missingSkills = jobSkills.filter(
      (skill) => !resumeSkills.includes(skill)
    );

    return {
      matchPercentage,
      jobSkills,
      missingSkills,
    };
  }

  // Event listener for analyze button click
  document
    .getElementById("analyzeButton")
    .addEventListener("click", async function () {
      const resumeText = document.getElementById("resumeText").value;

      // Get the active tab
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      // Execute the content script to extract the job description
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          function: extractJobDescription,
        },
        (result) => {
          const jobDescription = result[0].result;
          console.log("Extracted Job Description:", jobDescription);
          console.log("Uploaded Resume:", resumeText);

          // Match resume with job description
          const analysis = matchResumeWithJob(resumeText, jobDescription);
          console.log("Final Match Analysis:", analysis);

          // Display results in the popup
          document.getElementById(
            "matchPercentage"
          ).textContent = `${analysis.matchPercentage}%`;
          document.getElementById("requiredSkills").textContent =
            analysis.jobSkills.join(", ");
          document.getElementById("missingSkills").textContent =
            analysis.missingSkills.join(", ");
        }
      );
    });
});
