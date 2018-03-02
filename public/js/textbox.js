function encodeEmptyTextbox() {
  if (document.getElementById("title" && "textbox").value == "") {
    document.getElementById("link").style.backgroundColor = "#c0c0c0";
  } else {
    document.getElementById("link").style.backgroundColor = "#35B0AB";
    document.getElementById("link").onclick = "return true";
  }
  window.setTimeout("encodeEmptyTextbox();", 1000 * 0.1);
}

function decodeEmptyTextbox() {
  if (document.getElementById("title" && "textbox").value == "") {
    document.getElementById("link").style.backgroundColor = "#c0c0c0";
  } else {
    document.getElementById("link").style.backgroundColor = "#DD8968";
    document.getElementById("link").onclick = "return true";
  }
  window.setTimeout("decodeEmptyTextbox();", 1000 * 0.1);
}

function emptyInputbox() {
  if ((document.getElementById("key1").value != "") && (document.getElementById("key2").value!="")) {
    document.getElementById("link").style.backgroundColor = "#35B0AB";
    document.getElementById("link").onclick = "return true";
    document.getElementById("link").href="encode_text.html";
  } else {
    document.getElementById("link").style.backgroundColor = "#c0c0c0";
    document.getElementById("link").href="javascript: void(0)";
  }
}

function copyToClipboard() {
  var text = document.getElementById("encodedText");
  text.select();
  document.execCommand("Copy");
}
