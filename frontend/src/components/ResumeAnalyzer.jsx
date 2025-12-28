import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, Zap, Moon, Sun, ChevronRight, AlertCircle } from 'lucide-react';
import './ResumeAnalyzer.css';

export default function ResumeAnalyzer() {
  const [theme, setTheme] = useState('dark');
  const [jobDescription, setJobDescription] = useState('');
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const isDark = theme === 'dark';

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile?.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please upload a PDF file only');
      setFile(null);
    }
  };

  // FIXED: Removed the nested function and corrected the try/catch block
  const handleAnalyze = async () => {
    if (!jobDescription || !file) {
      setError('Please provide both job description and resume');
      return;
    }
    
    setAnalyzing(true);
    setError(null);
    setResult(null);
    
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('job_description', jobDescription);

    try {
      
      const response = await axios.post('https://resume-analyzer-backend-api.onrender.com/api/analyze', formData);
      
      // Successfully sets the raw text report from the agent [cite: 30, 53]
      setResult(response.data.analysis);
    } catch (err) {
      setError(err.response?.data?.error || "Check if your Python server is running!");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className={`app-container ${isDark ? 'dark-theme' : 'light-theme'}`}>
      <div className="content-wrapper">
        <div className="header">
          <div className="header-left">
            <div className={`logo-container ${isDark ? 'dark' : 'light'}`}>
              <Zap className="logo-icon" />
            </div>
            <div>
              <h1 className="title">AI Resume Analyzer</h1>
              <p className="subtitle">Powered by Gemini 2.5 Flash</p>
            </div>
          </div>
          <button onClick={() => setTheme(isDark ? 'light' : 'dark')} className="theme-toggle">
            {isDark ? <Sun /> : <Moon />}
          </button>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle className="error-icon" />
            <span>{error}</span>
          </div>
        )}

        <div className="main-grid">
          <div className={`card ${isDark ? 'dark' : 'light'}`}>
            <label className="card-label">Job Description</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste JD here..."
              className="textarea"
            />
          </div>

          <div className={`card ${isDark ? 'dark' : 'light'}`}>
            <label className="card-label">Resume Upload</label>
            <div className="upload-area" onClick={() => document.getElementById('fileInput').click()}>
              <input id="fileInput" type="file" accept=".pdf" onChange={handleFileChange} hidden />
              {file ? (
                <div className="file-display">
                  <FileText className="file-icon" />
                  <p>{file.name}</p>
                </div>
              ) : (
                <div className="upload-prompt">
                  <Upload className="upload-icon" />
                  <p>Click to upload PDF</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <button 
          onClick={handleAnalyze} 
          disabled={analyzing || !file || !jobDescription} 
          className={`analyze-button ${analyzing ? 'loading' : ''}`}
        >
          {analyzing ? (
            <>
              <div className="spinner" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <span>Analyze Resume</span>
              <ChevronRight className="button-icon" />
            </>
          )}
        </button>

        {result && (
          <div className="results-container">
            <h2 className="results-title">AI Agent Final Report</h2>
            <div className="report-box">
              {/* This pre tag preserves the exact formatting from your Colab output [cite: 53, 70] */}
              <pre style={{ whiteSpace: 'pre-wrap', textAlign: 'left', padding: '20px' }}>
                {result}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}