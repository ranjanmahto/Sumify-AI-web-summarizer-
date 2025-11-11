
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetchWebContent") {
    (async () => {
      try {
        // Get the active tab
        const [tab] = await new Promise((resolve) => {
          chrome.tabs.query({ active: true, currentWindow: true }, resolve);
        });

        // Ask content script for page content
        const response = await new Promise((resolve, reject) => {
          chrome.tabs.sendMessage(tab.id, { action: "getPageContent" }, (res) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
              return;
            }
            if (!res?.content) {
              reject(new Error("No content found"));
              return;
            }
            resolve(res);
          });
        });

        // Send content to backend API
        const backendURL = "http://localhost:8000/summarize";
        const result = await fetch(backendURL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: response.content }),
        });

        const data = await result.json();
        console.log("✅ Received summary:", data);

        sendResponse({ success: true, data });
      } catch (err) {
        console.error("Error in fetchWebContent:", err);
        sendResponse({ success: false, error: err.message || "Unknown error" });
      }
    })();

    
    return true; // Indicates async response
  }

  if (request.action === "getSessionId") {
    console.log("background.js: getSessionId request received");
    (async () => {
      try {
        console.log("background.js: getSessionId called");
        const [tab] = await new Promise((resolve) => {
          chrome.tabs.query({ active: true, currentWindow: true }, resolve);
        });

        const response = await new Promise((resolve, reject) => {
          chrome.tabs.sendMessage(tab.id, { action: "getPageContent" }, (res) => {
            if (!res?.content) reject("No content found");
            else resolve(res);
          });
        });

        const backendURL = "http://localhost:8000/create_session";
        const sessionResponse = await fetch(backendURL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: response.content }),
        });
        const sessionData = await sessionResponse.json();

        console.log("background.js: Session response received", sessionData);
        

        await chrome.storage.local.set({
          sessionId: sessionData.session_id,
        });

        sendResponse({
          success: true,
          sessionId: sessionData.session_id,
        });
        
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    })();

    return true;
  }

  if (request.action === "askQuestion") {
    (async () => {
      try {
        console.log("background.js: askQuestion called with question:", request.question);
        const storedData = await chrome.storage.local.get(["sessionId"]);
        console.log("background.js: Retrieved sessionId", storedData.sessionId);
        const sessionId = storedData.sessionId;

        const backendURL = "http://localhost:8000/ask";
        const answer = await fetch(backendURL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body:  JSON.stringify({ session_id: sessionId, question: request.question })
        });
        const actualAnswer = await answer.json();
        console.log("background.js: Answer received", actualAnswer);
        sendResponse({ success: true, data: { answer: actualAnswer.answer } });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    })();

    return true;
  }
});


chrome.tabs.onRemoved.addListener(async (tabId) => {
  try {
    const storedData = await chrome.storage.local.get(["sessionId"]);
    const sessionId = storedData.sessionId;

    if (sessionId) {
      await fetch("http://localhost:8000/close_session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });

      // Clear the stored session ID
      await chrome.storage.local.remove("sessionId");
    }
  } catch (err) {
    console.error("Error closing session:", err);
  }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const storedData = await chrome.storage.local.get(["sessionId"]);
    const sessionId = storedData.sessionId;

    if (sessionId) {
      await fetch("http://localhost:8000/close_session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });

      // Clear the stored session ID
      await chrome.storage.local.remove("sessionId");
    }
  } catch (err) {
    console.error("Error closing session:", err);
  }
});
