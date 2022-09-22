import { useEffect, useLayoutEffect } from "react"
import Popup, { SettingPopup } from "./Popup"
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

import data from "./level-data/90023.json"
import block_bg from "./assets/block_bg.png"
import bg from "./assets/bg.png"
import area_center from "./assets/fence/center.png"
import area_row from "./assets/fence/row.png"
import area_col from "./assets/fence/col.png"
import blue_button from "./assets/button/blue.png"
import skill1 from "./assets/button/skill1.png"
import skill2 from "./assets/button/skill2.png"
import skill3 from "./assets/button/skill3.png"
import setting from "./assets/setting.png"
import { useRegisterSW } from "virtual:pwa-register/react"
import { useState } from "react"

function Block({ type, colNum, rowNum, overlap = false, style, ...props }) {
    return (
        <div
            className={`block ${overlap ? "" : "active"}`}
            tabIndex={-1}
            style={{
                boxSizing: "border-box",
                width: 120,
                height: 135,
                willChange: "transform filter opacity",
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
                WebkitBorderImage: `url(${area_center})`,
                borderImage: `url(${area_center})`,
                borderImageSlice: "30 30 fill",
                borderImageWidth: "30px 30px",
                // https://stackoverflow.com/questions/21025212/border-image-not-showing-in-safari
                borderStyle: "solid",
                borderWidth: 0.1,
            }}
        >
            <div
                style={{
                    boxSizing: "border-box",
                    willChange: "transform",
                    width: 120 * 7 + 72,
                    height: 80,
                    position: "absolute",
                    left: -20,
                    top: 145,
                    borderRadius: 10,
                    backgroundImage: `url(${area_row})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "100%",
                    backgroundPosition: "center",
                }}
            >
                <div
                    style={{
                        boxSizing: "border-box",
                        willChange: "transform",
                        width: 30,
                        height: 245,
                        position: "absolute",
                        left: 0,
                        bottom: 5,
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
                        right: 0,
                        bottom: 5,
                        borderRadius: 10,
                        backgroundImage: `url(${area_col})`,
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "contain",
                    }}
                ></div>
            </div>
        </div>
    )
}

function SkillButton({ skillImage, style, onClick, ...props }) {
    const [count, setCount] = useState(0)
    return (
        <div
            className="skillbtn"
            tabIndex={-1}
            style={{
                position: "relative",
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
            onClick={() => {
                onClick?.()
                setCount((count) => count + 1)
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

            <div
                style={{
                    position: "absolute",
                    backgroundColor: "black",
                    borderRadius: 20,
                    right: -20,
                    top: -12,
                    height: 40,
                    minWidth: 40,
                    boxShadow: "2px 4px rgba(0,0,0,0.3)",
                    display: "flex",
                    textAlign: "center",
                    justifyContent: "center",
                    color: "white",
                    lineHeight: "40px",
                    fontSize: 23,
                }}
            >
                {count === 0 ? "+" : count}
            </div>
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

function getScale(size, width, height) {
    return size.width / size.height < width / height
        ? size.width / width
        : size.height / height
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
                button: ["撤销操作", "重新挑战"],
            }).then((index) => {
                if (index === 0) dispatch(cancelMove(data))
                else dispatch(initGame(data))
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

function ChessBoard({ blocks, width, height, onClickBlock, onUseSkill }) {
    const moveOutAreaCol = 4.5
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
                        transition:
                            "filter 0.3s, left 0.4s, top 0.4s, opacity 0.4s, transform 0.4s",
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

                        transition:
                            "filter 0.3s, left 0.4s, top 0.4s, opacity 0.4s, transform 0.4s",
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
                    style={{
                        transition: "filter 0.3s, transform 0.4s",
                    }}
                />
            )
    })
    return (
        <div
            style={{
                width,
                height,
                minWidth: width,
                minHeight: height,
                display: "flex",
                position: "relative",
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

function Setting({ style, ...props }) {
    return (
        <div
            tabIndex={-1}
            style={{
                boxSizing: "border-box",
                willChange: "transform",
                width: 120,
                height: 120,
                backgroundImage: `url(${setting})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "contain",
                ...style,
            }}
            {...props}
        ></div>
    )
}

function MainScreen() {
    const size = useWindowSize()
    const width = 15 * 65
    const height = 15 * 115 + 120
    const scale = getScale(size, width, height)
    const { blocks, dispatch, shuffleBlock, cancelMove } = useGame(data)

    return (
        <div
            style={{
                width,
                height,
                minWidth: width,
                minHeight: height,
                display: "flex",
                flexDirection: "column",
                position: "relative",
                willChange: "transform",
                transform: `scale(${scale})`,
                overflow: "hidden",
            }}
        >
            <Setting
                onClick={() => {
                    NiceModal.show(SettingPopup)
                }}
            ></Setting>
            <ChessBoard
                width={15 * 65}
                height={15 * 115}
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

function useUpdatePrompt() {
    /// https://vite-plugin-pwa.netlify.app/frameworks/react.html#prompt-for-update
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            // eslint-disable-next-line prefer-template
            console.log("SW Registered: " + r)
        },
        onRegisterError(error) {
            console.log("SW registration error", error)
        },
    })

    useEffect(() => {
        if (needRefresh) {
            NiceModal.show(Popup, {
                title: "版本更新了",
                button: "确认",
            }).then(() => {
                updateServiceWorker(true)
            })
        }
    }, [needRefresh, updateServiceWorker])
}

function App() {
    useUpdatePrompt()

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
            // onClick={() => {
            //     if (isMobile(window.navigator).any && screenfull.isEnabled) {
            //         screenfull.request()
            //     }
            // }}
        >
            <MainScreen></MainScreen>
        </div>
    )
}

export default App
