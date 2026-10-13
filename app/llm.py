import os
from openai import OpenAI


client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY")
)


response = client.responses.create(
    model="gpt-5.6-luna",
    input="Explain what a database connection timeout means in one sentence."
)


print(response.output_text)