import requests
import copy
import flask
import json
import anthropic
import ast


test_data = {
        "stakeholders": ["SpaceX", "NASA", "Blue Origin"],
        "events": [
            "SpaceX successfully launches Starship orbital test flight",
            "NASA announces partnership for lunar landing missions",
            "Blue Origin unveils new Glenn rocket design"
        ],
        "ev": [
            0,0,0 
        ]
    }

test_data2 = {
        "targetID": 6, 
        "totalEvents": 7,
        "stakeholders": ["SpaceX", "NASA", "Blue Origin"],
        "stakeholder_metadata": {
            "SpaceX": [
                "Leading private space company"
            ],
            "NASA": [
                "trying to go bankrupt due to management"
            ],
            "Blue Origin": [
                "Competing private space company"
            ]
        },
        "graph": {
            "event": "SpaceX successfully launches Starship orbital test flight",
            "eventID": 1,
            "ev": 0,
            "childEvents": [
                {
                    "event": "NASA announces partnership for lunar landing missions",
                    "eventID": 2,
                    "ev": 0,
                    "childEvents": [
                        {
                            "event": "Accelerates Starship development timeline",
                            "eventID": 5,
                            "ev": 0,
                            "childEvents": []
                        },
                        {
                            "event": "Announces new commercial space partnerships",
                            "eventID": 6,
                            "ev": 0,
                            "childEvents": []
                        },
                        {
                            "event": "Increases investment in rocket development",
                            "eventID": 7,
                            "ev": 0,
                            "childEvents": []
                        }
                    ]
                },
                {
                    "event": "Announces new commercial space partnerships",
                    "eventID": 3,
                    "ev": 0,
                    "childEvents": []
                },
                { 
                    "event": "Increases investment in rocket development",
                    "eventID": 4,
                    "ev": 0,
                    "childEvents": []
                }
            ]  
        }
    }

 
data = {
        "targetID": 3, 
        "totalEvents": 4,
        "stakeholders": [
            "Ukraine",
            "Russia",
            "USA"
        ],

        "stakeholder_metadata": {
            "Ukraine": [
                "Wants to join NATO"
            ],
            "Russia": [
                "Wants to reclaim lost land"
            ],
            "USA": [
                "Hates russia",
                "Wants to add tarrifs internationally"
            ]
        },

        "graph": {
            "event": "Russia invades Ukraine",
            "eventID": 1,
            "ev": 0,
            "childEvents": [
                {
                    "event": "Ukraine declares full scale war on russia",
                    "eventID": 2,
                    "ev": 0,
                    "childEvents": [
                        #will three more child events, one for each

                    ]
                },
                {
                    "event": "Russia destroys Nord Stream 2",
                    "eventID": 3,
                    "ev": 0,
                    "childEvents": []
                },
                { 
                    "event": "USA sanctions Russia",
                    "eventID": 4,
                    "ev": 0,
                    "childEvents": []
                }
            ]  
        }
    }


def get_api_key():
    try:
        with open('apikey.txt', 'r') as file:
            return file.read().strip()
    except FileNotFoundError:
        raise Exception("apikey.txt file not found. Please create this file with your API key.")

api_key =  get_api_key()


def add_event_to_graph(data, new_events):
    """
    Recursively searches for the target event (by eventID) in the event graph and adds new_events as children.
    New events are provided as a list of description strings. New event dictionaries are created automatically,
    using the current totalEvents (from the data dictionary) to generate unique eventIDs. The totalEvents count
    is updated accordingly.

    Args:
        data (dict): The overall dictionary containing keys like "expandID", "totalEvents", "stakeholders", and "graph".
        target_event_id (int): The eventID of the node to which new events should be added.
        (new_events, ev): (list of str, evaluation score): List of pairs of a new event description and a evaluation score

    Returns:
        dict: A new data dictionary (copy of the original) with new events added.
    """
    # Create a deep copy of the original data to avoid modifying it.
    data_copy = copy.deepcopy(data)
    target_event_id = data_copy["targetID"]


    # Get the current total event count from the copy and compute the starting eventID.
    old_total = data_copy.get("totalEvents", 0)
    next_event_id = old_total + 1

    # Create new event nodes from the list of strings.
    new_event_nodes = []
    for event_description, ev in new_events:
        new_event_nodes.append({
            "event": event_description,
            "eventID": next_event_id,
            "ev": ev,
            "childEvents": []
        })
        next_event_id += 1

    # Update the totalEvents field in the copied data.
    data_copy["totalEvents"] = old_total + len(new_events)

    # Recursive helper function to search for the target eventID in the event tree.
    def recursive_add(node):
        if node["eventID"] == target_event_id:
            node["childEvents"].extend(new_event_nodes)
            return True
            
        # DFS through all children
        for child in node.get("childEvents", []):
            if recursive_add(child):
                return True
        return False
    
    # Start the recursive search from the root of the event graph in the copied data.
    recursive_add(data_copy["graph"])
    return data_copy

