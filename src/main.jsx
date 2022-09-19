import "core-js/es/array/find-last-index"

import React from "react"
import ReactDOM from "react-dom/client"
import NiceModal from "@ebay/nice-modal-react"

import App from "./App"
import "./index.css"

import store from "./store"
import { Provider } from "react-redux"

import Popup from "./Popup"
import { registerSW } from "virtual:pwa-register"

const updateSW = registerSW({
    onNeedRefresh() {
        NiceModal.show(Popup, {
            title: "版本更新了",
            button: "确认",
        }).then(() => {
            updateSW()
        })
    },
    onOfflineReady() {},
})

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <NiceModal.Provider>
            <Provider store={store}>
                <App />
            </Provider>
        </NiceModal.Provider>
    </React.StrictMode>
)

// import { CreateVirtualLogger } from "./util"
// CreateVirtualLogger()
