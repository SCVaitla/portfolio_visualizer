from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import google.generativeai as genai
import jsbeautifier
import os

# Load .env variables
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in environment variables.")

# Configure Gemini API
genai.configure(api_key=api_key)
model = genai.GenerativeModel(model_name="models/gemini-2.0-flash")

# Initialize FastAPI
app = FastAPI()
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)


# Helper function to extract plain text from file
def extract_text(file: UploadFile) -> str:
    content = file.file.read()
    return content.decode("utf-8")


# POST endpoint to generate portfolio HTML
@app.post("/generate")
async def generate(file: UploadFile = File(...)):
    resume_text = extract_text(file)

    prompt = f"""
You are a world-class frontend developer and designer.

Create a sleek, modern, and professional single-page portfolio website inspired by Apple's minimalist design aesthetic, using clean HTML and CSS.

Here is the resume content:
\"\"\"
{resume_text}
\"\"\"

### Requirements:
1. Sections:
   - Hero (name, title, tagline)
   - About / Profile
   - Work Experience
   - Education
   - Projects
   - Skills (as an **interactive pie chart** using Chart.js)
   - Contact
   - Achievements (if available)

2. Design Guidelines:
   - Swiss/Apple-style: generous whitespace, clean typography, strong visual hierarchy
   - Mobile responsive layout
   - Use **inline CSS** or scoped `<style>` tags
   - Embed **Chart.js via CDN** to create the skills pie chart
   - Create a `<canvas>` element in the Skills section and populate it with a Chart.js pie chart.
   - Use sample data if exact skill percentages are not extractable from resume

3. Output:
Return only the code of a single `.html` file with inline styles and Chart.js JavaScript embedded. Do not include explanations or markdown formatting.
    """

    response = model.generate_content(prompt)
    raw_code = response.text
    formatted = jsbeautifier.beautify(raw_code)

    return {"html_code": formatted}
