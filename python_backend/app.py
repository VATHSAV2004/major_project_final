from flask import Flask, request, jsonify
import json
import pandas as pd
from nltk.stem.porter import PorterStemmer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

# Load and preprocess events data
with open(r"C:\Users\saisr\OneDrive\Desktop\important\major_project\backend-python\majorproject.events2.json", "r", encoding='utf-8') as file:
    events_data = json.load(file)

# Normalize and deduplicate events
events = pd.json_normalize(events_data)
events.drop_duplicates(subset=["name", "description"], inplace=True)

# Prepare and preprocess tags
events["tags"] = events["name"] + " " + events["description"]
ps = PorterStemmer()
events["tags"] = events["tags"].apply(lambda x: ' '.join([ps.stem(word) for word in x.lower().split()]))

# Vectorize tags and compute similarity
cv = CountVectorizer(max_features=2000, stop_words="english")
vectors = cv.fit_transform(events["tags"]).toarray()
similarity = cosine_similarity(vectors)

# Helper function to extract event recommendation
def build_recommendations(event_name, id_key="eventId"):
    try:
        event_name = event_name.strip().lower()
        idx = events[events["name"].str.strip().str.lower() == event_name].index[0]
        distances = list(enumerate(similarity[idx]))
        sorted_events = sorted(distances, key=lambda x: x[1], reverse=True)[1:]

        seen_names = set()
        recommended = []
        for i in sorted_events:
            event_row = events.iloc[i[0]]
            if event_row["name"] not in seen_names:

                recommended.append({
                    "name": event_row["name"],
                    "description": event_row["description"],
                    id_key: str(event_row.get("_id", "")),  # Either "eventId" or "id"
                    "poster": event_row.get("poster", ""),  # Base64 encoded image
                    "posterContentType": event_row.get("posterContentType", "image/jpeg")
                })
                seen_names.add(event_row["name"])
            if len(recommended) == 5:
                break

        return recommended
    except IndexError:
        return None

# GET endpoint
@app.route("/api/events/recommend/<string:event_name>", methods=["GET"])
def recommend(event_name):
    result = build_recommendations(event_name, id_key="eventId")
    if result is None:
        return jsonify({"error": f"Event '{event_name}' not found."}), 404
    return jsonify(result), 200

# POST endpoint
@app.route('/api/recommendations', methods=['POST'])
def get_recommendations_post():
    data = request.get_json()
    event_name = data.get("event_name", "").strip()

    if not event_name:
        return jsonify({"error": "Event name is required."}), 400

    result = build_recommendations(event_name, id_key="id")
    if result is None:
        return jsonify({"error": f"Event '{event_name}' not found."}), 404

    return jsonify(result), 200

if __name__ == "__main__":
    app.run(debug=True, port=5000)
