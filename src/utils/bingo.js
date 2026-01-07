export const generateBingoBoard = (size = 5) => {
    const board = [];
    const totalCells = size * size;

    // Generate pool of 75 numbers
    const allNumbers = Array.from({ length: 75 }, (_, i) => i + 1);

    // Shuffle using Fisher-Yates
    for (let i = allNumbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allNumbers[i], allNumbers[j]] = [allNumbers[j], allNumbers[i]];
    }

    // Take required numbers
    const pool = allNumbers.slice(0, totalCells - 1);
    let poolIndex = 0;
    const center = Math.floor(size / 2);

    for (let r = 0; r < size; r++) {
        const row = [];
        for (let c = 0; c < size; c++) {
            if (r === center && c === center) {
                row.push({ value: 'FREE', marked: true });
            } else {
                row.push({ value: pool[poolIndex++], marked: false });
            }
        }
        board.push(row);
    }

    return board;
};

export const getCompletedLines = (board) => {
    if (!board || board.length === 0) return [];
    const size = board.length;
    const completedLines = [];

    // Check Rows
    for (let r = 0; r < size; r++) {
        if (board[r].every(cell => cell.marked)) {
            completedLines.push({ type: 'row', index: r });
        }
    }

    // Check Cols
    for (let c = 0; c < size; c++) {
        let colMarked = true;
        for (let r = 0; r < size; r++) {
            if (!board[r][c].marked) {
                colMarked = false;
                break;
            }
        }
        if (colMarked) completedLines.push({ type: 'col', index: c });
    }

    // Check Diagonals
    let diag1 = true;
    let diag2 = true;
    for (let i = 0; i < size; i++) {
        if (!board[i][i].marked) diag1 = false;
        if (!board[i][size - 1 - i].marked) diag2 = false;
    }
    if (diag1) completedLines.push({ type: 'diag1' });
    if (diag2) completedLines.push({ type: 'diag2' });

    return completedLines;
};

export const checkWin = (board) => {
    if (!board || board.length === 0) return false;
    const size = board.length;
    // Win condition: match the number of lines to the board size
    return getCompletedLines(board).length >= size;
};
