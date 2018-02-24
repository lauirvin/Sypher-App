function fileCheckUpload() {
  if (document.getElementById("file-name").innerHTML == "") {
    document.getElementById("link").style.backgroundColor = "#c0c0c0";
  } else {
    document.getElementById("link").style.backgroundColor = "#35B0AB";
    document.getElementById("link").onclick = "return true";
  }
}

function imageCheckUpload() {
  if (!document.getElementById("preview").hasAttribute("src")) {
    document.getElementById("link").style.backgroundColor = "#c0c0c0";
  } else {
    if (document.getElementById("link").className == "next-button mod-keppel") {
      document.getElementById("link").style.backgroundColor = "#35B0AB";
    } else {
      document.getElementById("link").style.backgroundColor = "#DD8968";
    }
    document.getElementById("link").onclick = "return true;";
  }
}

function previewImage(input) {
  var reader = new FileReader();
  reader.onload = function () {
    var output = document.getElementById("preview");
    document.getElementById("preview").style.background = "none";
    document.getElementById("preview").style.boxShadow = "0px 0px 35px -1px rgba(0,122,255,0.7)";
    output.src = reader.result;
    imageCheckUpload();
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
