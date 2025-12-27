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
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please upload a PDF file only');
        setFile(null);
      }
    }
  };

  const parseAIResponse = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    
    let match = 0;
    let technicalGaps = [];
    let softSkills = [];
    let improvements = [];
    let grammar = 0;
    
    let currentSection = '';
    
    for (let line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.includes('OVERALL MATCH:')) {
        const matchStr = trimmed.match(/(\d+)%/);
        if (matchStr) match = parseInt(matchStr[1]);
      } else if (trimmed.includes('TECHNICAL GAP ANALYSIS:')) {
        currentSection = 'technical';
      } else if (trimmed.includes('SOFT SKILLS')) {
        currentSection = 'soft';
      } else if (trimmed.includes('AI IMPROVEMENT PLAN:')) {
        currentSection = 'improvements';
      } else if (trimmed.includes('GRAMMAR')) {
        currentSection = 'grammar';
        const grammarMatch = trimmed.match(/(\d+)\/10/);
        if (grammarMatch) grammar = parseInt(grammarMatch[1]);
      } else if (trimmed.startsWith('-')) {
        const content = trimmed.substring(1).trim();
        if (currentSection === 'technical') {
          technicalGaps.push(content);
        } else if (currentSection === 'soft') {
          softSkills.push(content);
        } else if (currentSection === 'improvements') {
          improvements.push(content);
        }
      }
    }
    
    return { match, technicalGaps, softSkills, improvements, grammar };
  };

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
      const response = await axios.post('/api/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const parsedResult = parseAIResponse(response.data.analysis);
      setResult(parsedResult);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred during analysis');
      console.error('Error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className={`app-container ${isDark ? 'dark-theme' : 'light-theme'}`}>
      <div className="content-wrapper">
        {/* Header */}
        <div className="header">
          <div className="header-left">
            <div className={`logo-container ${isDark ? 'dark' : 'light'}`}>
              <Zap className="logo-icon" />
            </div>
            <div>
              <h1 className="title">AI Resume Analyzer</h1>
              <p className="subtitle">Powered by Advanced AI Technology</p>
            </div>
          </div>
          
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`theme-toggle ${isDark ? 'dark' : 'light'}`}
          >
            {isDark ? <Sun className="icon" /> : <Moon className="icon" />}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <AlertCircle className="error-icon" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Content */}
        <div className="main-grid">
          {/* Job Description Input */}
          <div className={`card ${isDark ? 'dark' : 'light'}`}>
            <label className="card-label">Job Description</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className={`textarea ${isDark ? 'dark' : 'light'}`}
            />
          </div>

          {/* Resume Upload */}
          <div className={`card ${isDark ? 'dark' : 'light'}`}>
            <label className="card-label">Resume Upload</label>
            <div
              className={`upload-area ${isDark ? 'dark' : 'light'} ${file ? 'has-file' : ''}`}
              onClick={() => document.getElementById('fileInput').click()}
            >
              <input
                id="fileInput"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="file-input"
              />
              
              {file ? (
                <div className="file-display">
                  <FileText className="file-icon success" />
                  <p className="file-name">{file.name}</p>
                  <p className="file-hint">Click to change file</p>
                </div>
              ) : (
                <div className="upload-prompt">
                  <Upload className="upload-icon" />
                  <p className="upload-text">Click to upload resume</p>
                  <p className="upload-hint">PDF files only</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
          disabled={!jobDescription || !file || analyzing}
          className={`analyze-button ${!jobDescription || !file || analyzing ? 'disabled' : ''} ${isDark ? 'dark' : 'light'}`}
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

        {/* Results */}
        {result && (
          <div className={`results-container ${isDark ? 'dark' : 'light'}`}>
            <h2 className="results-title">Analysis Results</h2>

            {/* Match Score */}
            <div className={`match-score ${isDark ? 'dark' : 'light'}`}>
              <div className="match-header">
                <span className="match-label">Overall Match</span>
                <span className={`match-value ${
                  result.match >= 80 ? 'high' : result.match >= 60 ? 'medium' : 'low'
                }`}>
                  {result.match}%
                </span>
              </div>
              <div className={`progress-bar ${isDark ? 'dark' : 'light'}`}>
                <div
                  className={`progress-fill ${
                    result.match >= 80 ? 'high' : result.match >= 60 ? 'medium' : 'low'
                  }`}
                  style={{ width: `${result.match}%` }}
                />
              </div>
            </div>

            {/* Technical Gaps */}
            {result.technicalGaps.length > 0 && (
              <div className="section">
                <h3 className="section-title">Technical Gap Analysis</h3>
                <ul className="section-list">
                  {result.technicalGaps.map((gap, index) => (
                    <li key={index} className={`list-item ${isDark ? 'dark' : 'light'}`}>
                      {gap}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Soft Skills */}
            {result.softSkills.length > 0 && (
              <div className="section">
                <h3 className="section-title">Soft Skills & Qualifications</h3>
                <ul className="section-list">
                  {result.softSkills.map((skill, index) => (
                    <li key={index} className={`list-item ${isDark ? 'dark' : 'light'}`}>
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improvements */}
            {result.improvements.length > 0 && (
              <div className="section">
                <h3 className="section-title">AI Improvement Plan</h3>
                <ul className="section-list">
                  {result.improvements.map((improvement, index) => (
                    <li key={index} className={`list-item ${isDark ? 'dark' : 'light'}`}>
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Grammar Score */}
            <div className={`grammar-score ${isDark ? 'dark' : 'light'}`}>
              <span className="grammar-label">Grammar & Professionalism</span>
              <span className={`grammar-value ${
                result.grammar >= 8 ? 'high' : result.grammar >= 6 ? 'medium' : 'low'
              }`}>
                {result.grammar}/10
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}