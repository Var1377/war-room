# input: relation between a country done
# do google search done
# store in vector database
# get information from vector database -> pass to prompting.py


from googlesearch import search
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
import re

def do_google_search(stakeholder1, stakeholder2, relation):
    query = f"{stakeholder1} {relation} {stakeholder2}"
    
    urls = []
    try:
        for url in search(query, num_results=5, timeout=5):
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

for url in do_google_search("United Kingdom", "France", "both in nato"):
    scrape_url(url)


