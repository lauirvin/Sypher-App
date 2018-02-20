function emptyInput() {
    if (document.getElementById("key").value == "") {
        document.getElementById("next").style.backgroundColor = "#c0c0c0";
    } else {
        document.getElementById("next").style.backgroundColor = "#35B0AB";
        document.getElementById("link").href = "./encode_main.html";
        document.getElementById("link").onclick = "return true";
    }
}
