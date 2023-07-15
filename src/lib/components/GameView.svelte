<script lang="ts">
    import { browser } from "$app/environment";
    import {
        createCellObj,
        getRandBoardBlock,
        type Cell,
        canIMoveTo,
        boardColsToRows,
        boardRowsToCols,
        combineCells,
        type Coord,
        saveState,
        type GameState,
        deepCopy,
        findHighest,
        loadState,
        areMovesAvailable,
    } from "$lib";
    import type { GameBoard } from "$lib/types/GameBoard";
    import { onMount } from "svelte";
    import { fade, slide } from "svelte/transition";
    import CellView from "./CellView.svelte";
    import { swipe } from "svelte-gestures";
    import EndGameView from "./EndGameView.svelte";

    const defaultGameboard: GameBoard = [
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
    ];

    // GAMEBOARD
    let gameboard: GameBoard = defaultGameboard;
    // PREVIOUS TURN
    let previousTurn: GameBoard | null = null;
    // SCORE
    let score: number = 0;
    // TURN
    let turn: number = 0;
    let canSwipe: boolean = true;
    // EVENTS
    const keys = (e: KeyboardEvent) => {
        // if(!canSwipe) return
        e.stopImmediatePropagation();
        e.preventDefault();
        switch (e.key) {
            case "ArrowUp":
                startTurn("UP");
                break;
            case "ArrowDown":
                startTurn("DOWN");
                break;
            case "ArrowLeft":
                startTurn("LEFT");
                break;
            case "ArrowRight":
                startTurn("RIGHT");
                break;

            default:
                break;
        }
    };
    if (browser) {
        window.addEventListener("keydown", keys);
    }
    onMount(async () => {
        let saveState: GameState | null = loadState();
        console.log(saveState);
        if (!saveState) initializeNewGame();
        else restartGame(saveState);
    });
    // RECEIVE CONTROL INPUT AND CALL CORRECT \METHOD
    const startTurn = (direction: string) => {
        // canSwipe = false
        // SET HISTORY
        previousTurn = getCurrentBoardCopy();

        switch (direction) {
            case "UP":
                swipeUp(getCurrentBoardCopy());
                break;
            case "DOWN":
                swipeDown(getCurrentBoardCopy());
                break;
            case "LEFT":
                swipeLeft(getCurrentBoardCopy());
                break;
            case "RIGHT":
                swipeRight(getCurrentBoardCopy());
                break;

            default:
                break;
        }
    };
    const getCurrentBoardCopy = (): any[][] => {
        return JSON.parse(
            JSON.stringify([
                [...gameboard[0]],
                [...gameboard[1]],
                [...gameboard[2]],
                ...[gameboard[3]],
            ])
        );
    };
    const getPreviousBoardCopy = (): any[][] | null => {
        if (!previousTurn) return null;
        return JSON.parse(
            JSON.stringify([
                [...previousTurn[0]],
                [...previousTurn[1]],
                [...previousTurn[2]],
                ...[previousTurn[3]],
            ])
        );
    };

    // START GAME
    const initializeNewGame = () => {
        // RESET
        gameboard = deepCopy(defaultGameboard);
        clearBoardDom();
        gameover = false
        // SETUP
        let first: Coord = getRandBoardBlock();
        let second: Coord = getRandBoardBlock();
        while (first.toString() == second.toString()) {
            second = getRandBoardBlock();
        }
        addNewCellToGame(first);
        addNewCellToGame(second);
        turn = 0;
        score = 0;
        saveState(score, gameboard, turn);
    };
    const restartGame = (saveState: GameState) => {
        score = saveState.score;
        turn = saveState.turns;
        gameboard = saveState.gameboard;
        gameboard
            .flat()
            .filter((cellOrNull: Cell | null) => (cellOrNull ? true : false))
            .forEach((cell: Cell | null) => {
                if (cell) addCellToDOM(cell);
            });
    };
    const clearBoardDom = () => {
        document.getElementById("active-cells")!.innerHTML = "";
    };
    // DIRECTIONS
    type Move = [Cell, Coord];
    const swipeDown = (boardCopy: any[]) => {
        let moves: Cell[] = [];
        let checked = 0;
        boardCopy.forEach((col: any[], ind: number) => {
            for (let i = col.length - 2; i >= 0; i--) {
                let cell: Cell = col[i] as Cell;
                // continue if empty
                if (cell == null) continue;

                // TRACK MOVEMENT OF BLOCK

                let spacesToCheck = 3 - i;
                for (let j = 0; j < spacesToCheck; j++) {
                    let me: Cell = cell;
                    let you: Cell = col[i + 1 + j];
                    let canIMoveDown: boolean = canIMoveTo(me, you);
                    if (!canIMoveDown) break;
                    if (you == null) {
                        col[i + j] = null;
                        col[i + 1 + j] = me;
                        me.coord = [ind, i + 1 + j];
                        checked++;
                        continue;
                    }
                    if (you.value == me.value) {
                        me.coord = you.coord;
                        let combinedCell: Cell[] = [you, me];
                        col[i + j] = null;
                        col[i + 1 + j] = combinedCell;
                        checked++;
                        break;
                    }
                }
                moves.push(cell);
            }
        });
        if (!checked) return;
        moveCells(moves);
        endTurn(boardCopy);
    };
    const swipeUp = (boardCopy: any[]) => {
        let moves: Cell[] = [];

        let checked = 0;
        boardCopy.forEach((col: any[], ind: number) => {
            // let moves: Move[] = []
            for (let i = 1; i < col.length; i++) {
                let cell: Cell = col[i] as Cell;
                // continue if empty
                if (cell == null) continue;

                let spacesToCheck = i;
                for (let j = 0; j < spacesToCheck; j++) {
                    let me: Cell = cell;
                    let you: Cell = col[i - 1 - j];
                    let canIMoveDown: boolean = canIMoveTo(me, you);
                    if (!canIMoveDown) break;
                    if (you == null) {
                        col[i - j] = null;
                        col[i - 1 - j] = me;
                        me.coord = [ind, i - j - 1];
                        // console.log(col)
                        checked++;
                        continue;
                    }
                    if (you.value == me.value) {
                        me.coord = you.coord;
                        let combinedCell: Cell[] = [you, me];
                        col[i - j] = null;
                        col[i - 1 - j] = combinedCell;
                        checked++;
                        break;
                    }
                }
                moves.push(cell);
            }
        });
        if (!checked) return;
        moveCells(moves);
        endTurn(boardCopy);
    };
    const swipeLeft = (boardCopy: any[]) => {
        let moves: Cell[] = [];

        let board = boardColsToRows(boardCopy);
        // console.log(board)
        let checked = 0;
        board.forEach((col: any[], ind: number) => {
            for (let i = 1; i < col.length; i++) {
                let cell: Cell = col[i] as Cell;
                // continue if empty
                if (cell == null) continue;
                // if a number
                let spacesToCheck = i;
                for (let j = 0; j < spacesToCheck; j++) {
                    let me: Cell = cell;
                    let you: Cell = col[i - 1 - j];
                    let canIMoveDown: boolean = canIMoveTo(me, you);
                    if (!canIMoveDown) break;
                    if (you == null) {
                        col[i - j] = null;
                        col[i - 1 - j] = me;
                        me.coord = [i - j - 1, ind];

                        checked++;
                        continue;
                    }
                    if (you.value == me.value) {
                        me.coord = you.coord;
                        let combinedCell: Cell[] = [you, me];
                        col[i - j] = null;
                        col[i - 1 - j] = combinedCell;
                        checked++;
                        break;
                    }
                }
                moves.push(cell);
            }
        });
        if (!checked) return;
        moveCells(moves);
        endTurn(boardRowsToCols(board));
    };
    const swipeRight = (boardCopy: any[]) => {
        let moves: Cell[] = [];

        let board = boardColsToRows(boardCopy);
        let checked = 0;
        board.forEach((col: any[], ind: number) => {
            for (let i = col.length - 2; i >= 0; i--) {
                let cell: Cell = col[i] as Cell;
                // continue if empty
                if (cell == null) continue;
                // if a number
                let spacesToCheck = 3 - i;
                for (let j = 0; j < spacesToCheck; j++) {
                    let me: Cell = cell;
                    let you: Cell = col[i + 1 + j];
                    let canIMoveDown: boolean = canIMoveTo(me, you);
                    if (!canIMoveDown) break;
                    if (you == null) {
                        col[i + j] = null;
                        col[i + 1 + j] = me;
                        me.coord = [i + j + 1, ind];

                        checked++;
                        continue;
                    }
                    if (you.value == me.value) {
                        me.coord = you.coord;
                        let combinedCell: Cell[] = [you, me];
                        col[i + j] = null;
                        col[i + 1 + j] = combinedCell;
                        checked++;
                        break;
                    }
                }
                moves.push(cell);
            }
        });
        if (!checked) return;
        moveCells(moves);
        endTurn(boardRowsToCols(board));
    };
    const moveCells = (moves: Cell[]) => {
        console.log(moves);
        moves.forEach((movedCell: Cell) => {
            moveCellInDOM(movedCell);
        });
    };

    const endTurn = (newGameBoard: any[][]) => {
        // CHECK FOR DOUBLE CELLS TO COMBINE AND GET SCORE
        console.log(newGameBoard);
        let combinedCells: Cell[][] = newGameBoard
            .flat()
            .filter((cell: any) => {
                if (Array.isArray(cell)) return true;
                return false;
            });
        let pointsToTally = 0;
        // COMBINE ALL COMBINED CELLS
        combinedCells.forEach((cells: Cell[]) => {
            deleteCellFromDOM(cells[0]);
            deleteCellFromDOM(cells[1]);
            let newCell = combineCells(cells);
            pointsToTally += newCell.value;
            newGameBoard[newCell.coord[0]][newCell.coord[1]] = newCell;
            addCellToDOM(newCell);
        });
        // console.log(newGameBoard)
        // SET SCORE
        score += pointsToTally;

        // INCREMENT
        turn += 1;

        // SET CURRENT STATE
        gameboard = newGameBoard;
        // ADD NEW RANDOM CELL
        let rand: Coord = getRandomEmptyBlock(gameboard);
        addNewCellToGame(rand);
        // CHECK IF BOARD FULL
        if (isBoardFull(newGameBoard)) {
            if(!areMovesAvailable(newGameBoard)){
                // END GAME
                console.log("GAME OVER")
                gameover = true
                // SAVE CURRENT GAME STATE TO PREVOUS IN LOCALSTORAGE
            }
        }
        saveState(score, gameboard, turn);
        canSwipe = true;
    };
    const undoTurn = () => {
        if (previousTurn) gameboard = previousTurn;
        previousTurn = null;
        clearBoardDom();
        gameboard.flat().forEach((cell: Cell | null) => {
            if (cell) {
                addCellToDOM(cell);
            }
        });
    };
    const isBoardFull = (newBoard: any[][]): boolean => {
        let empties: Coord[] = [];
        for (let i = 0; i < newBoard.length; i++) {
            for (let j = 0; j < newBoard[i].length; j++) {
                if (newBoard[i][j] == null) {
                    empties.push([i, j]);
                }
            }
        }
        return empties.length > 0 ? false : true;
    };
    const getRandomEmptyBlock = (newBoard: any[][]): Coord => {
        let empties: Coord[] = [];
        for (let i = 0; i < newBoard.length; i++) {
            for (let j = 0; j < newBoard[i].length; j++) {
                if (newBoard[i][j] == null) {
                    empties.push([i, j]);
                }
            }
        }
        return empties[Math.floor(Math.random() * empties.length)];
    };
    let gameover: boolean = false
    // CREATE/MODIFY/DELETE
    const addNewCellToGame = (coord: Coord): Cell => {
        // CREATE OBJ
        let newCellObj = createCellObj(coord);
        // INSERT INTO GAMEBOARD
        gameboard[coord[0]][coord[1]] = newCellObj;
        // INSERT INTO DOM
        addCellToDOM(newCellObj);
        return newCellObj;
    };

    // DOM MANIPULATION
    const addCellToDOM = (cell: Cell, value: number = 2) => {
        // CREATE
        const newCell = document.createElement("div");
        newCell.classList.add(
            "flex",
            "absolute",
            "flex-row",
            "items-center",
            "text-3xl",
            "font-bold",
            "justify-center",
            "rounded-sm",
            "w-1/4",
            "h-1/4",
            "p-[10px]",
            "transition-transform",
            "enter",
            "select-none"
        );
        newCell.id = `cell-${cell.id}`;
        newCell.dataset.cell = `cell-${cell.id}`;
        newCell.dataset.cellPosition = `${cell.coord}`;
        console.log(PositionMap.get(JSON.stringify(cell.coord)));
        // SET FIRST POSITION
        newCell.classList.add(PositionMap.get(JSON.stringify(cell.coord))!);
        // SET STYLE
        newCell.classList.add(`block-${cell.value}`);
        // INNER CONTENT
        newCell.innerHTML = `<div class="inner-block flex items-center justify-center rounded-md">${cell.value.toString()}</div>`;
        // MOUNT
        document.getElementById("active-cells")?.appendChild(newCell);
    };
    const PositionMap: Map<string, string> = new Map<string, string>([
        ["[0,0]", "c-0-0"],
        ["[0,1]", "c-0-1"],
        ["[0,2]", "c-0-2"],
        ["[0,3]", "c-0-3"],
        ["[1,0]", "c-1-0"],
        ["[1,1]", "c-1-1"],
        ["[1,2]", "c-1-2"],
        ["[1,3]", "c-1-3"],
        ["[2,0]", "c-2-0"],
        ["[2,1]", "c-2-1"],
        ["[2,2]", "c-2-2"],
        ["[2,3]", "c-2-3"],
        ["[3,0]", "c-3-0"],
        ["[3,1]", "c-3-1"],
        ["[3,2]", "c-3-2"],
        ["[3,3]", "c-3-3"],
    ]);
    const moveCellInDOM = (cell: Cell) => {
        const el = document.getElementById(`cell-${cell.id}`);
        el?.classList.remove(
            "c-0-0",
            "c-0-1",
            "c-0-2",
            "c-0-3",
            "c-1-0",
            "c-1-1",
            "c-1-2",
            "c-1-3",
            "c-2-0",
            "c-2-1",
            "c-2-2",
            "c-2-3",
            "c-3-0",
            "c-3-1",
            "c-3-2",
            "c-3-3"
        );
        let posClass: string = PositionMap.get(JSON.stringify(cell.coord))!;
        el?.classList.add(posClass);
    };
    const deleteCellFromDOM = (cell: Cell) => {
        const el = document.getElementById(`cell-${cell.id}`);
        el?.remove();
    };

    const swipeHandler = (event: any) => {
        switch (event.detail.direction) {
            case "bottom":
                startTurn("DOWN");
                break;
            case "top":
                startTurn("UP");
                break;
            case "left":
                startTurn("LEFT");
                break;
            case "right":
                startTurn("RIGHT");
                break;
            default:
                break;
        }
    };
