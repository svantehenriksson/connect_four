import numpy as np
import math

def evaluate(node):
    """
    Evaluates the given game tree node.

    This function provides a simple heuristic that checks whether the node
    represents a terminal (end) position in the game. If it is terminal, it
    returns a score based on whose turn it is:
        - Returns -1 if it's the current player's turn (indicating a loss).
        - Returns 1 if it's the opponent's turn (indicating a win).
    If the position is not terminal, it returns 0, meaning the evaluation
    function does not assign any intermediate heuristic value.

    Parameters:
        node: An object representing a game tree node. It must implement
              `isTerminal()` to check for end conditions and `getTurn`
              (likely a property or method) to identify the active player.

    Returns:
        int: The evaluation score (-1, 0, or 1).
    """
    if node.isTerminal():
        if node.getTurn():
            return -1
        else:
            return 1

    return 0

class AlphaBeta:
    def __init__(self, depth, evaluate):
        self.depth = depth
        self.evaluate = evaluate

    def alpha_beta_search(self, node, depth, alpha, beta, maximizing_player):
        """
        Perform Alpha-Beta pruning to evaluate the best move.
        
        Args:
            node (object): The current node in the game tree.
            depth (int): Current depth in the search tree.
            alpha (float): The best score for the maximizing player.
            beta (float): The best score for the minimizing player.
            maximizing_player (bool): True if maximizing player's turn.

        Returns:
            float: The evaluated score of the node.
        """
        if depth == 0 or node.isTerminal():
            return self.evaluate(node)

        if maximizing_player:
            max_eval = -math.inf
            for move in node.getMoves():
                eval = self.alpha_beta_search(node.playMove(move), depth - 1, alpha, beta, False)
                max_eval = max(max_eval, eval)
                alpha = max(alpha, eval)
                if beta <= alpha:
                    break  # Beta cutoff
            return max_eval
        else:
            min_eval = math.inf
            for move in node.getMoves():
                eval = self.alpha_beta_search(node.playMove(move), depth - 1, alpha, beta, True)
                min_eval = min(min_eval, eval)
                beta = min(beta, eval)
                if beta <= alpha:
                    break  # Alpha cutoff
            return min_eval

    def find_best_move(self, root):
        """
        Finds the best move for the current player.
        
        Args:
            root (object): The root node of the game tree.

        Returns:
            object: The best child node.
        """
        best_move = None
        best_value = -math.inf if root.getTurn() else math.inf
        moves = root.getMoves()
        for move in moves:
            child = root.playMove(move)
            if child.isTerminal():
                return move
            eval = self.alpha_beta_search(
                child, self.depth - 1, -math.inf, math.inf, not root.getTurn()
            )
            if root.getTurn():
                if eval > best_value:
                    best_value = eval
                    best_move = move
            else:
                if eval < best_value:
                    best_value = eval
                    best_move = move
            
        return best_move

class state:
    def __init__ (self, other=None):
        if other is None:
            self.board = np.zeros([3,4,4,4],dtype=bool)
        else:
            self.board = other.board.copy()
        self.lastmove = None

    def getTurn(self):
        """
        0 = White
        1 = Black
        """
        return self.board[2,:,:,:].sum() % 2

    def playMove(self,move):
        y = move[0]
        x = move[1]
        tmp = state(self)
        z = np.argmin(tmp.board[2,:,y,x])
        assert z < 4 

        turn = tmp.getTurn()
        tmp.board[turn,z,y,x] = True
        tmp.board[2,z,y,x] = True
        
        tmp.lastmove = move
        return tmp

    def getMoves(self):
        return np.argwhere(~self.board[2,3,:,:])

    def isTerminal(self):
        player = abs(self.getTurn()-1)
        arr = self.board[player]
        
        # Check rows (axis 1)
        rows_all_true = np.any(np.all(arr, axis=2))  # each "row" in last axis
        cols_all_true = np.any(np.all(arr, axis=1))  # each "column" in middle axis
        depth_all_true = np.any(np.all(arr, axis=0)) # each "depth" direction
        
        # Check diagonals in each 2D slice
        diag_xy = any(np.all(np.diagonal(arr[i])) or np.all(np.diagonal(np.fliplr(arr[i]))) for i in range(4))
        diag_xz = any(np.all(np.diagonal(arr[:, i, :])) or np.all(np.diagonal(np.fliplr(arr[:, i, :]))) for i in range(4))
        diag_yz = any(np.all(np.diagonal(arr[:, :, i])) or np.all(np.diagonal(np.fliplr(arr[:, :, i]))) for i in range(4))
        
        # Check the 4 main 3D diagonals
        diag_3d_1 = np.all([arr[i, i, i] for i in range(4)])
        diag_3d_2 = np.all([arr[i, i, 3-i] for i in range(4)])
        diag_3d_3 = np.all([arr[i, 3-i, i] for i in range(4)])
        diag_3d_4 = np.all([arr[3-i, i, i] for i in range(4)])
        
        any_four_true = (
            rows_all_true or cols_all_true or depth_all_true or
            diag_xy or diag_xz or diag_yz or
            diag_3d_1 or diag_3d_2 or diag_3d_3 or diag_3d_4
        )

        return any_four_true

    def print(self):
        display = np.full([4,4,4], ' ', dtype=str)

        # Set "x" where White is True
        display[self.board[0]] = 'x'

        # Set "o" where Black is True
        display[self.board[1]] = 'o'

        print(display)

def main():
    movedict = {"a1" : [0,0],
                "a2" : [0,1],
                "a3" : [0,2],
                "a4" : [0,3],
                "b1" : [1,0],
                "b2" : [1,1],
                "b3" : [1,2],
                "b4" : [1,3],
                "c1" : [2,0],
                "c2" : [2,1],
                "c3" : [2,2],
                "c4" : [2,3],
                "d1" : [3,0],
                "d2" : [3,1],
                "d3" : [3,2],
                "d4" : [3,3],
                (0,0) : "a1",
                (0,1) : "a2",
                (0,2) : "a3",
                (0,3) : "a4",
                (1,0) : "b1",
                (1,1) : "b2",
                (1,2) : "b3",
                (1,3) : "b4",
                (2,0) : "c1",
                (2,1) : "c2",
                (2,2) : "c3",
                (2,3) : "c4",
                (3,0) : "d1",
                (3,1) : "d2",
                (3,2) : "d3",
                (3,3) : "d4"}

    game = state()
    strength = input("Choose difficulty (easy, medium or hard): ")
    level = {"easy" : 2, "medium" : 3, "hard" : 6}

    minmax = AlphaBeta(level[strength],evaluate)
    for i in range(64):
        if not game.getTurn():
            move = input("Enter your move, type p to peak at the position: ")
            if move == 'p':
                game.print()
                move = input("Enter your move: ")
            while not movedict[move] in game.getMoves().tolist():
                move = input("Column is full. Enter another move: ")
            game = game.playMove(movedict[move])
        else:
            move = minmax.find_best_move(game)
            game = game.playMove(move)
            print(f"I play {movedict[tuple(move)]}")

        if game.isTerminal():
            if game.getTurn():
                print("White wins")
            else:
                print("Black wins")
            break

    if i == 63:
        print("It's a draw")
    game.print()

if __name__ == "__main__":
    main()
