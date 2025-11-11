import uuid 
from typing import Optional,Dict,Any
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

#langchain imports
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.docstore.document import Document
from langchain.chains.summarize import load_summarize_chain
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings, ChatOpenAI

load_dotenv()
app = FastAPI()

app.add_middleware(CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],)

llm= ChatOpenAI()
embeddings = OpenAIEmbeddings()

SESSIONS: Dict[str, Dict[str, Any]] = {}

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1500, chunk_overlap=200)

class CreateSessionRequest(BaseModel):
    text: str
    url: Optional[str] = None


class CreateSessionResponse(BaseModel):
    session_id: str
    chunks: int


class AskRequest(BaseModel):
    session_id: str
    question: str
    


class AskResponse(BaseModel):
    answer: str
    


class SummarizeRequest(BaseModel):
    session_id: Optional[str] = None
    text: Optional[str] = None


class CloseSessionRequest(BaseModel):
    session_id: str



@app.post("/create_session", response_model=CreateSessionResponse)
async def create_session(request: CreateSessionRequest):
    session_id = str(uuid.uuid4())
    documents = text_splitter.split_text(request.text)
    docs = [Document(page_content=doc) for doc in documents]
    vector_db= FAISS.from_documents(docs, embeddings)
    SESSIONS[session_id]={
        "vectorStore":vector_db,
        "url":request.url,
        "chunks":len(docs)
    }

    return {"session_id": session_id, "chunks": len(docs)}


@app.post("/ask", response_model=AskResponse)
async def ask(req: AskRequest):
    """
    Retrieve relevant docs and answer the question using ChatOpenAI.
    """
    print(f"Received question: {req.question} for session: {req.session_id}")
    session = SESSIONS.get(req.session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    vectordb: FAISS = session["vectorStore"]
    # Get relevant documents
    relevant_docs = vectordb.similarity_search(req.question, k=8)
    
    # Construct the prompt with context
    context = "\n\n".join([doc.page_content for doc in relevant_docs])
    prompt = f"""Use the following context to answer the question and If you know something from your side then please add on for more clarity on the information  .
    
                Context: {context}
                Below is the question to be answered.
                Question: {req.question}

                Answer:"""

    # Generate answer using the LLM
    response = await llm.ainvoke([{
        "role": "user",
        "content": prompt
    }])

    return {"answer": response.content}
    


@app.post("/summarize")
async def summarize(req: SummarizeRequest):
    """
    Summarize the text directly using LLM.
    This version does NOT use the vector database or sessions.
    """
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="Text is required for summarization")

    # Split the text into manageable chunks for summarization
    docs = text_splitter.create_documents([req.text])

    # Load LangChain's built-in summarization chain
    chain = load_summarize_chain(llm, chain_type="map_reduce")

    # Generate the summary
    summary = await chain.ainvoke(docs)

    return {"summary": summary["output_text"]}

@app.post("/close_session")
async def close_session(req: CloseSessionRequest):
    """
    Explicitly close and delete a session (free memory).
    """
    if req.session_id in SESSIONS:
        try:
            # FAISS has no explicit close in-memory; just delete reference
            del SESSIONS[req.session_id]
        except Exception:
            pass
    return {"closed": True}