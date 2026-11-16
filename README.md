# Incident Atlas

Incident Atlas detects unusual system activity and investigates technical problems using machine learning, retrieval-augmented generation (RAG), semantic search, and a local large language model.

## Project Overview

Incident Atlas combines machine learning and generative AI to identify and investigate technical issues.

The system can:

- Detect unusual system activity
- Calculate anomaly scores
- Classify problem severity
- Identify the affected service
- Search a technical knowledge base
- Generate AI-powered investigation reports
- Display results through a web interface

## Technologies Used

- Python
- FastAPI
- Scikit-learn
- Isolation Forest
- Pandas
- Semantic Search
- RAG (Retrieval-Augmented Generation)
- Qwen3
- Ollama
- HTML
- CSS
- JavaScript

## System Architecture

```text
System Data
     |
     v
Isolation Forest
     |
     v
Anomaly Detection
     |
     v
Severity + Affected Service
     |
     v
FastAPI
     |
     v
Semantic Search
     |
     v
Knowledge Base
     |
     v
RAG
     |
     v
Qwen3 / Ollama
     |
     v
AI Investigation
     |
     v
Web Interface