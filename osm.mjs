import dotenv from 'dotenv'

function latLonToTileXY(lat, lon, zoom) {
    const latRad = lat * Math.PI / 180
    const n = Math.pow(2, zoom)
    const x = Math.floor((lon + 180) / 360 * n)
    const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n)
    return { x, y }
}

export async function getImage(lat, lon, zoom) {
    const { x, y } = latLonToTileXY(lat, lon, zoom)
    dotenv.config({quiet: true})

    const url = `https://tiles.stadiamaps.com/tiles/stamen_toner_background/${zoom}/${x}/${y}.png?api_key=${process.env.stadia_maps_api_key}`
    try {
        const response = await fetch(url)
        if (response.ok) {
            const blob = await response.blob()
            return blob
        } else {
            console.error("Error fetching image:", response.statusText)
            return false
        }
    } catch (error) {
        console.error("Error fetching image:", error)
        return false
    }
}
