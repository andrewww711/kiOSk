
class Seating:

    CSeats = 10
    RSeats = 5
    Seats = []
    for x in range (RSeats):
        Seats.append([])
        RowLetter = chr(97 + x)
        for y in range (CSeats):
            Seats[x].append(str(RowLetter) + str(y + 1))
    # print(Seats)
    
    numSeats = CSeats * RSeats



