# 🧭 Incident Atlas
### AI-Powered System Anomaly Detection & Incident Investigation

Incident Atlas is an AI-powered system designed to detect unusual system activity and investigate technical problems using machine learning, Retrieval-Augmented Generation (RAG), semantic search, and a locally running Large Language Model (LLM).

It combines anomaly detection with AI-powered investigation to help identify potential system issues, understand their context, and generate investigation reports.

---

## 🚀 Project Overview

Incident Atlas integrates machine learning and generative AI into a unified incident investigation workflow.

The system analyzes system data, detects unusual patterns, identifies affected services, and uses a technical knowledge base to generate contextual investigation reports.

### Key Features

- **Anomaly Detection:** Identifies unusual system activity using the Isolation Forest algorithm.
- **Anomaly Scoring:** Calculates anomaly scores to help assess unusual behavior.
- **Severity Classification:** Classifies detected problems by severity.
- **Affected Service Identification:** Identifies the service associated with a detected issue.
- **Semantic Search:** Retrieves relevant technical information from a knowledge base.
- **Retrieval-Augmented Generation (RAG):** Combines retrieved information with an LLM to generate contextual responses.
- **AI Investigation Reports:** Generates AI-powered explanations and investigation reports.
- **Local LLM Integration:** Uses Qwen3 through Ollama for local AI inference.
- **Web Interface:** Provides a frontend for interacting with the investigation system.

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| Python | Core application development |
| FastAPI | Backend API development |
| Scikit-learn | Machine learning |
| Isolation Forest | Anomaly detection |
| Pandas | Data processing |
| Semantic Search | Relevant information retrieval |
| RAG | Context-aware AI investigation |
| Qwen3 | Large Language Model |
| Ollama | Local LLM execution |
| HTML | Frontend structure |
| CSS | Frontend styling |
| JavaScript | Frontend functionality |

---

## 🏗️ System Architecture

Incident Atlas follows a pipeline that combines machine learning, information retrieval, and generative AI.

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
       Severity Classification
                  |
                  v
       Affected Service Identification
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
```

---

## 🧠 How It Works

1. **Data Analysis:** The system processes incoming system data.
2. **Anomaly Detection:** Isolation Forest identifies unusual patterns in the data.
3. **Issue Assessment:** The system calculates anomaly scores, classifies severity, and identifies affected services.
4. **Information Retrieval:** Semantic search retrieves relevant information from the technical knowledge base.
5. **AI Investigation:** RAG provides relevant context to Qwen3 through Ollama.
6. **Report Generation:** The AI generates an investigation response based on the retrieved information.
7. **User Interaction:** Results are presented through the web interface.

---

## 📁 Project Structure

```text
Incident-atlas/
│
├── app/
│   ├── api.py
│   ├── embeddings.py
│   ├── llm.py
│   ├── local_llm.py
│   ├── main.py
│   ├── ml_model.py
│   ├── rag.py
│   └── semantic_search.py
│
├── data/
│   └── Knowledge base and project data
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── .gitignore
├── README.md
└── requirements.txt
```

---

## ⚙️ Technologies & AI Components

**Isolation Forest**

An unsupervised machine learning algorithm used to identify unusual patterns in system data.

**FastAPI**

Provides API endpoints that connect the frontend with the backend functionality.

**Semantic Search & RAG**

Semantic search retrieves relevant technical information, while RAG supplies that information as context for AI-generated investigation responses.

**Qwen3 with Ollama**

Runs the language model locally to generate AI-powered investigation responses.

---

## 🔒 Privacy & Local Processing

Incident Atlas uses Ollama to run Qwen3 locally for language model inference.

This allows the LLM component to operate without depending on a paid external LLM API.

---

## 🎯 Project Goal

The goal of Incident Atlas is to combine machine learning and generative AI to make technical incident investigation more efficient by identifying unusual system behavior and generating contextual explanations.

---

## 👨‍💻 Author

**Anshid Ismail**

GitHub: [@anshiid](https://github.com/anshiid)

---

## 📄 License

This project is currently maintained as a private repository.
