from app.semantic_search import search_knowledge
from app.local_llm import ask_qwen


def answer_question(question):

    # Step 1: Search the knowledge base
    relevant_information, similarity_score = search_knowledge(question)

    # Step 2: Give the retrieved information to Qwen
    prompt = f"""
You are an AI incident investigation assistant.

Analyze the user's technical problem using ONLY the provided technical knowledge.

Technical knowledge:
{relevant_information}

User question:
{question}

Give the response in this simple format:

### Problem
Briefly explain what is happening.

### Likely Cause
Explain the most likely cause based on the technical knowledge.

### Investigation Steps
1. Give the first thing to check.
2. Give the second thing to check.
3. Give the third thing to check.

### Recommended Actions
Give practical actions that can help resolve the problem.

Important:
- Do not invent information.
- Only use information supported by the technical knowledge.
- Keep the answer clear and practical.
"""

    answer = ask_qwen(prompt)

    return answer, similarity_score


