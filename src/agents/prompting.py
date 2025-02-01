import requests

data = {
    "stakeholders": ["Ukraine", "Russia", "USA"],
    "graph": {
        "event": "Russia invades Ukraine",
        "childEvents": [
            {
                "event": "Ukraine declares full scale war on russia",
                "childEvents": []
            },
            {
                "event": "Russia destroys Nord Stream 2",
                "childEvents": []
            },
            {
                "event": "USA sanctions Russia",
                "childEvents": []
            }
        ]
    }
}