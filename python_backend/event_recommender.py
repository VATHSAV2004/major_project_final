import json
import pandas as pd
from nltk.stem.porter import PorterStemmer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Load the JSON file
with open(r"C:\Users\saisr\Downloads\corrected_events_full.json", "r", encoding='utf-8') as file:
    events_data = json.load(file)

# Flatten and normalize event data
events = pd.json_normalize(events_data)

# Drop exact duplicates (by name + description)
events.drop_duplicates(subset=['name', 'description'], inplace=True)

# Create a lowercased version of name for matching
events['name_lower'] = events['name'].str.lower().str.strip()

# Prepare tags (name + description)
events['tags'] = events['name'] + ' ' + events['description']

# Preprocess: lowercase + stemming
ps = PorterStemmer()
events['tags'] = events['tags'].apply(lambda x: ' '.join([ps.stem(word) for word in x.lower().split()]))

# Vectorize the tags
cv = CountVectorizer(max_features=2000, stop_words='english')
vectors = cv.fit_transform(events['tags']).toarray()

# Calculate similarity matrix
similarity = cosine_similarity(vectors)

# Function to get event recommendations
def recommend_events(event_name):
    event_name = event_name.lower().strip()
    try:
        idx = events[events['name_lower'] == event_name].index[0]
        distances = list(enumerate(similarity[idx]))
        sorted_events = sorted(distances, key=lambda x: x[1], reverse=True)[1:]  # skip self-match

        # Avoid recommending the same event multiple times
        seen_names = set()
        recommended = []
        for i in sorted_events:
            event_row = events.iloc[i[0]]
            if event_row['name'] not in seen_names:
                recommended.append(event_row.to_dict())
                seen_names.add(event_row['name'])
            if len(recommended) == 5:
                break

        return recommended
    except IndexError:
        return f"Event '{event_name}' not found."

# Example usage
recommendations = recommend_events("AI & Robotics Workshop")
if isinstance(recommendations, str):
    print(recommendations)
else:
    for i, event in enumerate(recommendations, 1):
        print(f"{i}. {event['name']} - {event['description'][:100]}...")
