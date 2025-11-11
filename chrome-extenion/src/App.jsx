import { useEffect, useRef, useState } from "react";
import "./App.css";
import Logo from "./Logo";
import LoadingSummary from "./LoadingSummary";
import LoadingAskMode from "./LoadingAskMode";

function App() {
  const messagesEndRef = useRef(null);
  const [mode, setMode] = useState("");
  const [initialMessageForAskMode, setInitialMessageForAskMode] = useState({
    message: "Initiating ask mode...",
    showInput: false,
  });
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [isAskModeLoading, setIsAskModeLoading] = useState(true);
  const [summary, setSummary] = useState(
    ""
  );
  const [query, setQuery] = useState("");
  const [qna, setQna] = useState([]);

  const summarizePageContent = () => {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: "fetchWebContent", mode: "summarize" },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else if (!response) {
            reject(new Error("No response from background"));
          } else {
            resolve(response);
          }
        }
      );
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const onSummerizeClick = async () => {
    setMode("summarize");
    setIsSummaryLoading(true);
   
    const response = await summarizePageContent();
  
    if (response?.success) {
      console.log("Summary received:", response.data.summary);
      setSummary(response.data.summary || "No summary found");
      setIsSummaryLoading(false);
    } else {
      setSummary("Error fetching summary.");
      console.log("Summary received:", response.error);
    }
  };
  const onAskClick = () => {
    setMode("ask");
    setIsAskModeLoading(true);
    console.log("Ask button clicked");
    chrome.runtime.sendMessage(
      {
        action: "getSessionId",
        mode: "ask",
      },
      (response) => {
        if (response?.success) {
          setInitialMessageForAskMode({
            message: "Ask Mode Active",
            showInput: true,
          });
          setIsAskModeLoading(false);
        }
      }

    );
    console.log("after getting the response");
  };
  const handleInputKeyDown = async (e) => {
    if (e.key === "Enter" && query.trim()) {
      e.preventDefault();

      setQna([...qna, { type: "question", text: query, error: "0" }]);
      chrome.runtime.sendMessage(
        { action: "askQuestion", question: query },
        (response) => {
          if (response?.success) {
            console.log("Answer received in App.jsx:", response.data.answer);
            setQna((prevQna) => [
              ...prevQna,
              { type: "answer", text: response.data.answer, error: "0" },
            ]);
          }
        }
      );
      setQuery("");
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [qna]);

  return (
    <>
      <div className="relative overflow-hidden ">
        <div className="absolute inset-0 bg-linear-to-r from-indigo-100 via-white to-pink-100 animate-gradient-x"></div>
        <div className="relative z-10 p-4">
          <Logo />
          <div className=" flex  gap-4 items-center justify-center ">
            <button className="rounded-3xl p-2  " onClick={onSummerizeClick}>
              Summerize
            </button>
            <button className="rounded-3xl p-2  " onClick={onAskClick}>
              Ask
            </button>
          </div>

          {mode === "summarize" && (
            <div>
              {isSummaryLoading ? <LoadingSummary/> : <h2>Summary</h2>}
              <p>{summary}</p>
            </div>
          )}

          {mode === "ask" && (
            <div>
              <p className=" text-center ">
                {isAskModeLoading? <LoadingAskMode/> :"Ask Mode Active"}
              </p>
              <div>
                {qna.map((item, index) => (
                  <div key={index} className="mb-4 flex ">
                    {item.type === "question" ? (
                      <p className="font-bold text-left  ">Q: {item.text}</p>
                    ) : (
                      <p
                        className={`ml-4  text-right ${
                          item.error === "1" && "text-red-500"
                        } `}
                      >
                        A: {item.text}
                      </p>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {initialMessageForAskMode.showInput && (
                <input
                  type="text"
                  placeholder="Ask anything"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  className="border border-black p-2 rounded w-full mt-4"
                />
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default App;
