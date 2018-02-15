function emptyTextbox() {
  if (document.getElementById("textbox").value == "") {
    document.getElementById("next").style.backgroundColor = "#c0c0c0";
    document.getElementById("link").href = "";
  } else {
    document.getElementById("next").style.backgroundColor = "#35B0AB";
    document.getElementById("link").href = "encode_upload_image.html";
    document.getElementById("link").onclick="return true";
  }
  window.setTimeout("emptyTextbox();", 1000 * 0.1);
}

function focusTextbox() {
  var textbox = document.getElementById("textbox");
  document.getElementById("next").style.display = "none";
}

function blurTextbox() {
  document.getElementById("next").style.display = "block";
}