</script>

<!-- MARKUP -->

<!-- OPTIONS -->
<div class="flex flex-row justify-between mb-4 w-72">
    <button
        on:click={() => initializeNewGame()}
        class="bg-neutral-300 text-black p-2 text-[12px] sm:text-xs font-bold"
        >NEW GAME</button
    >
    <button
        disabled={previousTurn == null}
        on:click={() => undoTurn()}
        class={`${
            previousTurn != null ? "bg-neutral-50" : "bg-neutral-600"
        } text-black p-2 text-[12px] sm:text-xs font-bold`}
        >UNDO TURN ({previousTurn == null ? 0 : 1})</button
    >
</div>

<!-- STATS -->
<div class="flex flex-row justify-between mb-4 text-center w-72">
    <div
        id="highest-number"
        class="text-lg sm:text-2xl bg-neutral-600 w-16 sm:w-28 h-10 flex items-center justify-center font-bold"
    >
        {findHighest(gameboard)}
    </div>
    <div class="flex flex-col gap-4 text-right">
        <div id="score-box" class="">
            <div class="font-semibold text-neutral-500 text-[12px] leading-3">
                SCORE
            </div>
            <div class="font-extrabold leading-6 text-white text-xl">
                {score}
            </div>
        </div>
        <div id="turn-box" class="">
            <div class="font-semibold text-neutral-500 text-[12px] leading-3">
                TURN
            </div>
            <div class="font-extrabold leading-6 text-white text-xl">
                {turn}
            </div>
        </div>
    </div>
