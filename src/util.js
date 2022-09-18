import isMobile from "ismobilejs"

export function CreateVirtualLogger() {
    // if (isMobile(window.navigator).any === false)
    //     return
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
