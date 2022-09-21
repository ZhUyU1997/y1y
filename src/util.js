import dayjs from "dayjs"

export function CreateVirtualLogger() {
    var output = document.createElement("p")
    output.id = "logger"
    document.body.appendChild(output)

    // Reference to native method(s)
    var oldLog = console.log

    console.log = function (...items) {
        // Call native method first
        oldLog.apply(this, items)

        // Use JSON to transform objects, all others display normally
        items.forEach((item, i) => {
            items[i] =
                typeof item === "object" ? JSON.stringify(item, null, 4) : item
        })
        output.innerHTML += items.join(" ") + "<br />"
    }
}

export function getVersion() {
    return __APP_VERSION__
}

export function getTime() {
    return dayjs(__APP_BUILD_TIME).format("YYYY-MM-DD HH:mm:ss")
}
