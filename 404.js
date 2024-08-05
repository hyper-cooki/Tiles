let ver = window.location.href.split("/")[window.location.href.split("/").length-1].split("?")[0]

if (ver.includes(".html")) {
    ver = ver.slice(0, -5);
}

document.getElementById("sorry").innerText = "Sorry, but there isn't a Tiles " + ver + " that exists in your current universe.";

const delay = ms => new Promise(res => setTimeout(res, ms));

let i = 0;
let str = "Please click the button below";
let str2 = "to prevent a paradox.";

function typing() {
    if (i < str.length) {
        document.getElementById("sorry").innerHTML = document.getElementById("sorry").innerHTML.slice(0, -1)
        document.getElementById("sorry").innerHTML += str.charAt(i) + "|";
        i++;
        setTimeout(typing, 100);
    }
}

function typing2() {
    console.log("2");
    if (i < str2.length) {
        document.getElementById("sorry").innerHTML += str2.charAt(i);
        i++;
        setTimeout(typing2, 100);
    }
}

if (ver === "404") {
    document.getElementById("sorry").innerHTML += "<br>|";

    // document.getElementById("sorry").innerHTML += "|";
    setTimeout(typing, 1000);
    // setTimeout(typing2, 10000);
}