import { useLayoutEffect } from "react"
import Popup from "./Popup"
import NiceModal from "@ebay/nice-modal-react"
import { GetBlockImageByType } from "./blockImage"
import { useWindowSize } from "@react-hookz/web/esm"
import { useSelector, useDispatch } from "react-redux"
import {
    cancelMove,
    initGame,
    moveOutBlock,
    shuffleBlock,
} from "./store/gameSlice"

import screenfull from "screenfull"
import isMobile from "ismobilejs"

import "./App.css"

import data from "./level-data/90018.json"
import block_bg from "./assets/block_bg.png"
import bg from "./assets/bg.png"
import area_center from "./assets/fence/center.png"
import area_row from "./assets/fence/row.png"
import area_col from "./assets/fence/col.png"
import blue_button from "./assets/button/blue.png"
import skill1 from "./assets/button/skill1.png"
import skill2 from "./assets/button/skill2.png"
import skill3 from "./assets/button/skill3.png"

function Block({ type, colNum, rowNum, overlap = false, style, ...props }) {
    return (
        <div
            className={`block ${overlap ? "" : "active"}`}
            tabIndex={-1}
            style={{
                boxSizing: "border-box",
                width: 120,
                height: 135,
                position: "absolute",
                left: colNum * 15,
                top: rowNum * 15,
                borderRadius: 10,
                backgroundImage: `url(${block_bg})`,
                // border:"1px solid red",
                backgroundRepeat: "no-repeat",

                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                filter: overlap ? "brightness(0.4)" : undefined,
                paddingLeft: 15,
                paddingRight: 15,
                paddingTop: 13,
                paddingBottom: 21,
                transition:
                    "filter 0.3s, left 0.4s, top 0.4s, opacity 0.4s, transform 0.4s",
                ...style,
            }}
            {...props}
        >
            <div
                style={{
                    backgroundImage: `url(${GetBlockImageByType(type)})`,
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "contain",
                    width: "100%",
                    height: "100%",
                }}
            ></div>
        </div>
    )
}

