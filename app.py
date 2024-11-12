from flask import Flask, render_template, send_from_directory, request, jsonify
from datetime import datetime
import os, json


app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/get-tickets')
def get_tickets():
    movie_title = request.args.get('title', 'Movie title not found')
    theater_number = request.args.get('theatre', 'Unknown')
    
    try:
        # Load theater and showtime data from JSON
        with open('static/ticket-database/data.json') as f:
            data = json.load(f)

        # Find the specified theater and its showtimes
        theater = next((t for t in data['theaters'] if str(t['theater_id']) == theater_number), None)
        if theater:
            showtimes = [
                {
                    "id": showtime['showtime_id'],
                    "time": datetime.fromisoformat(showtime['start_time']).strftime('%I:%M %p')
                }
                for showtime in theater['showtimes']
            ]
        else:
            showtimes = []
        
    except FileNotFoundError:
        print("Error: data.json file not found.")
        showtimes = []

    return render_template('get_tickets.html', movie_title=movie_title, theater_number=theater_number, showtimes=showtimes)

@app.route('/get-seats')
def get_seats():
    showtime_id = request.args.get('showtime_id')
    
    try:
        # Load seat data for the specified showtime
        with open('static/ticket-database/data.json') as f:
            data = json.load(f)

        seats = []
        for theater in data['theaters']:
            for showtime in theater['showtimes']:
                if str(showtime['showtime_id']) == showtime_id:
                    seats = showtime.get('seats', [])
                    break
        
        if not seats:
            return jsonify({"error": "Seats not found"}), 404
        
    except FileNotFoundError:
        print("Error: data.json file not found.")
        return jsonify({"error": "Data file not found"}), 500
    
    return jsonify(seats)

@app.route('/update-seats', methods=['POST'])
def update_seats():
    data = request.json
    theater_id = data.get('theater_id')
    showtime_id = data.get('showtime_id')
    seats_to_update = data.get('seats')

    # Validate incoming data
    if not theater_id or not showtime_id or not seats_to_update:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        # Load existing theater data
        with open('static/ticket-database/data.json', 'r') as file:
            theaters = json.load(file)

        # Find the correct theater and showtime and update seats
        updated = False
        for theater in theaters['theaters']:
            if theater['theater_id'] == theater_id:
                for showtime in theater['showtimes']:
                    if showtime['showtime_id'] == showtime_id:
                        for seat in showtime['seats']:
                            for s in seats_to_update:
                                if seat['row'] == s['row'] and seat['number'] == s['number']:
                                    seat['is_available'] = False
                                    updated = True

        if not updated:
            return jsonify({"error": "No matching seats found to update"}), 404

        # Save updated data back to the JSON file
        with open('static/ticket-database/data.json', 'w') as file:
            json.dump(theaters, file, indent=4)

    except FileNotFoundError:
        print("Error: data.json file not found.")
        return jsonify({"error": "Data file not found"}), 500

    return jsonify({"message": "Seats updated successfully"}), 200

if __name__ == '__main__':
    app.run(debug=True)