def call_language_model(prompt):
    client = anthropic.Anthropic(
        api_key=api_key
    )
    
    try:
        message = client.messages.create(
            model="claude-3-5-haiku-20241022",
            max_tokens=1000,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        return message.content[0].text
        
    except Exception as e:
        raise Exception(f"Error calling Claude API: {str(e)}")

def generate_event(stakeholders, stakeholder_metadata, events, ev):
    '''
    Generates new events for all stakeholders based on the current event sequence
    using a template prompt stored in prompt.txt
    A list of size stakeholders where each element is a string corresponding to a stakeholder in chronological order
    '''
    try:
        with open('prompt.txt', 'r') as file:
            prompt_template = file.read()
        

                # Format the metadata into a readable string with bullet points for each item
        metadata_str = '\n'.join([
            f"{stakeholder}:\n" + '\n'.join(f"- {item}" for item in metadata)
            for stakeholder, metadata in stakeholder_metadata.items()
        ])

        print(metadata_str)
            
        # Format the prompt with our variables
        prompt = prompt_template.format(
            stakeholders=', '.join(stakeholders),
            metadata=metadata_str,
            events='\n- '.join(events),
            evs=', '.join(map(str, ev))
        )

            
        # Format the prompt with our variables
        prompt = prompt_template.format(
            stakeholders=', '.join(stakeholders),
            metadata=metadata_str,
            events='\n- '.join(events),
            evs=', '.join(map(str, ev))
        )
        
        # Call the language model with the prompt

        print(prompt)
        response = call_language_model(prompt)
        response = ast.literal_eval(response)
        return (response)
        
        
    except FileNotFoundError:
        raise Exception("prompt.txt file not found in src/agents directory")    
    

def get_stakeholders(data):
    return data.get("stakeholders", [])

def get_stakeholder_metadata(data):
    return data.get("stakeholder_metadata", [])

def get_events(data, target_id):
    """
    Gets the path of events from root to target event as a list of event strings.
    
    Args:
        data (dict): The data dictionary containing the event graph
        target_id (int): ID of the target event to find path to
        
    Returns:
        list: List of event description strings from root to target event
    """
    def find_path(node, target_id, current_path):
        if node['eventID'] == target_id:
            return current_path + [node['event']]
            
        for child in node.get('childEvents', []):
            path = find_path(child, target_id, current_path + [node['event']])
            if path:
                return path
                
        return None

    # Start search from root of graph
    path = find_path(data['graph'], target_id, [])
    
    if path is None:
        raise Exception(f"Event with ID {target_id} not found in graph")
        
    return path

def get_ev(data, target_id):
    """
    Gets the evaluation scores (ev) from root to target event as a list.
    
    Args:
        data (dict): The data dictionary containing the event graph
        target_id (int): ID of the target event to find path to
        
    Returns:
        list: List of evaluation scores from root to target event
    """
    def find_path(node, target_id, current_path):
        if node['eventID'] == target_id:
            return current_path + [node['ev']]
            
        for child in node.get('childEvents', []):
            path = find_path(child, target_id, current_path + [node['ev']])
            if path:
                return path
                
        return None

    # Start search from root of graph
    path = find_path(data['graph'], target_id, [])
    
    if path is None:
        raise Exception(f"Event with ID {target_id} not found in graph")
        
    return path

from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/api/transform', methods=['POST'])
def transform():
    data = request.get_json()
    
    target_id = data.get('targetID')
    stakeholders = get_stakeholders(data)
    stakeholder_metadata = get_stakeholder_metadata(data)
    
    events = get_events(data, target_id)
    ev = get_ev(data, target_id)

    a = generate_event(stakeholders, stakeholder_metadata, events, ev)
    new_data = add_event_to_graph(data, a) 
    return jsonify(new_data)


     

if __name__ == '__main__':
    app.run(debug=True, port=5000)



