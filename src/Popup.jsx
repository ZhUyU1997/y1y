import NiceModal, { useModal } from "@ebay/nice-modal-react"

function Title({ children }) {
    return (
        <div
            style={{
                fontSize: 80,
                backgroundColor: "black",
                color: "yellow",
                borderRadius: 5,
                paddingTop: 10,
                paddingBottom: 10,
                paddingLeft: 30,
                paddingRight: 30,
                border: "5px black solid",
                width: "50vw",
                textAlign: "center",
                height: "10vh",

                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                margin: 40,
            }}
        >
            <div>{children}</div>
        </div>
    )
}

function Button({ children, ...props }) {
    return (
        <div
            style={{
                fontSize: 50,
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
            <div>{children}</div>
        </div>
    )
}
export default NiceModal.create(({ title, button }) => {
    // Use a hook to manage the modal state
    const modal = useModal()
    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
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
                <Button
                    onClick={() => {
                        modal.resolve()
                        modal.remove()
                    }}
                >
                    {button}
                </Button>
            </div>
        </div>
    )
})
