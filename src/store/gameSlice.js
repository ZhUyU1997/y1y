import { createSlice } from "@reduxjs/toolkit"

function shuffle(t) {
    for (let e = t.length - 1; e >= 0; e--) {
        let o = Math.floor(Math.random() * (e + 1))
        let n = t[o]
        t[o] = t[e]
        t[e] = n
    }
    return t
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

export const BLOCK_STATE = {
    INIT: 1,
    MOVED: 2,
    REMOVED: 4,
}

function blockOverlap(blockA, blockB) {
    const a = {
        x: blockA.colNum,
        y: blockA.rowNum,
        w: 8,
        h: 8,
    }

    const b = {
        x: blockB.colNum,
        y: blockB.rowNum,
        w: 8,
        h: 8,
    }

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

function getBlockMap(blocks) {
    return Object.fromEntries(blocks.map((block) => [block.id, block]))
}

function getOvelapMap(blocks) {
    const overlapMap = {}
    const blockMap = getBlockMap(blocks)
    blocks.forEach((block) => {
        const id = block.id
        const current = { id, parent: [], children: [] }
        for (const node of Object.values(overlapMap)) {
            if (blockOverlap(block, blockMap[node.id]) === false) continue

            const isParent = node.parent.every(
                (id) => blockOverlap(block, blockMap[id]) === false
            )
            if (isParent) {
                current.children.push(node.id)
                node.parent.push(current.id)
            }
        }
        overlapMap[id] = current
    })

    return overlapMap
}

function removeBottomNodeFromMap(map, node) {
    if (node.children.length !== 0)
        throw new Error("Invalid: node.children.length !== 0")
    const id = node.id
    for (const parentId of node.parent) {
        const parent = map[parentId]
        parent.children.splice(parent.children.indexOf(id), 1)
    }
    delete map[id]
}

function removeTopNodeFromMap(map, node) {
    if (node.parent.length !== 0)
        throw new Error("Invalid: node.parent.length !== 0")
    const id = node.id
    for (const childId of node.children) {
        const child = map[childId]
        child.parent.splice(child.parent.indexOf(id), 1)
    }
    delete map[id]
}

function removeTopNodeFromMapById(map, id) {
    const node = map[id]
    removeTopNodeFromMap(map, node)
}

function getRandomBottomBlock(blockMap, map) {
    function getBottomNodes(map) {
        return Object.values(map).filter((node) => {
            return node && node.children.length === 0
        })
    }

    const bottomNodes = getBottomNodes(map)
    const node = bottomNodes[getRandomInt(0, bottomNodes.length - 1)]
    removeBottomNodeFromMap(map, node)
    return blockMap[node.id]
}

function checkIfDim(state) {
    Object.values(state.blocks).forEach((block) => {
        if (block.id in state.overlapMap)
            block.overlap = state.overlapMap[block.id].parent.length !== 0
    })
}

// legacy
function createRandomBlockTypeObj(data) {
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
    return [blocks, []]
}

function createSolvableBlockTypeObj(blockTypeData, blocks) {
    const blockTypeCount = { ...blockTypeData }

    Object.entries(
        blocks
            .filter((block) => block.type !== 0)
            .map((block) => block.type)
            .reduce((sum, type) => {
                if (type in sum) sum[type] += 1
                else sum[type] = 1
            }, {})
    ).forEach(([type, count]) => {
        if (type in blockTypeCount) blockTypeCount[type] += count / 3
        else blockTypeCount[type] = count / 3
    })

    const blockTypeArr = Object.entries(blockTypeCount)
        .map(([type, count]) => Array(count).fill(type))
        .flatMap((i) => i)

    shuffle(blockTypeArr)

    const movedBlockType = []
    const moveSteps = []
    const map = getOvelapMap(blocks)
    const blockMap = getBlockMap(blocks)
    while (blockTypeArr.length !== 0 || movedBlockType.length !== 0) {
        const isRecoveryFromRemoved = true // getRandomInt(0,1) === 1
        const mustRecoveryFromMoved =
            movedBlockType.length > 4 ||
            blockTypeArr.length === 0 ||
            movedBlockType.some(
                (type) => type === blockTypeArr[blockTypeArr.length - 1]
            )
        const mustRecoveryFromRemoved = movedBlockType.length === 0

        const canRecoveryFromRemoved =
            (!mustRecoveryFromMoved && isRecoveryFromRemoved) ||
            mustRecoveryFromRemoved

        const block = getRandomBottomBlock(blockMap, map)
        block.state = BLOCK_STATE.INIT
        moveSteps.push(block.id)
        // console.log(movedBlockType, canRecoveryFromRemoved ? "FromRemoved" : "FromMoved")

        if (canRecoveryFromRemoved) {
            const type = blockTypeArr.pop()
            movedBlockType.push(type, type)
            block.type = type
        } else {
            const index = getRandomInt(0, movedBlockType.length - 1)
            const type = movedBlockType[index]
            movedBlockType.splice(index, 1)
            block.type = type
        }
    }
    if (blockTypeArr.length !== 0) throw new Error("blockTypeArr.length !==0")

    moveSteps.reverse()
    return moveSteps
}

function updateData(state) {
    const blocks = state.blocks
        .filter((block) => block.state === BLOCK_STATE.MOVED)
        .sort((a, b) => a.order - b.order)
        .reduce((list, block) => {
            const entry = list
                .map((item, index) => [item, index])
                .reverse()
                .find(([item, index]) => item.type === block.type)

            if (entry) {
                list.splice(entry[1] + 1, 0, block)
            } else {
                list.push(block)
            }
            return list
        }, [])

    blocks.forEach((block, index) => {
        block.order = index
    })

    return blocks.length
}

function _stashBlocks(state) {
    const blocks = state.blocks
        .filter((block) => block.state === BLOCK_STATE.MOVED)
        .sort((a, b) => a.order - b.order)
        .filter((block, index) => index < 3)

    blocks.forEach((block, index) => {
        block.order = index
        block.state = BLOCK_STATE.INIT

        block.colNum = 4.5 + 16 + index * 8
        block.rowNum = 80

        console.log(block)
    })

    state.blocks = [
        ...state.blocks.filter((block) => !blocks.includes(block)),
        ...blocks,
    ]

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
    const { record, moveSteps, ...reset } = state
    // state.record.push(cloneDeep(reset))
    const data = JSON.parse(JSON.stringify(reset))
    state.record.push(data)
}

function recovery(state) {
    const { record, moveSteps, ...reset } = state
    const data = state.record.pop() ?? reset
    for (const [k, v] of Object.entries(data)) state[k] = v
}

function recoveryInitState(state) {
    const { record, moveSteps, ...reset } = state
    const data = state.record[0] ?? reset
    for (const [k, v] of Object.entries(data)) state[k] = v
}

export const gameSlice = createSlice({
    name: "game",
    initialState: {
        blocks: [],
        moveSteps: [],
        win: false,
        lose: false,
        willRemove: false,
        overlapMap: [],
        record: [],
    },
    reducers: {
        initGame: (state, action) => {
            console.time("initGame")
            const { blockTypeData, levelData } = action.payload
            const blocks = Object.values(levelData)
                .flatMap((i) => i)
                .map((i) => ({
                    ...i,
                    colNum: i.rolNum,
                    overlap: false,
                    state: BLOCK_STATE.REMOVED,
                }))
            const moveSteps = createSolvableBlockTypeObj(blockTypeData, blocks)

            state.blocks = blocks
            state.moveSteps = moveSteps

            state.movedOrder = 0
            state.win = 0
            state.lose = 0
            state.record = []

            state.overlapMap = getOvelapMap(state.blocks)
            checkIfDim(state)
            console.timeEnd("initGame")
        },
        moveOutBlock: (state, action) => {
            if (state.willRemove) return
            console.time("moveOutBlock")
            backup(state)

            const id = action.payload
            const block = state.blocks.find((b) => b.id === id)

            if (block.state !== BLOCK_STATE.INIT || block.overlap === true)
                throw new Error("Invalid Move")
            block.state = BLOCK_STATE.MOVED
            block.order = 100

            updateData(state)
            removeTopNodeFromMapById(state.overlapMap, block.id)
            checkIfDim(state)

            if (checkIfNeedRemove(state) === false) checkWinOrLose(state)

            console.timeEnd("moveOutBlock")
        },
        stashBlocks: (state) => { },
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
        restoreBlocks: (state) => {
            recoveryInitState(state)
            checkIfDim(state)
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
    stashBlocks,
    restoreBlocks,
    cancelMove,
    removeBlocks,
    shuffleBlock,
} = gameSlice.actions

export default gameSlice.reducer
