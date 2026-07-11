import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv("C:\\Users\\yuvan\\OneDrive\\Documents\\phytonexus\\backend\\.env")

# Valid 1x1 white pixel JPEG
b64 = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA="

messages=[
    {
        "role": "user",
        "content": [
            {"type": "text", "text": "What is in this image?"},
            {
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{b64}"
                }
            }
        ]
    }
]

try:
    mistral = OpenAI(api_key=os.environ.get("MISTRAL_API_KEY"), base_url="https://api.mistral.ai/v1")
    response = mistral.chat.completions.create(
        model="pixtral-12b-2409",
        messages=messages
    )
    print("Mistral Works:", response.choices[0].message.content)
except Exception as e:
    print("Mistral Error:", e)

try:
    mistral = OpenAI(api_key=os.environ.get("MISTRAL_API_KEY"), base_url="https://api.mistral.ai/v1")
    response = mistral.chat.completions.create(
        model="pixtral-large-latest",
        messages=messages
    )
    print("Mistral Large Works:", response.choices[0].message.content)
except Exception as e:
    print("Mistral Large Error:", e)
