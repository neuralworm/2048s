/* eslint-disable prefer-const */
// place files you want to import through the `$lib` alias in this folder.
import {v4} from 'uuid'
import type { GameBoard } from './types/GameBoard';

export interface Cell {
    value: number,
    id: string,
    coord: Coord
}
export type Coord = [number, number]
// HANDLES CREATING CELL AND APPENDING TO GAMEBOARD AS WELL AS MOUNTING IN DOM
export const createCellObj = (coord: Coord): Cell => {
    return {
        value: 2,
        id: v4(),
        coord: coord
    }
}
export const combineCells = (cells: Cell[]) => {
    const newCell = createCellObj(cells[0].coord)
    newCell.value = cells[0].value + cells[1].value
    return newCell
}
export const getRandBoardBlock = (): Coord => {
    const rand1 = Math.floor(Math.random() * 4)
    const rand2 = Math.floor(Math.random() * 4)
    return [rand1, rand2]
}





// TRANSFORMS
export const boardColsToRows = (orig: any[][]): any[][] => {
    return orig.map((col: any[], ind: number) => {
        return [orig[0][ind], orig[1][ind], orig[2][ind], orig[3][ind]]
    })
}
export const boardRowsToCols = (orig: any[][]): any[][] => {
    return orig.map((col: any[], ind: number) => {
        return [orig[0][ind], orig[0 + 1][ind], orig[0 + 2][ind], orig[0 + 3][ind]]
    })
}
export const canIMoveTo = (from: Cell, to: Cell|null|Cell[]): boolean => {
    if(to == null) return true
    if(Array.isArray(to)) return false
    if(to.value == from.value) return true
    return false
}

export const deepCopy = (board: GameBoard) => {
    return JSON.parse(JSON.stringify([[...board[0]], [...board[1]], [...board[2]], ...[board[3]]]))
}

// GAME STATE
export const areMovesAvailable = (board: GameBoard) => {
    const rows = board.length;
    const cols = board[0].length;
  
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const currentCell = board[i][j]
        if(currentCell == null) continue
        const value = currentCell.value
        if (
          (i > 0 && board[i - 1][j]?.value === value) ||
          (i < rows - 1 && board[i + 1][j]?.value === value) ||
          (j > 0 && board[i][j - 1]?.value === value) ||
          (j < cols - 1 && board[i][j + 1]?.value === value)
        ) {
          return true;
        }
      }
    }
    return false;
  }

// PERSISTENCE
export interface GameState {
    score: number,
    gameboard: any[][],
    turns: number,
    largest: number,
    date: number,
    user: string
}
export const saveState = (score: number, gameboard: GameBoard, turns: number) => {
    let gameState: GameState = {
        score: score,
        gameboard: gameboard,
        turns: turns,
        largest: findHighest(gameboard),
        date: Date.now(),
        user: "CURRENT_USER"
    }
    localStorage.setItem("currentGame", JSON.stringify(gameState))
}
export const loadState = (): GameState|null => {
    let saveString: string|null = localStorage.getItem("currentGame")
    if(!saveString) return null
    return JSON.parse(saveString)
}
// STYLE
export const BoxPosition = (coord: Coord): string => {
    let left = coord[0] == 0 ? "0" : (coord[0] == 1 ? "1/4" : (coord[0] == 2 ? "1/2" : "3/4"))
    let top = coord[1] == 0 ? "0" : (coord[1] == 1 ? "1/4" : (coord[1] == 2 ? "1/2" : "3/4"))
    return `translate-x-${left} translate-y-${top} `
}

// DOM MANIPULATION
export const createCellComponent = () => {
    return
}

// UTIL
export const findHighest = (gameBoard: any[][]): number => {
    let highest = 0
    gameBoard.forEach((gameCol: any[])=> gameCol.forEach((cell: Cell) => {
        if(cell !== null && cell.value > highest) highest = cell.value
    }))
    return highest
}