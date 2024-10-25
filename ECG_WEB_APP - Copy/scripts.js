let port;
let reader;
let plotData = [];

const canvas = document.getElementById('plotCanvas');
const ctx = canvas.getContext('2d');
const connectButton = document.getElementById('connectButton');
const downloadButton = document.getElementById('downloadButton');

// Connect to Arduino
connectButton.addEventListener('click', async () => {
    try {
        // Request Arduino port
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 9600 });

        // Create a reader to read data from the serial port
        reader = port.readable.getReader();
        readSerialData();
        //mod
        window.alert("Connected Successfully");
    } catch (error) {
        console.error('Error connecting to Arduino:', error);
    }
});

// Read serial data
async function readSerialData() {
    while (true) {
        const { value, done } = await reader.read();
        if (done) {
            console.log('Serial connection closed');
            reader.releaseLock();
            break;
        }

        // Convert serial data to a string
        const data = new TextDecoder().decode(value);
        processSerialData(data);
    }
}

// Process the serial data and plot it
function processSerialData(data) {
    const lines = data.trim().split('\n');
    lines.forEach(line => {
        const number = parseFloat(line);
        if (!isNaN(number)) {
            plotData.push(number);

            // Limit the number of data points to fit the canvas width
            if (plotData.length > canvas.width) {
                plotData.shift();
            }

            drawPlot();
        }
    });
}

// Draw the plot on the canvas
function drawPlot() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    plotData.forEach((point, index) => {
        const x = index;
        //mod 
        const centerX = canvas.width/2;
        //const centerY = canvas.height/2;
        const y =(canvas.height*3/4)-(point / 1024) * (canvas.height*3/4);  // Assuming data ranges from 0 to 1024
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Download the plot as a PDF (landscape orientation)
downloadButton.addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape' }); // Set landscape orientation

    // Convert canvas to image
    const canvasImage = canvas.toDataURL("image/png");

    // Add image to PDF
    doc.addImage(canvasImage, "PNG", 10, 10, 280, 140); // Adjust size as needed

    // Save the PDF with only the graph
    doc.save("arduino_plot_graph.pdf");
});
