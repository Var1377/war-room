# input: relation between a country done
# do google search done
# store in vector database
# get information from vector database -> pass to prompting.py

from googlesearch import search
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from langchain.text_splitter import CharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_iris import IRISVector
from flask import Flask, request, jsonify
from dotenv import load_dotenv

import re
import requests
import os

load_dotenv()

TEXT_SPLITTER = CharacterTextSplitter(chunk_size=400, chunk_overlap=20)
COLLECTION_NAME = "embedding_table"

app = Flask(__name__)

# os.environ["OPENAI_API_KEY"] = os.getenv('OPENAI_API_KEY')

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

@app.route("/get_from_db", methods=["POST"])
def get_from_db_route():
    data = request.json
    query = data.get("query", "")
    if not query:
        return jsonify({"error": "No query provided"}), 400

    results = get_from_db(query)
    return jsonify({"results": results}), 200

@app.route("/put_relations_in_db", methods=["POST"])
def put_relations_in_db_route():
    data = request.json
    relations = data.get("relations", [])
    if not relations:
        return jsonify({"error": "No relations provided"}), 400

    put_relations_in_db(relations)
    return jsonify({"message": "Relations stored successfully"}), 200

def do_google_search(search_query):
    urls = []
    try:
        for url in search(search_query, num_results=5, timeout=5):
            urls.append(url)
    except Exception as e:
        print(f"Error during search: {e}")
        
    return urls

def scrape_url(url):
    try:
        # Send GET request to the URL
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # Parse the HTML content
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove unwanted elements
        for element in soup(['script', 'style', 'header', 'footer', 'nav']):
            element.decompose()
            
        # Get text content
        text = soup.get_text(separator=' ', strip=True)
        
        # Clean up the text
        # Remove extra whitespace and newlines
        text = re.sub(r'\s+', ' ', text)
        text = text.strip()
        
        return text
        
    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return ""

def store_in_db(text):
    text_chunks = TEXT_SPLITTER.split_text(text)
    DB.add_texts(text_chunks)

def put_relations_in_db(relations):
    for relation in relations:
        url = do_google_search(relation)
        content = scrape_url(url)
        store_in_db(content)

def get_from_db(query):
    results = DB.similarity_search(query)
    results = [document.page_content for document in results]
    return results


if __name__ == "__main__":
    app.run(debug=True, port=5000)
