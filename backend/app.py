import os
import fitz  # PyMuPDF
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
CORS(app)


genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')

def analyze_with_ai(resume_text, job_desc):
    
    prompt = f"""
You are a professional Recruitment AI Agent.
Analyze the match between the Job Description and the Resume provided.

JOB DESCRIPTION:
{job_desc}

RESUME TEXT:
{resume_text}

Make sure that the response is crisp but accurate.
Please provide the output in this EXACT format:
OVERALL MATCH: [Percentage]%

TECHNICAL GAP ANALYSIS:
- [List specific missing hard skills]

SOFT SKILLS & QUALIFICATIONS:
[Mention gaps]

AI IMPROVEMENT PLAN:
- [Actionable steps]

GRAMMAR & PROFESSIONALISM:
- [Score out of 10]
"""
    response = model.generate_content(prompt)
    return response.text

@app.route('/api/analyze', methods=['POST'])
def analyze_resume():
    try:
        # Use Flask's request object instead of Colab's upload widget [cite: 39]
        resume_file = request.files['resume']
        job_description = request.form['job_description']
        
        
        doc = fitz.open(stream=resume_file.read(), filetype="pdf")
        text = "".join([page.get_text() for page in doc])
        
        analysis = analyze_with_ai(text, job_description)
        return jsonify({'analysis': analysis}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
if __name__ == '__main__':

    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get("PORT", 5000)))