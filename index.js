const express = require("express")
const osm = require("./osm.mjs")
const ascii = require("./ascii.mjs")
const multer = require("multer")

const upload = multer()

const app = express()

app.use(express.json())
app.use(express.static(__dirname + "/public"))

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html")
})

app.get("/api/get-image", async (req, res) => {
    const lat = Number(req.query.lat)
    const lon = Number(req.query.lon)
    const zoom = Number(req.query.zoom)

    const image = await osm.getImage(lat, lon, zoom)
    if (image) {
        res.set("Content-Type", "image/png")
        // Convert Blob to Buffer and send
        const arrayBuffer = await image.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        res.send(buffer)
    } else {
        res.status(404).send("Image not found")
    }
})

app.post("/api/image-to-ascii", async (req, res) => {
    const { lat, lon, zoom } = req.body
    if (lat === undefined || lon === undefined || zoom === undefined) {
        return res.status(400).send("Missing lat, lon, or zoom.")
    }
    try {
        const asciiArt = await ascii.tileToAscii(lat, lon, zoom)
        res.set("Content-Type", "text/plain")
        res.send(asciiArt)
    } catch (err) {
        res.status(500).send("Error converting image to ASCII.")
    }
})

app.listen(8002, () => {
    console.log("Server is running on http://localhost:8002")
})