function MoveOutArea({ colNum, rowNum }) {
    return (
        <div
            style={{
                boxSizing: "border-box",
                willChange: "transform",
                width: 120 * 7 + 15 * 2,
                height: 185,
                position: "absolute",
                left: (colNum - 1) * 15,
                top: (rowNum - 1) * 15,
                borderImage: `url(${area_center})`,
                borderImageSlice: "30 30 fill",
                borderImageWidth: "30px 30px",
            }}
        >
            <div
                style={{
                    boxSizing: "border-box",
                    willChange: "transform",
                    width: 120 * 7 + 66,
                    height: 185,
                    position: "absolute",
                    left: -20,
                    top: 145,
                    borderRadius: 10,
                    backgroundImage: `url(${area_row})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "contain",
                }}
            ></div>
            <div
                style={{
                    boxSizing: "border-box",
                    willChange: "transform",
                    width: 30,
                    height: 245,
                    position: "absolute",
                    left: -20,
                    top: -25,
                    borderRadius: 10,
                    backgroundImage: `url(${area_col})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "contain",
                }}
            ></div>
            <div
                style={{
                    boxSizing: "border-box",
                    willChange: "transform",
                    width: 30,
                    height: 245,
                    position: "absolute",
                    right: -20,
                    top: -25,
                    borderRadius: 10,
                    backgroundImage: `url(${area_col})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "contain",
                }}
            ></div>
        </div>
    )
}

function SkillButton({ skillImage, style, ...props }) {
    return (
        <div
            className="skillbtn"
            tabIndex={-1}
            style={{
                boxSizing: "border-box",
                willChange: "transform",
                width: 180,
                height: 155,
                borderImage: `url(${blue_button})`,
                borderImageSlice: "30 30 fill",
                borderImageWidth: "30px 30px",
                borderImageOutset: "7px 7px 21px 7px",
                backgroundImage: `url(${skill1})`,
                padding: 10,
                ...style,
            }}
            {...props}
        >
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    backgroundImage: `url(${skillImage})`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    backgroundSize: "contain",
                }}
            ></div>
        </div>
    )
}
function Skill({ colNum, rowNum, onUseSkill }) {
    return (
        <div
            style={{
                boxSizing: "border-box",
                willChange: "transform",
                position: "absolute",
                width: "100%",
                left: colNum * 15,
                top: rowNum * 15,
                display: "flex",
                justifyContent: "space-evenly",
            }}
        >
            <SkillButton
                skillImage={skill1}
                onClick={() => {
                    onUseSkill?.(0)
                }}
            ></SkillButton>
            <SkillButton
                skillImage={skill2}
                onClick={() => {
                    onUseSkill?.(1)
                }}
            ></SkillButton>
            <SkillButton
                skillImage={skill3}
                onClick={() => {
                    onUseSkill?.(2)
                }}
            ></SkillButton>
        </div>
    )
}

function getScale(size) {
    return size.width / size.height < 65 / 115.0
        ? size.width / (15 * 65)
        : size.height / (15 * 115)
}
function ChessBoard({ blocks, onClickBlock, onUseSkill }) {
    const size = useWindowSize()
    const scale = getScale(size)

    const moveOutAreaCol = 5
    const moveOutAreaRow = 80

    const Blocks = blocks.map((block) => {
        const { type, id } = block

        const { rolNum: colNum, rowNum, overlap } = block

        if (block.removed) {
            return (
                <Block
                    key={id}
                    type={type}
                    onClick={() => onClickBlock(block)}
                    colNum={moveOutAreaCol + block.order * 8}
                    rowNum={moveOutAreaRow}
                    style={{
                        transform: "scale(0.1)",
                        opacity: 0,
                    }}
                />
            )
        } else if (block.moved)
            return (
                <Block
                    key={id}
                    type={type}
                    colNum={moveOutAreaCol + block.order * 8}
                    rowNum={moveOutAreaRow}
                    style={{
                        zIndex: 1,
                    }}
                />
            )
        else
            return (
                <Block
                    key={id}
                    type={type}
                    onClick={() => {
                        if (block.overlap == false) onClickBlock(block)
                    }}
                    colNum={colNum}
                    rowNum={rowNum}
                    overlap={overlap}
                />
            )
    })
    return (
        <div
            style={{
                width: 15 * 65,
                height: 15 * 115,
                minWidth: 15 * 65,
                minHeight: 15 * 115,
                display: "flex",
                position: "relative",
                willChange: "transform",
                transform: `scale(${scale})`,
            }}
        >
            <MoveOutArea
                colNum={moveOutAreaCol}
                rowNum={moveOutAreaRow}
            ></MoveOutArea>
            {Blocks}
            <Skill
                colNum={0}
                rowNum={moveOutAreaRow + 15}
                onUseSkill={onUseSkill}
            ></Skill>
        </div>
    )
}

function useGame(data) {
    const blocks = useSelector((state) => state.game.blocks)
    const win = useSelector((state) => state.game.win)
    const lose = useSelector((state) => state.game.lose)

    const dispatch = useDispatch()
    useLayoutEffect(() => {
        dispatch(initGame(data))
    }, [])

    useLayoutEffect(() => {
        if (win) {
            NiceModal.show(Popup, {
                title: "恭喜你通关了",
                button: "再来一局",
            }).then(() => {
                dispatch(initGame(data))
            })
        } else if (lose) {
            NiceModal.show(Popup, {
                title: "槽位已满",
                button: "重新挑战",
            }).then(() => {
                dispatch(initGame(data))
            })
        }
    }, [win, lose, dispatch, data])
    return {
        blocks,
        dispatch,
        shuffleBlock() {
            dispatch(shuffleBlock())
        },
        cancelMove() {
            dispatch(cancelMove())
        },
    }
}

function App() {
    const size = useWindowSize()
    const scale = getScale(size)

    const { blocks, dispatch, shuffleBlock, cancelMove } = useGame(data)
    return (
        <div
            style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: "min(50vw,400px)",
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
            }}
            onClick={() => {
                if (isMobile(window.navigator).any && screenfull.isEnabled) {
                    screenfull.request()
                }
            }}
        >
            <ChessBoard
                blocks={blocks}
                onClickBlock={(block) => {
                    // if (block.overlap == false) board.moveOutBlock(block)
                    dispatch(moveOutBlock(block))

                    // forceUpdate({})
                }}
                onUseSkill={(index) => {
                    if (index == 1) {
                        cancelMove()
                    } else if (index == 2) {
                        shuffleBlock()
                    }
                }}
            ></ChessBoard>
        </div>
    )
}

export default App
