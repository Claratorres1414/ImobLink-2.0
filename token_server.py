from flask import Flask, jsonify, request
import os
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)

@app.route("/token")
def get_token():
    chave = os.getenv("API_KEY")
    auth = request.args.get("auth")

    if auth != chave:
        return jsonify({"error": "Acesso negado"}), 403

    token = os.getenv("HUGGINGFACE_API_TOKEN")
    return jsonify({"token": token})

if __name__ == "__main__":
    app.run(port=5001)

#python token_server.py
