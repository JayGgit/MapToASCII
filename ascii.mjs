// Inverts the colors of a given image (whites to black, blacks to white)
export async function imageToInvert(image) {
	const { createCanvas, loadImage } = await import('canvas');
	let img;
	if (Buffer.isBuffer(image)) {
		const base64 = image.toString('base64');
		img = await loadImage('data:image/png;base64,' + base64);
	} else if (typeof image === 'string' && (image.startsWith('http://') || image.startsWith('https://'))) {
		img = await loadImage(image);
	} else if (typeof image === 'string') {
		img = await loadImage(image);
	} else {
		throw new Error('Unsupported image format');
	}
	const canvas = createCanvas(img.width, img.height);
	const ctx = canvas.getContext('2d');
	ctx.drawImage(img, 0, 0);
	const imageData = ctx.getImageData(0, 0, img.width, img.height);
	const data = imageData.data;
	for (let i = 0; i < data.length; i += 4) {
		data[i] = 255 - data[i];
		data[i + 1] = 255 - data[i + 1];
		data[i + 2] = 255 - data[i + 2];
	}
	ctx.putImageData(imageData, 0, 0);
	return canvas.toBuffer('image/png');
}
import asciify from 'asciify-image'
import * as osm from './osm.mjs'

// Remove ANSI escape codes from ASCII string
function stripAnsi(ascii) {
	return ascii.replace(/\x1b\[[0-9;]*m/g, '')
}

function setCopyright(ascii) {
	const copyright = '© Stadia Maps, © Stamen Design, © OpenMapTiles, © OpenStreetMap'
    const lines = ascii.split('\n');
    if (lines.length > 4) {
        lines.splice(-4, 4, copyright);
    } else {
        lines.push(copyright);
    }
    return lines.join('\n');
}

function setInfo(ascii, lat, lon) {

	const info = `Map To ASCII by JayG for iframe.hackclub.com - ${lat}, ${lon}`
    const lines = ascii.split('\n');
    lines[0] = info;
    return lines.join('\n');
}

// Converts an image buffer or file path to ASCII art using fixed settings
export async function imageToAscii(image, lat, lon) {
	// Invert the image before ASCII conversion
	const reversed = await imageToInvert(image);
	const opts = { fit: 'box', width: 100, height: 100, colored: false, threshold: true }
	const ascii = await asciify(reversed, opts)
	const stripped =  stripAnsi(ascii)
	const copyright =  setCopyright(stripped)
	const infoed = setInfo(copyright, lat, lon)
	return infoed
}

// Fetches a map tile for given lat, lon, zoom and converts it to ASCII art
export async function tileToAscii(lat, lon, zoom) {
	const imageBlob = await osm.getImage(Number(lat), Number(lon), Number(zoom))
	if (!imageBlob) {
		throw new Error('Image not found')
	}
	const arrayBuffer = await imageBlob.arrayBuffer()
	const buffer = Buffer.from(arrayBuffer)
	return await imageToAscii(buffer, lat, lon)
}