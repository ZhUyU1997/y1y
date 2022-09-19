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
        .filter((block) => !block.moved && !block.removed)
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
            removed: false,
            moved: false,
            overlap: false,
            type: 0 === i.type ? blockTypeArr.pop() : i.type,
        }))

    checkIfDim(blocks)
    return blocks
}

function updateData(state) {
    const blocks = state.blocks
        .filter((block) => block.moved && !block.removed)
        .sort((a, b) => a.order - b.order)
        .reduce((list, block) => {
            const index = list.findLastIndex((b) => b.type === block.type)

            if (index !== -1) {
                console.log("find same")
                list.splice(index + 1, 0, block)
            } else {
                list.push(block)
            }
            return list
        }, [])

    blocks
        .filter((block) => block.moved && !block.removed)
        .forEach((block, index) => {
            block.order = index
        })

    const group = blocks.reduce((group, block) => {
        const { type } = block
        group[type] ??= []
        group[type].push(block)
        return group
    }, {})

    Object.values(group)
        .filter((blocks) => blocks.length >= 3)
        .forEach((blocks) => {
            blocks.forEach((block) => {
                block.removed = true
            })
        })

    blocks
        .filter((block) => block.moved && !block.removed)
        .forEach((block, index) => {
            block.order = index
        })
    checkIfDim(state.blocks)

    checkWinOrLose(state)
}

function checkWinOrLose(state) {
    state.win = state.blocks.every((block) => block.removed)
    state.lose =
        state.blocks.filter((block) => block.moved && !block.removed).length >=
        7
}

export const gameSlice = createSlice({
    name: "game",
    initialState: {
        blocks: [],
        win: false,
        lose: false,
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
            state.record.push(cloneDeep(state.blocks))

            const { id } = action.payload
            const block = state.blocks.find((b) => b.id === id)
            block.moved = true
            block.order = 100
            updateData(state)
        },
        shuffleBlock: (state) => {
            state.record.push(cloneDeep(state.blocks))

            const blocks = state.blocks.filter(
                (block) => !block.moved && !block.removed
            )
            const blockTypeData = shuffle(blocks.map((block) => block.type))
            blocks.forEach((block) => {
                block.type = blockTypeData.pop()
            })
        },

        cancelMove: (state) => {
            state.blocks = state.record.pop() ?? state.blocks
            checkWinOrLose(state)
        },
    },
})
// 每个 case reducer 函数会生成对应的 Action creators
export const { initGame, moveOutBlock, cancelMove, shuffleBlock } =
    gameSlice.actions

export default gameSlice.reducer