</div>

<!-- GAMEBOARD -->
<!-- @ts-ignore -->
<div
    id="game-board-wrapper"
    class="w-72 h-72 border-4 select-none border-neutral-500 bg-neutral-700 box-content rounded-md flex flex-row relative overflow-hidden"
    use:swipe={{ timeframe: 300, minSwipeDistance: 60 }}
    on:swipe={swipeHandler}
>   
    <!-- GAME OVER OVERLAY -->
    {#if gameover}
        <EndGameView createNewGame={initializeNewGame}></EndGameView>
    {/if}
    <!-- GRID -->
    {#each gameboard as block}
        <div class="flex flex-col basis-1/4 relative">
            {#each block as cell}
                <div
                    class="flex flex-row items-center justify-center border-4 border-neutral-500 basis-1/4 font-bold text-neutral-600"
                />
            {/each}
        </div>
    {/each}
    <div
        id="active-cells"
        class="absolute top-0 left-0 right-0 bottom-0 w-72 h-72"
    >
        <!-- {#each gameboard as cells}
            {#each cells as cell}
                {#if cell !== null}
                    {#key cell.id}
                    <CellView cell={cell}></CellView>
                        
                    {/key}
                {/if}
            {/each}
        {/each} -->
    </div>
</div>

<style>
    #game-board-wrapper::before {
        content: "";
        position: absolute;
        width: 600px;
        left: -100px;
        top: -100px;
        height: 600px;
        z-index: -10;
        background: radial-gradient(
            circle at 50% 50%,
            rgba(0, 209, 255, 1) 0%,
            rgba(9, 0, 255, 1) 28%,
            rgba(0, 54, 212, 0) 60%
        );
    }
</style>
