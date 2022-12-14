import NiceModal, { useModal } from "@ebay/nice-modal-react"
import { CreateVirtualLogger, getTime, getVersion } from "./util"

function Title({ children }) {
    return (
        <div
            style={{
                fontSize: "10vw",
                fontWeight: 600,
                backgroundColor: "black",
                color: "yellow",
                borderRadius: 5,
                paddingTop: 10,
                paddingBottom: 10,
                paddingLeft: 30,
                paddingRight: 30,
                border: "5px black solid",
                minWidth: "70vw",
                textAlign: "center",
                minHeight: "15vh",

                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                margin: 40,
                padding: "3vw",
                overflow: "hidden    ",
            }}
        >
            {children}
        </div>
    )
}

function Info({ children }) {
    return (
        <div
            style={{
                fontSize: "3vw",
                backgroundColor: "white",
                color: "black",
                border: "10px black solid",
                minWidth: "70vw",
                textAlign: "start",
                minHeight: "30vh",
                borderRadius: 30,

                display: "flex",
                justifyContent: "flex-start",
                alignItems: "flex-start",
                flexDirection: "column",
                margin: 40,
                overflow: "hidden",
                padding: 5,
            }}
        >
            <div
                style={{
                    border: "4px gray solid",
                    width: "100%",
                    height: "100%",
                    borderRadius: 15,
                    boxSizing: "border-box",
                    paddingTop: 10,
                    paddingBottom: 10,
                    paddingLeft: 30,
                    paddingRight: 30,
                }}
            >
                {children}
            </div>
        </div>
    )
}

function Button({ children, ...props }) {
    return (
        <div
            style={{
                fontSize: "4vw",
                fontWeight: 600,
                borderRadius: 10,
                backgroundColor: "white",
                color: "black",
                paddingTop: 10,
                paddingBottom: 10,
                paddingLeft: 30,
                paddingRight: 30,
                border: "5px black solid",
                boxShadow: "5px 5px rgb(0,0,0,0.3)",

                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
            }}
            {...props}
        >
            {children}
        </div>
    )
}
export default NiceModal.create(({ title, button }) => {
    // Use a hook to manage the modal state
    const modal = useModal()
    const buttonArr = Array.isArray(button) ? button : [button]

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                position: "fixed",
                left: 0,
                top: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgb(0,0,0,0.5)",
            }}
        >
            <div
                style={{
                    width: "80vw",
                    height: "80vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    lineHeight: 1.5,
                }}
            >
                <Title>{title}</Title>
                <div
                    style={{
                        display: "flex",
                        gap: 20,
                    }}
                >
                    {buttonArr.map((text, index) => (
                        <Button
                            key={text}
                            onClick={() => {
                                modal.resolve(index)
                                modal.remove()
                            }}
                        >
                            {text}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    )
})

export const SettingPopup = NiceModal.create(() => {
    // Use a hook to manage the modal state
    const modal = useModal()
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                position: "fixed",
                left: 0,
                top: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgb(0,0,0,0.5)",
            }}
        >
            <div
                style={{
                    width: "80vw",
                    height: "80vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    lineHeight: 1.5,
                }}
            >
                <Info>
                    ???????????????{getVersion()}-{getTime()}
                </Info>
                <div
                    style={{
                        display: "flex",
                        gap: 20,
                    }}
                >
                    <Button
                        onClick={() => {
                            CreateVirtualLogger()
                            modal.resolve()
                            modal.remove()
                        }}
                    >
                        ??????
                    </Button>
                    <Button
                        onClick={() => {
                            modal.resolve()
                            modal.remove()
                        }}
                    >
                        ??????
                    </Button>
                </div>
            </div>
        </div>
    )
})
