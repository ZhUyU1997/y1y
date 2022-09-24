import { createSlice } from "@reduxjs/toolkit"
import cloneDeep from "lodash/cloneDeep"

function shuffle(t) {
    for (let e = t.length - 1; e >= 0; e--) {
        let o = Math.floor(Math.random() * (e + 1))
        let n = t[o]
        t[o] = t[e]
        t[e] = n
    }
    return t
}

export const BLOCK_STATE = {
    INIT: 1,
    MOVED: 2,
    REMOVED: 4,
}

function blockOverlap(a, b) {
    const r = {
        x: 0,
        y: 0,
        w: 0,
        h: 0,
    }

    const x0 = Math.max(a.x, b.x)
    const x1 = Math.min(a.x + a.w, b.x + b.w)

    if (x0 <= x1) {
        const y0 = Math.max(a.y, b.y)
        const y1 = Math.min(a.y + a.h, b.y + b.h)
        if (y0 <= y1) {
            r.x = x0
            r.y = y0
            r.w = x1 - x0
            r.h = y1 - y0
        }
    }
    if (r.w > 0 && r.h > 0) return true
    return false
}

function checkIfDim(blocks) {
    const checkedBlocks = []
    blocks
        .filter(
            (block) =>
                block.state !== BLOCK_STATE.MOVED &&
                block.state !== BLOCK_STATE.REMOVED
        )
        .forEach((block) => {
            block.overlap = false

            for (const lowerBlock of checkedBlocks) {
                if (lowerBlock.overlap) continue

                if (
                    blockOverlap(
                        {
                            x: block.rolNum,
                            y: block.rowNum,
                            w: 8,
                            h: 8,
                        },
                        {
                            x: lowerBlock.rolNum,
                            y: lowerBlock.rowNum,
                            w: 8,
                            h: 8,
                        }
                    )
                ) {
                    lowerBlock.overlap = true
                }
            }
            checkedBlocks.push(block)
        })
}

function createBlockTypeObj(data) {
    const { blockTypeData, levelData } = data
    let blockTypeArr = []
    for (const [type, count] of Object.entries(blockTypeData)) {
        for (let n = 0; n < 3 * count; n++) blockTypeArr.push(type)
    }

    shuffle(blockTypeArr)

    const blocks = Object.values(levelData)
        .flatMap((i) => i)
        .map((i) => ({
            ...i,
            colNum: i.rolNum,
            overlap: false,
            type: 0 === i.type ? blockTypeArr.pop() : i.type,
            state: BLOCK_STATE.INIT,
        }))

    if (blockTypeArr.length !== 0) throw new Error("blockTypeArr.length !==0")
    checkIfDim(blocks)
    return blocks
}

function updateData(state) {
    const blocks = state.blocks
        .filter((block) => block.state === BLOCK_STATE.MOVED)
        .sort((a, b) => a.order - b.order)
        .reduce((list, block) => {
            const index = list.findLastIndex((b) => b.type === block.type)

            if (index !== -1) {
                list.splice(index + 1, 0, block)
            } else {
                list.push(block)
            }
            return list
        }, [])

    blocks.forEach((block, index) => {
        block.order = index
    })

    checkIfDim(state.blocks)
    return blocks.length
}

function _removeBlocks(state) {
    const blocks = state.blocks
        .filter((block) => block.state === BLOCK_STATE.MOVED)
        .sort((a, b) => a.order - b.order)
    const group = blocks.reduce((group, block) => {
        const { type } = block
        group[type] ??= []
        group[type].push(block)
        return group
    }, {})

    Object.values(group)
        .filter((blocks) => blocks.length >= 3)
        .forEach((blocks) => {
            blocks.forEach((block, index) => {
                // just remove three blocks even if over three
                // if (index < 3)
                block.state = BLOCK_STATE.REMOVED
            })
        })

    blocks
        .filter((block) => block.state === BLOCK_STATE.MOVED)
        .forEach((block, index) => {
            block.order = index
        })
    state.willRemove = false
}

function checkIfNeedRemove(state) {
    const blocks = state.blocks
        .filter((block) => block.state === BLOCK_STATE.MOVED)
        .sort((a, b) => a.order - b.order)
    const group = blocks.reduce((group, block) => {
        const { type } = block
        group[type] ??= []
        group[type].push(block)
        return group
    }, {})
    const result = Object.values(group).some((blocks) => blocks.length >= 3)

    state.willRemove = result
    return result
}
function checkWinOrLose(state) {
    state.win = state.blocks.every(
        (block) => block.state === BLOCK_STATE.REMOVED
    )
    state.lose =
        state.blocks.filter((block) => block.state === BLOCK_STATE.MOVED)
            .length >= 7
}

function backup(state) {
    const { record, ...reset } = state
    state.record.push(cloneDeep(reset))
}

function recovery(state) {
    const { record, ...reset } = state
    const { blocks, win, lose, willRemove } = state.record.pop() ?? reset
    state.blocks = blocks
    state.win = win
    state.lose = lose
    state.willRemove = willRemove
}

export const gameSlice = createSlice({
    name: "game",
    initialState: {
        blocks: [],
        win: false,
        lose: false,
        willRemove: false,
        record: [],
    },
    reducers: {
        initGame: (state, action) => {
            state.blocks = createBlockTypeObj(action.payload)
            state.movedOrder = 0
            state.win = 0
            state.lose = 0
            state.record = []
        },
        moveOutBlock: (state, action) => {
            if (state.willRemove) return
            backup(state)

            const { id } = action.payload
            const block = state.blocks.find((b) => b.id === id)
            block.state = BLOCK_STATE.MOVED
            block.order = 100
            updateData(state)

            if (checkIfNeedRemove(state) === false) checkWinOrLose(state)
        },
        shuffleBlock: (state) => {
            backup(state)
            const blocks = state.blocks.filter(
                (block) =>
                    block.state !== BLOCK_STATE.MOVED &&
                    block.state !== BLOCK_STATE.REMOVED
            )
            const blockTypeData = shuffle(blocks.map((block) => block.type))
            blocks.forEach((block) => {
                block.type = blockTypeData.pop()
            })
        },

        cancelMove: (state) => {
            recovery(state)
            checkWinOrLose(state)
        },
        removeBlocks: (state) => {
            _removeBlocks(state)
            checkWinOrLose(state)
        },
    },
})

export const {
    initGame,
    moveOutBlock,
    cancelMove,
    removeBlocks,
    shuffleBlock,
} = gameSlice.actions

export default gameSlice.reducer
