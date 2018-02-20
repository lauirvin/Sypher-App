function encodeCheckUpload() {
  if (document.getElementById("file-name").innerHTML == "") {
    document.getElementById("next").style.backgroundColor = "#c0c0c0";
    document.getElementById("link").href = "";
  } else {
    document.getElementById("next").style.backgroundColor = "#35B0AB";
    document.getElementById("link").href = "./encode_download.html";
    document.getElementById("link").onclick="return true";
  }
}

function decodeCheckUpload() {
  console.log(document.getElementById("preview").hasAttribute("src"))
  if (!document.getElementById("preview").hasAttribute("src")) {
    document.getElementById("next").style.backgroundColor = "#c0c0c0";
    document.getElementById("link").href = "";
  } else {
    document.getElementById("next").style.backgroundColor = "#DD8968";
    document.getElementById("link").href = "./decode_download.html";
    document.getElementById("link").onclick="return true;";
  }
}

function previewImage(input) {
  var reader = new FileReader();
  reader.onload = function() {
    var output = document.getElementById("preview");
    document.getElementById("preview").style.background = "none";
    document.getElementById("preview").style.boxShadow = "0px 0px 35px -1px rgba(0,122,255,0.7)";
    output.src = reader.result;
    decodeCheckUpload();
  };
  reader.readAsDataURL(event.target.files[0]);
}

function readFileName(input) {
  var files = input.files;
  for (var i = 0; i < files.length; i++) {
    var output = document.getElementById("file-name");
    output.innerHTML = files[i].name;
  }
}
