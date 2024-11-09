from flask import Flask, render_template, send_from_directory, request, jsonify
import os, json
from datetime import datetime


app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/get-tickets')
def get_tickets():
    movie_title = request.args.get('title', 'Movie title not found')
    theater_number = request.args.get('theatre', 'Unknown')
    
    # Load data.json to find the theater's showtimes
    try:
        with open('static/ticket-database/data.json') as f:
            data = json.load(f)

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
    
    # Load seat data for the specified showtime
    try:
        with open('static/ticket-database/data.json') as f:
            data = json.load(f)
        
        # Search for seats in the specified showtime
        seats = []
        for theater in data['theaters']:
            for showtime in theater['showtimes']:
                if str(showtime['showtime_id']) == showtime_id:
                    seats = showtime.get('seats', [])
                    break
        
    except FileNotFoundError:
        print("Error: data.json file not found.")
        seats = []
    
    return jsonify(seats)

if __name__ == '__main__':
    app.run(debug=True)