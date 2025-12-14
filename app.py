from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from chat import get_response
import json
import math

app = Flask(__name__)
CORS(app)

@app.get("/")
def index_get():
    return render_template("base.html")

@app.route('/login')
def login():
    return render_template("login.html")

@app.route('/admin')
def admin():
    return render_template("admin.html")

@app.route('/about')
def about_us():
    return render_template("about_us.html")

@app.post("/predict")
def predict():
    text = request.get_json().get("message")
    user_location = request.get_json().get("location")  # Kullanıcının konumunu al
    
    # Eğer mesaj hastane/hospital içeriyorsa ve konum varsa
    if user_location and any(word in text.lower() for word in ['hospital', 'hastane', 'medical', 'center']):
        response = get_nearby_hospitals(user_location)
    else:
        response = get_response(text)
    
    message = {"answer": response}
    return jsonify(message)

def get_nearby_hospitals(user_location):
    """Kullanıcının konumuna göre en yakın hastaneleri döndür"""
    
    def haversine(lat1, lon1, lat2, lon2):
        R = 6371.0
        lat1 = math.radians(lat1)
        lon1 = math.radians(lon1)
        lat2 = math.radians(lat2)
        lon2 = math.radians(lon2)
        dlon = lon2 - lon1
        dlat = lat2 - lat1
        a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        distance = R * c
        return distance
    
    try:
        given_location = [user_location.get('latitude'), user_location.get('longitude')]
        
        with open("medical_centers.json", "r", encoding='utf-8') as json_file:
            medical_centers = json.load(json_file)
        
        distances_to_centers = []
        for center in medical_centers["intents"]:
            center_location = center["location"]
            distance = haversine(given_location[0], given_location[1], center_location[0], center_location[1])
            distances_to_centers.append((center["tag"], distance, center["Address"]))
        
        distances_to_centers.sort(key=lambda x: x[1])
        
        l = ["center"]
        for i, (center_name, distance, address) in enumerate(distances_to_centers[:5], start=1):
            l.append([center_name, f"{round(distance, 2)}km", address])
        
        return l
    except Exception as e:
        print(f"Error: {e}")
        return get_response("hospital")

if __name__ == "__main__":
    app.run(debug=True)