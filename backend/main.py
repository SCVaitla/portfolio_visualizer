from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
import jsbeautifier
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Configure Gemini with the API key from .env
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in environment variables.")
genai.configure(api_key=api_key)

model = genai.GenerativeModel(model_name="models/gemini-2.0-flash")

app = FastAPI()

app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)


def extract_text(file: UploadFile) -> str:
    content = file.file.read()
    return content.decode("utf-8")


@app.post("/generate")
async def generate(file: UploadFile = File(...)):
    resume_text = extract_text(file)
    prompt = f"""
    You are a frontend engineer. Based on the resume below, generate a clean, single-page portfolio website in Swiss-style HTML/CSS.
    Sections: Profile, Experience, Education, Projects, Skills, Contact. Also create a pie chart based upon the skills and experience mentioned in the resume.

    Resume:
    {resume_text}

    Return only the code inside a single HTML file (with inline CSS if needed).
    """
    response = model.generate_content(prompt)
    raw_code = response.text
    formatted = jsbeautifier.beautify(raw_code)
    return {"html_code": formatted}
