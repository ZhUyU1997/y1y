import { configureStore } from "@reduxjs/toolkit"
import gameReducer from "./gameSlice"

export default configureStore({
    reducer: {
        game: gameReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredPaths: ["game.record", "game.overlapMap"],
            },
        }),
})
