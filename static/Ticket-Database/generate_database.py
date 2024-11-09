import json
from datetime import datetime

def generate_data(showtimes_list):
    """
    Generate data for theaters with customizable showtimes for each theater.
    
    Parameters:
    showtimes_list (list of list of str): List of lists, where each sublist contains ISO format datetime strings for each theater's showtimes.
    
    Returns:
    dict: Data structure containing theaters, showtimes, and seats.
    """
    data = {
        "theaters": [
            {
                "theater_id": theater_id + 1,
                "showtimes": generate_showtimes(showtimes)
            }
            for theater_id, showtimes in enumerate(showtimes_list)
        ]
    }
    return data

def generate_showtimes(showtimes):
    """
    Generate showtime entries for a theater based on a list of showtime start times.
    
    Parameters:
    showtimes (list of str): List of showtime start times in ISO format.
    
    Returns:
    list: List of showtime dictionaries.
    """
    showtime_entries = []

    for showtime_id, start_time in enumerate(showtimes, start=1):
        showtime_entries.append({
            "showtime_id": showtime_id,
            "movie_title": f"Sample Movie {showtime_id}",
            "start_time": start_time,
            "seats": generate_seats()
        })
    return showtime_entries

def generate_seats():
    """
    Generate seats for a showtime with 10 rows (A-J) and 16 seats per row.
    
    Returns:
    list: List of seat dictionaries.
    """
    seats = []
    rows = "ABCDEFGHIJ"  # 10 rows from A to J
    for row in rows:
        for number in range(1, 17):  # 16 seats per row
            seats.append({
                "row": row,
                "number": number,
                "is_available": True
            })
    return seats

def save_to_json(data, filename="data.json"):
    """
    Save generated data to a JSON file.
    
    Parameters:
    data (dict): Data structure to save.
    filename (str): File name to save the JSON data.
    """
    with open(filename, "w") as f:
        json.dump(data, f, indent=4)
    print(f"Data saved to {filename}")

if __name__ == "__main__":
    # Define individual showtimes for each theater (5 showtimes per theater)
    showtimes_list = [
        ["2024-11-10T12:00:00", "2024-11-10T14:00:00", "2024-11-10T16:00:00", "2024-11-10T18:00:00", "2024-11-10T20:00:00"],  # Theater 1
        ["2024-11-10T13:00:00", "2024-11-10T15:00:00", "2024-11-10T17:00:00", "2024-11-10T19:00:00", "2024-11-10T21:00:00"],  # Theater 2
        ["2024-11-10T10:00:00", "2024-11-10T12:30:00", "2024-11-10T15:00:00", "2024-11-10T17:30:00", "2024-11-10T20:00:00"],  # Theater 3
        ["2024-11-10T09:00:00", "2024-11-10T11:00:00", "2024-11-10T13:00:00", "2024-11-10T15:00:00", "2024-11-10T17:00:00"],  # Theater 4
        ["2024-11-10T08:00:00", "2024-11-10T10:00:00", "2024-11-10T12:00:00", "2024-11-10T14:00:00", "2024-11-10T16:00:00"],  # Theater 5
        ["2024-11-10T10:00:00", "2024-11-10T12:00:00", "2024-11-10T14:00:00", "2024-11-10T16:00:00", "2024-11-10T18:00:00"],  # Theater 6
        ["2024-11-10T11:00:00", "2024-11-10T13:00:00", "2024-11-10T15:00:00", "2024-11-10T17:00:00", "2024-11-10T19:00:00"],  # Theater 7
        ["2024-11-10T08:30:00", "2024-11-10T11:00:00", "2024-11-10T13:30:00", "2024-11-10T16:00:00", "2024-11-10T18:30:00"],  # Theater 8
        ["2024-11-10T09:30:00", "2024-11-10T12:00:00", "2024-11-10T14:30:00", "2024-11-10T17:00:00", "2024-11-10T19:30:00"],  # Theater 9
        ["2024-11-10T08:00:00", "2024-11-10T10:30:00", "2024-11-10T13:00:00", "2024-11-10T15:30:00", "2024-11-10T18:00:00"]   # Theater 10
    ]

    # Generate data with specified showtimes
    data = generate_data(showtimes_list)
    save_to_json(data)
