import { aysncHandler } from "../utils/asyncHandler.js"


const registerUser = aysncHandler(async (req, res) => {
    res.status(200).json({ message: "User registered successfully" })
})

export { registerUser }