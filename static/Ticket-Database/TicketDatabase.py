import Movies, AvailableTimes, Seating
def TicketsTotal():
    Ticketspots = []
    for x in range (len(Movies.MovieList())):
        Ticketspots.append([])
        for y in range (len(AvailableTimes.MovieTimes())):
            Ticketspots[x].append([])
            for z in range(Seating.Seating.numSeats):
                Ticketspots[x][y].append(True)
    print(Ticketspots)
TicketsTotal()