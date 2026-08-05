const slider = document.querySelector(".table-wrapper");

let isDown = false;
let startX;
let scrollLeft;

slider.addEventListener("mousedown", (e) => {
    isDown = true;
    slider.style.cursor = "grabbing";
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
});

slider.addEventListener("mouseleave", () => {
    isDown = false;
    slider.style.cursor = "grab";
});

slider.addEventListener("mouseup", () => {
    isDown = false;
    slider.style.cursor = "grab";
});

slider.addEventListener("mousemove", (e) => {
    if (!isDown) return;

    e.preventDefault();

    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 2; // Increase multiplier for faster scrolling
    slider.scrollLeft = scrollLeft - walk;
});