import "./style.css";

const Root = document.querySelector(":root");

SkyComponents({
    SkyHeader: function(Properties) {
        return `<div id="Header">
        <h1>Sky.js Docs</h1>
        <button id="Search">Search</button>
        <i id="Toggler" class="fas fa-sun"></i>
        </div>
        <div id="HeaderPlace"></div>`;
    }
})

Search.addEventListener("click", () => {
    SearchOverlay.classList.remove("hide");
    SearchBar.value = "";
});

SearchBar.addEventListener("input", () => {
    Results.innerHTML = "";
    [...Docs.children].forEach(Child => {
        if (Child.children.length !== 0) {
            [...Child.firstElementChild.children].forEach(Child => {
                if (SearchBar.value !== "" && Child.innerText.toLowerCase().includes(SearchBar.value.toLowerCase()))
                    Results.innerHTML += `<li id="Result">${Child.innerText}</li>`;
            })
        } else if (SearchBar.value !== "" && Child.innerText.toLowerCase().includes(SearchBar.value.toLowerCase()))
            Results.innerHTML += `<li id="Result">${Child.innerText}</li>`;
    });
    if (Results.children.length === 0) NoResults.classList.remove("hide");
    else NoResults.classList.add("hide");
});

SearchClose.addEventListener("click", () => {
    SearchOverlay.classList.add("hide");
});

Toggler.addEventListener("click", () => {
    if (Toggler.classList.contains("fa-sun")) {
        Root.style.setProperty("--bg-color", "hsl(0, 0%, 95%)");
        Root.style.setProperty("--font-color", "hsl(0, 0%, 10%)");
    } else {
        Root.style.setProperty("--bg-color", "hsl(0, 0%, 10%)");
        Root.style.setProperty("--font-color", "hsl(0, 0%, 95%)");

    };

    Toggler.classList.toggle("fa-sun");
    Toggler.classList.toggle("fa-moon");
});

Docs.addEventListener("click", e => {
    if(e.target.classList.contains("section")) return;
    DocSection.innerHTML = `<h1 align="center">${e.target.innerHTML}</h1>`;
});