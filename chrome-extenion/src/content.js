
console.log("Content script loaded");
function getPageContent() {
 
  const elements = document.body.innerText;
  console.log("🧾 Extracted content preview:", elements);
  return elements;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getPageContent") {
    const text = getPageContent();
    sendResponse({ content: text });
  }
});
