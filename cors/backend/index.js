import express from "express"
const app = express()
app.get("/api/quotes", (req, res) => {
    const data = [
        {
            id: 1,
            text: "every cloud has a silver lining"
        },
        {
            id: 2,
            text: "an eye for an eye will make the whole world blind"
        },
        {
            id: 3,
            text: "birds of a feather flock together"
        },
        {
            id: 4,
            text: "only few people feel rain others just get wet"
        }
    ]
    res.json(data)
})
const port = process.env.url || 3000
app.listen(port, () => {
    console.log(`server running on ${port}`)
})