import os

from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain_openai import OpenAIEmbeddings

from langchain_iris import IRISVector

from flask import Flask, request, jsonify


text_splitter = CharacterTextSplitter(chunk_size=400, chunk_overlap=20)
COLLECTION_NAME = "embedding_table"

app = Flask(__name__)

with open("./backend/env_keys.txt") as f:
    os.environ["OPENAI_API_KEY"] = f.read().strip()

USERNAME = "ai_war_room"
PASSWORD = "abcd1234"
HOSTNAME = "localhost"
PORT = 1972
NAMESPACE = "USER"
CONNECTION_STRING = f"iris://{USERNAME}:{PASSWORD}@{HOSTNAME}:{PORT}/{NAMESPACE}"

DB = IRISVector.from_texts(
    [""],
    embedding=OpenAIEmbeddings(),
    collection_name=COLLECTION_NAME,
    connection_string=CONNECTION_STRING,
)

@app.route("/store_country_info", methods=["POST"])
def store_country_info():
    data = request.json
    text = data.get("text", "")
    if not text:
        return jsonify({"error": "No text provided"}), 400

    text_chunks = text_splitter.split_text(text)
    DB.add_texts(text_chunks)

    return jsonify({"message": "Text stored successfully"}), 200

@app.route("/get_country_info", methods=["GET"])
def get_country_info():
    query = request.args.get("query", "")
    if not query:
        return jsonify({"error": "No query provided"}), 400

    results = DB.similarity_search(query)
    results = [document.page_content for document in results]

    return jsonify(str(results))
