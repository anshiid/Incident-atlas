from sentence_transformers import SentenceTransformer
import numpy as np
import pickle


model = SentenceTransformer("all-MiniLM-L6-v2")


def load_knowledge():
    with open("data/knowledge/chunks.pkl", "rb") as file:
        chunks = pickle.load(file)

    with open("data/knowledge/embeddings.pkl", "rb") as file:
        embeddings = pickle.load(file)

    return chunks, embeddings


def search_knowledge(question, top_k=3):

    chunks, embeddings = load_knowledge()

    question_embedding = model.encode(question)

    similarities = []

    for chunk_embedding in embeddings:

        similarity = np.dot(
            question_embedding,
            chunk_embedding
        ) / (
            np.linalg.norm(question_embedding)
            * np.linalg.norm(chunk_embedding)
        )

        similarities.append(similarity)

    best_indices = np.argsort(similarities)[-top_k:][::-1]

    best_chunks = []

    for index in best_indices:
        best_chunks.append(chunks[index])

    best_score = similarities[best_indices[0]]

    return "\n\n".join(best_chunks), best_score


if __name__ == "__main__":

    question = "Why are payment requests failing?"

    result, score = search_knowledge(question)

    print("Question:")
    print(question)

    print("\nMost relevant information:")
    print(result)

    print("\nSimilarity score:", round(score, 3))