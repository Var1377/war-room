import requests
import json

data = {
        "expandID": 3, 
        "totalEvents": 4,
        "stakeholders": [
            "Ukraine",
            "Russia",
            "USA"
        ],
        "graph": {
            "event": "Russia invades Ukraine",
            "eventID": 1,
            "childEvents": [
                {
                    "event": "Ukraine declares full scale war on russia",
                    "eventID": 2,
                    "childEvents": []
                },
                {
                    "event": "Russia destroys Nord Stream 2",
                    "eventID": 3,
                    "childEvents": []
                },
                { 
                    "event": "USA sanctions Russia",
                    "eventID": 4,
                    "childEvents": []
                }
            ]  
        }
    }

import copy

def add_event_to_graph(data, target_event_id, new_events):
    """
    Recursively searches for the target event (by eventID) in the event graph and adds new_events as children.
    New events are provided as a list of description strings. New event dictionaries are created automatically,
    using the current totalEvents (from the data dictionary) to generate unique eventIDs. The totalEvents count
    is updated accordingly.

    Args:
        data (dict): The overall dictionary containing keys like "expandID", "totalEvents", "stakeholders", and "graph".
        target_event_id (int): The eventID of the node to which new events should be added.
        new_events (list of str): List of new event description strings.

    Returns:
        dict: A new data dictionary (copy of the original) with new events added.
    """
    # Create a deep copy of the original data to avoid modifying it.
    data_copy = copy.deepcopy(data)

    # Get the current total event count from the copy and compute the starting eventID.
    old_total = data_copy.get("totalEvents", 0)
    next_event_id = old_total + 1

    # Create new event nodes from the list of strings.
    new_event_nodes = []
    for event_description in new_events:
        new_event_nodes.append({
            "event": event_description,
            "eventID": next_event_id,
            "childEvents": []
        })
        next_event_id += 1

    # Update the totalEvents field in the copied data.
    data_copy["totalEvents"] = old_total + len(new_events)

    # Recursive helper function to search for the target eventID in the event tree.
    def recursive_add(node):
        if node.get("eventID") == target_event_id:
            # Ensure the node has a "childEvents" list.
            if "childEvents" not in node:
                node["childEvents"] = []
            node["childEvents"].extend(new_event_nodes)
            return True  # Target found; stop further recursion.
        for child in node.get("childEvents", []):
            if recursive_add(child):
                return True
        return False

    # Start the recursive search from the root of the event graph in the copied data.
    recursive_add(data_copy["graph"])
    return data_copy