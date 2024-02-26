


// const hp = {
//   "key":'0ewew',
//   "type":"nbeginweqr"
  
// };
// addOrUpdateCharacter(hp);
// ("0");

// getCharacterById("0ewew", "nbeginweqr").then(item => {
//   console.log(item);
// }).catch(error => {
//   console.error(error);
// });

// deleteCharacter("0ewew", "nbeginweqr").then(item => {
//   console.log(item);
// }).catch(error => {
//   console.error(error);
// });


const express = require('express');

const { createCanvas } = require('canvas');


const app = express();
const PORT = 3000;


app.use(express.static('public'));


// Text-to-Image API
app.get('/text-to-image', (req, res) => {
    const text = req.query.text || 'Title disappered';
    const width = 800;
    const height = 600;
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    // Set background color
    context.fillStyle = '#FFF';
    context.fillRect(0, 0, width, height);

    // Set text properties
    context.font = '50px Arial';
    context.fillStyle = '#000';
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    // Place text in the center
    // context.fillText(text, width / 2, height / 2);

    wrapText(context, text, width / 2, height / 2, width - 40, 48); // 40px padding, 48px line height


    // Convert canvas to an image
    const buffer = canvas.toBuffer('image/png');

    // Set the content type to image/png and send the image
    res.type('png');
    res.send(buffer);
});


function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let lines = [];

    for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = context.measureText(testLine);
        let testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line);

    // Center the text block
    const blockHeight = lines.length * lineHeight;
    let currentY = y - blockHeight / 2 + lineHeight / 2;

    for (let i = 0; i < lines.length; i++) {
        context.fillText(lines[i], x, currentY);
        currentY += lineHeight;
    }
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
