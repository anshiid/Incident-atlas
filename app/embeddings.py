from sentence_transformers import SentenceTransformer
import os
import pickle

model = SentenceTransformer("all-MiniLM-L6-v2")

knowledge_folder = "data/knowledge"

chunks = []

for filename in os.listdir(knowledge_folder):

    if filename.endswith(".txt"):

        filepath = os.path.join(knowledge_folder, filename)

        with open(filepath, "r", encoding="utf-8") as file:
            text = file.read()

        sections = text.split("\n\n")

        for section in sections:

            section = section.strip()

            if section:
                chunks.append(section)

embeddings = model.encode(chunks)

with open("data/knowledge/embeddings.pkl", "wb") as file:
    pickle.dump(embeddings, file)

with open("data/knowledge/chunks.pkl", "wb") as file:
    pickle.dump(chunks, file)

print("Knowledge files processed:", len(os.listdir(knowledge_folder)))
print("Knowledge chunks created:", len(chunks))
print("Embeddings created successfully.")