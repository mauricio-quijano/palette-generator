// Global selections and variables
const colorDivs = document.querySelectorAll(".color");
const generateButton = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll(".color h2");
const popup = document.querySelector(".copy-container");
const adjustButtons = document.querySelectorAll(".adjust");
const lockButtons = document.querySelectorAll(".lock");
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
generateButton.addEventListener("click", randomColors);
lockButtons.forEach((lockButton, index) => {
    lockButton.addEventListener("click", () => {
        lockColor(index);
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
        if (div.classList.contains("locked")) {
            initialColors.push(hexText.innerText);
            return;
        } else {
            initialColors.push(chroma(randomColor).hex());
        }
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

function lockColor(index) {
    colorDivs[index].classList.toggle("locked");
    lockButtons[index].children[0].classList.toggle("fa-lock-open");
    lockButtons[index].children[0].classList.toggle("fa-lock");
}

// Save palette and local storage
const saveButton = document.querySelector(".save");
const submitSave = document.querySelector(".submit-save");
const closeSave = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-container input");
const libraryContainer = document.querySelector(".library-container");
const libraryButton = document.querySelector(".library");
const closeLibraryButton = document.querySelector(".close-library");

// Event Listener
saveButton.addEventListener("click", openSavePalette);
closeSave.addEventListener("click", closeSavePalette);
submitSave.addEventListener("click", savePalette);
libraryButton.addEventListener("click", () => {
    loadStoredPalettes();
    openLibrary();
});
closeLibraryButton.addEventListener("click", closeLibrary);

// Functions
function openSavePalette() {
    const popup = saveContainer.children[0];
    saveContainer.classList.add("active");
    popup.classList.add("active");
}

function closeSavePalette() {
    const popup = saveContainer.children[0];
    saveContainer.classList.remove("active");
    popup.classList.remove("active");
}

function savePalette() {
    const popup = saveContainer.children[0];
    saveContainer.classList.remove("active");
    popup.classList.remove("active");
    const name = saveInput.value;
    const colors = [];
    currentHexes.forEach((hex) => {
        colors.push(hex.innerText);
    });
    // Generate the object
    const paletteObject = { name: name, colors: colors };
    // Save to local storage
    saveToLocalStorage(paletteObject);
    saveInput.value = "";
}

function saveToLocalStorage(paletteObject) {
    let localPalettes;
    if (localStorage.getItem("palettes") === null) {
        localPalettes = [];
    } else {
        localPalettes = JSON.parse(localStorage.getItem("palettes"));
    }
    localPalettes.push(paletteObject);
    localStorage.setItem("palettes", JSON.stringify(localPalettes));
}

function openLibrary() {
    const popup = libraryContainer.children[0];
    libraryContainer.classList.add("active");
    popup.classList.add("active");
    popup.scrollTop = 0;
}

function closeLibrary() {
    const popup = libraryContainer.children[0];
    libraryContainer.classList.remove("active");
    popup.classList.remove("active");
}

function loadStoredPalettes() {
    // Load stored palettes
    const customPaletteDivs = document.querySelectorAll(".custom-palette");
    customPaletteDivs.forEach((div) => {
        div.parentNode.removeChild(div);
    });
    let localPalettes;
    if (localStorage.getItem("palettes") != null) {
        localPalettes = JSON.parse(localStorage.getItem("palettes"));
        localPalettes.forEach((localPalette) => {
            // Generate palette for library
            const palette = document.createElement("div");
            palette.classList.add("custom-palette");
            const title = document.createElement("h4");
            title.innerText = localPalette.name;
            const preview = document.createElement("div");
            preview.classList.add("small-preview");
            localPalette.colors.forEach((color) => {
                const smallDiv = document.createElement("div");
                smallDiv.style.backgroundColor = color;
                preview.appendChild(smallDiv);
            });
            const paletteButton = document.createElement("button");
            paletteButton.classList.add("select-palette");
            paletteButton.innerText = "Select";
            // Append to library
            palette.appendChild(title);
            palette.appendChild(preview);
            palette.appendChild(paletteButton);
            libraryContainer.children[0].appendChild(palette);
            // Event listener for select palette button
            paletteButton.addEventListener("click", () => {
                initialColors = [];
                localPalette.colors.forEach((color, index) => {
                    initialColors.push(color);
                    colorDivs[index].style.backgroundColor = color;
                    const text = colorDivs[index].children[0];
                    checkContrast(color, text);
                    updateTexUI(index);
                    const chromaColor = chroma(color);
                    const sliders = colorDivs[index].querySelectorAll(".sliders input");
                    const hue = sliders[0];
                    const brightness = sliders[1];
                    const saturation = sliders[2];
                    colorizeSliders(chromaColor, hue, brightness, saturation);
                });
                resetInputs();
                closeLibrary();
            });
        });
    }
}

// Run File
randomColors();
