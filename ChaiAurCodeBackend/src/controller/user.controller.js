import { asyncHandler } from "../../utils/asyncHandler.js"


//repeat syntax
const regsiterUser = asyncHandler(async (req, res) => {
    res.status.json({
        message: "ok"
    })
})



export { regsiterUser }