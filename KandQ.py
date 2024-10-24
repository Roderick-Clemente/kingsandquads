import tkinter as tk
from tkinter import messagebox

# Constants
BOARD_SIZE = 9

class KingsAndQuadraphages:
    def __init__(self, root):
        self.root = root
        self.root.title("Kings and Quadraphages")
        
        # Initialize board and pieces
        self.board = [[None for _ in range(BOARD_SIZE)] for _ in range(BOARD_SIZE)]
        self.current_player = 1
        self.king_positions = [(0, 4), (8, 4)]  # Player 1 and Player 2 king starting positions
        self.quadraphage_counts = [30, 30]  # Quadraphages for each player
        self.king_moved = False  # Track if king has been moved

        # Create UI
        self.buttons = [[None for _ in range(BOARD_SIZE)] for _ in range(BOARD_SIZE)]
        self.create_board()
        self.update_turn_indicator()

    def create_board(self):
        for row in range(BOARD_SIZE):
            for col in range(BOARD_SIZE):
                button = tk.Button(self.root, width=4, height=2, command=lambda r=row, c=col: self.on_square_click(r, c))
                button.grid(row=row, column=col)
                self.buttons[row][col] = button

        # Place Kings initially
        self.place_king(0, 4, "👑", player=1)  # Player 1 King
        self.place_king(8, 4, "👑", player=2)  # Player 2 King

    def place_king(self, row, col, symbol, player):
        self.board[row][col] = symbol
        color = "red" if player == 1 else "blue"
        self.buttons[row][col].config(text=symbol, bg=color)  # Set king's square color based on player

    def place_quadraphage(self, row, col, symbol):
        self.board[row][col] = symbol
        self.buttons[row][col].config(text=symbol, bg="lightgray")

    def on_square_click(self, row, col):
        if self.board[row][col] is None:
            if not self.king_moved and self.is_king_move(row, col):
                self.move_king(row, col)
                self.king_moved = True
                self.update_turn_indicator()  # Update to ask for quadraphage placement
            elif self.king_moved and self.can_place_quadraphage():
                self.place_quadraphage(row, col, "🔴" if self.current_player == 1 else "🔵")
                self.quadraphage_counts[self.current_player - 1] -= 1
                self.king_moved = False
                self.switch_player()
        self.check_end_condition()

    def is_king_move(self, row, col):
        current_king_row, current_king_col = self.king_positions[self.current_player - 1]
        return abs(current_king_row - row) <= 1 and abs(current_king_col - col) <= 1 and self.board[row][col] is None

    def move_king(self, row, col):
        current_king_row, current_king_col = self.king_positions[self.current_player - 1]
        self.board[current_king_row][current_king_col] = None
        self.buttons[current_king_row][current_king_col].config(text="", bg="white")
        self.place_king(row, col, "👑", self.current_player)
        self.king_positions[self.current_player - 1] = (row, col)

    def can_place_quadraphage(self):
        return self.quadraphage_counts[self.current_player - 1] > 0

    def switch_player(self):
        self.current_player = 2 if self.current_player == 1 else 1
        self.update_turn_indicator()

    def update_turn_indicator(self):
        if not self.king_moved:
            titletext = self.generate_king_title_text()
            self.root.title(titletext)
        else:
            titletext = self.generate_quad_title_text()
            self.root.title(titletext)

    def check_end_condition(self):
        for player in range(2):
            king_row, king_col = self.king_positions[player]
            if self.is_king_trapped(king_row, king_col):
                winner = 2 if player == 0 else 1
                messagebox.showinfo("Game Over", f"Player {winner} wins! Player {player + 1}'s king is trapped!")
                self.root.quit()

    def is_king_trapped(self, king_row, king_col):
        # Check if all surrounding squares are blocked or off the board
        for dr in [-1, 0, 1]:
            for dc in [-1, 0, 1]:
                if dr == 0 and dc == 0:
                    continue
                new_row, new_col = king_row + dr, king_col + dc
                if 0 <= new_row < BOARD_SIZE and 0 <= new_col < BOARD_SIZE and self.board[new_row][new_col] is None:
                    return False
        return True
    
    def generate_king_title_text(self):
        if self.current_player == 1: 
            return "Kings and Quadraphages - Red Player's Turn: Move the King"
        else:
            return "Kings and Quadraphages - Blue Player's Turn: Move the King"
        
    def generate_quad_title_text(self):
        if self.current_player == 1: 
            return "Kings and Quadraphages - Red Player's Turn: Place a Quadraphage"
        else:
            return "Kings and Quadraphages - Blue Player's Turn: Place a Quadraphage"

# Main loop
if __name__ == "__main__":
    root = tk.Tk()
    game = KingsAndQuadraphages(root)
    root.mainloop()
