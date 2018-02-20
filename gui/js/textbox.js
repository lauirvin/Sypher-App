function emptyTextbox() {
  if (document.getElementById("textbox").value == "") {
    document.getElementById("next").style.backgroundColor = "#c0c0c0";
    document.getElementById("link").href = "";
  } else {
    document.getElementById("next").style.backgroundColor = "#35B0AB";
    document.getElementById("link").href = "encode_upload_image.html";
    document.getElementById("link").onclick = "return true";
  }
  window.setTimeout("emptyTextbox();", 1000 * 0.1);
}

function emptyInputbox() {
  if (document.getElementById("key1" && "key2").value == "") {
    document.getElementById("next").style.backgroundColor = "#c0c0c0";
  } else {
    document.getElementById("next").style.backgroundColor = "#35B0AB";
    document.getElementById("next").onclick = "return true";
  }
  window.setTimeout("emptyInputbox();", 1000 * 0.1);
}

function copyToClipboard() {
  var text = document.getElementById("encodedText");
  text.select();
  document.execCommand("Copy");
}
