// const aysncHandler = (func) => {
//     return async (req , res , next) => {
//         try {
//             await func(req, res, next)
//         } catch (error) {
//             res.status(500).json({ error: error.message })
//         }
//     }
// }
const aysncHandler = (requestHandler) => {
    (req, res, next) => {
        promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}
export { aysncHandler }