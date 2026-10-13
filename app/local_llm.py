import json
import urllib.request


def ask_qwen(question):

    url = "http://localhost:11434/api/generate"

    data = {
        "model": "qwen3:4b",
        "prompt": question,
        "stream": False
    }

    request = urllib.request.Request(
        url,
        data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )

    response = urllib.request.urlopen(request)

    result = json.loads(response.read().decode("utf-8"))

    return result["response"]


question = "What causes database connection timeouts?"

answer = ask_qwen(question)

print("Question:")
print(question)

print("\nQwen's answer:")
print(answer)