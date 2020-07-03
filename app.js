// Global selections and variables
const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll(".color h2");
const popup = document.querySelector(".copy-container");
const adjustButtons = document.querySelectorAll(".adjust");
const closeAdjustments = document.querySelectorAll(".close-adjustment");
const slidersContainers = document.querySelectorAll(".sliders");
let initialColors;

// Event Listeners
sliders.forEach((slider) => {
    slider.addEventListener("input", hslControls);
});
colorDivs.forEach((div, index) => {
    div.addEventListener("change", () => {
        updateTexUI(index);
    });
});
currentHexes.forEach((hex) => {
    hex.addEventListener("click", () => {
        copyToClipboard(hex);
    });
});
popup.addEventListener("transitionend", () => {
    const popupBox = popup.children[0];
    popup.classList.remove("active");
    popupBox.classList.remove("active");
});
adjustButtons.forEach((adjustButton, index) => {
    adjustButton.addEventListener("click", () => {
        openAdjustmentPanel(index);
    });
});
closeAdjustments.forEach((closeAdjustment, index) => {
    closeAdjustment.addEventListener("click", () => {
        closeAdjustmentPanel(index);
    });
});

// Functions
function randomColors() {
    initialColors = [];
    colorDivs.forEach((div, index) => {
        const hexText = div.children[0];
        const icons = div.children[1].children;
        const randomColor = chroma.random();
        // Store initial colors in the array
        initialColors.push(chroma(randomColor).hex());
        // Set color to the background and text label
        div.style.backgroundColor = randomColor;
        hexText.innerText = randomColor;
        // Check for contrast between text and background color
        checkContrast(randomColor, hexText);
        for (icon of icons) {
            checkContrast(randomColor, icon);
        }
        // Initialize color for sliders
        const color = chroma(randomColor);
        const sliders = div.querySelectorAll(".sliders input");
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];
        colorizeSliders(color, hue, brightness, saturation);
    });
    // Reset sliders values
    resetInputs();
}

function checkContrast(color, text) {
    const luminance = chroma(color).luminance();
    if (luminance > 0.5) {
        text.style.color = "black";
    } else {
        text.style.color = "white";
    }
}

function colorizeSliders(color, hue, brightness, saturation) {
    // Scale Brightness
    const midBrightness = color.set("hsl.l", 0.5);
    const scaleBrightness = chroma.scale(["black", midBrightness, "white"]);
    // Scale saturation
    const noSaturation = color.set("hsl.s", 0);
    const fullSaturation = color.set("hsl.s", 1);
    const scaleSaturation = chroma.scale([noSaturation, color, fullSaturation]);
    // Input Update
    hue.style.backgroundImage =
        "linear-gradient(to right," +
        "rgb(255, 0, 0)," + // Red
        "rgb(255, 255 ,0), " + // Yellow
        "rgb(0, 255, 0), " + // Green
        "rgb(0, 255, 255), " + // Cyan
        "rgb(0, 0, 255), " + // Blue
        "rgb(255, 0, 255)," + // Magenta
        "rgb(255, 0, 0))"; // Red
    brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBrightness(0)}, ${scaleBrightness(0.5)}, ${scaleBrightness(1)})`;
    saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSaturation(0)}, ${scaleSaturation(0.5)}, ${scaleSaturation(1)})`;
}

function hslControls(event) {
    const index = event.target.getAttribute("data-hue") || event.target.getAttribute("data-bright") || event.target.getAttribute("data-sat");
    let sliders = event.target.parentElement.querySelectorAll('input[type="range"]');
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];
    const backgroundColor = initialColors[index];
    // Customize color with sliders values
    let color = chroma(backgroundColor).set("hsl.h", hue.value).set("hsl.l", brightness.value).set("hsl.s", saturation.value);
    // Set customized color
    colorDivs[index].style.backgroundColor = color;
    // Update sliders
    colorizeSliders(color, hue, brightness, saturation);
}

function updateTexUI(index) {
    const activeDiv = colorDivs[index];
    const color = chroma(activeDiv.style.backgroundColor);
    const hexText = activeDiv.querySelector("h2");
    const icons = activeDiv.querySelectorAll(".controls button");
    hexText.innerText = color.hex();
    // Check Constrast
    checkContrast(color, hexText);
    for (icon of icons) {
        checkContrast(color, icon);
    }
}

function resetInputs() {
    const sliders = document.querySelectorAll(".sliders input");
    sliders.forEach((slider) => {
        switch (slider.name) {
            case "hue":
                const hueColor = initialColors[slider.getAttribute("data-hue")];
                const hueValue = chroma(hueColor).hsl()[0];
                slider.value = Math.floor(hueValue);
                break;
            case "brightness":
                const brightnessColor = initialColors[slider.getAttribute("data-bright")];
                const brightnessValue = chroma(brightnessColor).hsl()[2];
                slider.value = Math.floor(brightnessValue * 100) / 100;
                break;
            case "saturation":
                const saturationColor = initialColors[slider.getAttribute("data-sat")];
                const saturationValue = chroma(saturationColor).hsl()[1];
                slider.value = saturationValue;
                break;
        }
    });
}

function copyToClipboard(hex) {
    const element = document.createElement("textarea");
    element.value = hex.innerText;
    document.body.appendChild(element);
    element.select();
    document.execCommand("copy");
    document.body.removeChild(element);
    // Popup animation
    const popupBox = popup.children[0];
    popup.classList.add("active");
    popupBox.classList.add("active");
}

function openAdjustmentPanel(index) {
    slidersContainers[index].classList.toggle("active");
}

function closeAdjustmentPanel(index) {
    slidersContainers[index].classList.remove("active");
}

// Run File
randomColors();
