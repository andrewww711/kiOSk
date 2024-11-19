#test for QR CODE LIBRARIES REMOVE FROM FINAL VERSION OF PROJECT

import segno

def render_qr_in_terminal(qr):
    """
    Render the QR code as ASCII art in the terminal.
    """
    # Get the matrix of the QR code
    matrix = qr.matrix
    for row in matrix:
        print("".join("██" if cell else "  " for cell in row))

def main():
    print("Basic QR Code:")
    qr = segno.make('https://example.com')
    render_qr_in_terminal(qr)

    print("\nQR Code with High Error Correction Level:")
    qr_with_ec = segno.make('https://example.com', error='h')
    render_qr_in_terminal(qr_with_ec)

    print("\nCustom-sized QR Code:")
    qr_with_size = segno.make('https://example.com')
    render_qr_in_terminal(qr_with_size)

    print("\nDone! Displayed all QR codes in terminal.")

if __name__ == '__main__':
    main()
