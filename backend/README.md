docker run -d --name iris-comm -p 1972:1972 -p 52773:52773 -e IRIS_PASSWORD=abcd1234 -e IRIS_USERNAME=ai_war_room intersystemsdc/iris-community:latest

flask --app server run