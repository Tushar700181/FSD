
let campus = document.getElementsByClassName('campus')[0];
campus.addEventListener('click', () => {
    console.log("Clicked")
    let map = document.getElementsByClassName('map')[0];
    map.src = "maps/campus/campus.html";
    let display = document.getElementById("searchdisplay");
    display.style.display = "";
    display.innerHTML = "<h1> MASTERPLAN IIITDM KURNOOL</h1>";
    let anchor = document.getElementById("asearch");
    anchor.style.display = "none";
})

let playground = document.getElementsByClassName('playground')[0];
playground.addEventListener('click', () => {
    console.log("Clicked")
    let map = document.getElementsByClassName('map')[0];
    map.src = "maps/playground/playground.html";
    let display = document.getElementById("searchdisplay");
    display.style.display = "";
    display.innerHTML = "<h1> SPORTS COMPLEX</h1>";
    let anchor = document.getElementById("asearch");
    anchor.style.display = "";
    anchor.innerHTML = "<H3>CLICK HERE FOR DIRECTIONS</H3>"
    anchor.href = "https://www.google.com/maps/place/Indoor+Stadium-IIITDMK/@15.7590015,78.0342926,1116m/data=!3m1!1e3!4m6!3m5!1s0x3bb5ddae23a961d3:0xfb836b7c509f72d3!8m2!3d15.7590012!4d78.0356758!16s%2Fg%2F11tshcg867?entry=ttu";
})

let cseandece = document.getElementsByClassName('cseandece')[0];
cseandece.addEventListener('click', () => {
    console.log("Clicked")
    let map = document.getElementsByClassName('map')[0];
    map.src = "maps/cseandece/cseandece.html";
    let display = document.getElementById("searchdisplay");
    display.style.display = "";
    display.innerHTML = "<h1> CSE AND ECE BUILDINGS</h1>";
    let anchor = document.getElementById("asearch");
    anchor.style.display = "";
    anchor.innerHTML = "<H3>CLICK HERE FOR DIRECTIONS</H3>"
    anchor.href = "https://www.google.com/maps/place/15%C2%B045'40.6%22N+78%C2%B002'18.0%22E/@15.761278,78.0376973,279m/data=!3m2!1e3!4b1!4m4!3m3!8m2!3d15.761278!4d78.038341?entry=ttu";
})

let mech = document.getElementsByClassName('mech')[0];
mech.addEventListener('click', () => {
    console.log("Clicked")
    let map = document.getElementsByClassName('map')[0];
    map.src = "maps/mech/mech.html";
    let display = document.getElementById("searchdisplay");
    display.style.display = "";
    display.innerHTML = "<h1> MECHANICAL BUILDING</h1>";
    let anchor = document.getElementById("asearch");
    anchor.style.display = "";
    anchor.innerHTML = "<H3>CLICK HERE FOR DIRECTIONS</H3>"
    anchor.href = "https://www.google.com/maps/place/15%C2%B045'40.0%22N+78%C2%B002'22.3%22E/@15.7611086,78.0382375,422m/data=!3m2!1e3!4b1!4m10!1m5!3m4!2zMTXCsDQ1JzQwLjkiTiA3OMKwMDInMjAuOSJF!8m2!3d15.7613611!4d78.0391389!3m3!8m2!3d15.761106!4d78.039525?entry=ttu";
})
let srkh = document.getElementsByClassName('srkh')[0];
srkh.addEventListener('click', () => {
    console.log("Clicked")
    let map = document.getElementsByClassName('map')[0];
    map.src = "maps/srkh/srkh.html";
    let display = document.getElementById("searchdisplay");
    display.style.display = "none";
    let anchor = document.getElementById("asearch");
    anchor.style.display = "none";
})



// end of hostels


let newacademic = document.getElementsByClassName('new-academic')[0];
newacademic.addEventListener('click', () => {
    console.log("Clicked")
    let map = document.getElementsByClassName('map')[0];
    map.src = "maps/new-academic/new-academic.html";
    let display = document.getElementById("searchdisplay");
    display.style.display = "";
    display.innerHTML = "<h1> NEW ACADEMICS BUILDING</h1>";
    let anchor = document.getElementById("asearch");
    anchor.style.display = "";
    anchor.innerHTML = "<H3>CLICK HERE FOR DIRECTIONS</H3>"
    anchor.href = "https://www.google.com/maps/place/15%C2%B045'40.9%22N+78%C2%B002'20.9%22E/@15.761361,78.0384853,279m/data=!3m2!1e3!4b1!4m4!3m3!8m2!3d15.761361!4d78.039129?entry=ttu";
})


let kalam = document.getElementsByClassName('kalam')[0];
kalam.addEventListener('click', () => {
    console.log("Clicked")
    let map = document.getElementsByClassName('map')[0];
    map.src = "maps/kalam/kalam.html";
    let display = document.getElementById("searchdisplay");
    display.style.display = "";
    display.innerHTML = "<h1> KALAM HOSTEL</h1>";
    let anchor = document.getElementById("asearch");
    anchor.style.display = "";
    anchor.innerHTML = "<H3>CLICK HERE FOR DIRECTIONS</H3>"
    anchor.href = "https://www.google.com/maps/place/Kalam+Hall+of+Residence/@15.7564369,78.0385818,778m/data=!3m1!1e3!4m12!1m5!3m4!2zMTXCsDQ1JzQwLjkiTiA3OMKwMDInMjAuOSJF!8m2!3d15.7613611!4d78.0391389!3m5!1s0x3bb5dd3828b50ef5:0x74bc24aa5e5cbe57!8m2!3d15.7582382!4d78.0396143!16s%2Fg%2F11sds6413x?entry=ttu";
})


let oldacademic = document.getElementsByClassName('old-academic')[0];
oldacademic.addEventListener('click', () => {
    console.log("Clicked")
    let map = document.getElementsByClassName('map')[0];
     map.src = "maps/old-academic/old-academic.html";
    let display = document.getElementById("searchdisplay");
    display.style.display = "";
    display.innerHTML = "<h1> OLD ACADEMIC BUILDING</h1>";
    let anchor = document.getElementById("asearch");
    anchor.style.display = "";
    anchor.innerHTML = "<H3>CLICK HERE FOR DIRECTIONS</H3>"
    anchor.href = "https://www.google.com/maps/place/Indian+Institute+Of+Information+Technology,+Design+%26+Manufacturing,+Kurnool/@15.756247,78.0434222,2734m/data=!3m1!1e3!4m6!3m5!1s0x3bb5dc3bfcf99645:0x52358ddcfb659cb9!8m2!3d15.7617232!4d78.0363767!16s%2Fg%2F11b8cdwgnh?entry=ttu";
})


let mvhr = document.getElementsByClassName('mvhr')[0];
mvhr.addEventListener('click', () => {
    console.log("Clicked")
    let map = document.getElementsByClassName('map')[0];
    map.src = "maps/mvhr/mvhr.html";
    let display = document.getElementById("searchdisplay");
    display.style.display = "";
    display.innerHTML = "<h1> MVHR HOSTEL</h1>";
    let anchor = document.getElementById("asearch");
    anchor.style.display = "";
    anchor.innerHTML = "<H3>CLICK HERE FOR DIRECTIONS</H3>"
    anchor.href = "https://www.google.com/maps/place/15%C2%B045'29.6%22N+78%C2%B002'25.6%22E/@15.758226,78.0392158,558m/data=!3m2!1e3!4b1!4m4!3m3!8m2!3d15.758226!4d78.040443?entry=ttu";
})


let kchor = document.getElementsByClassName('kchor')[0];
kchor.addEventListener('click', () => {
    console.log("Clicked")
    let map = document.getElementsByClassName('map')[0];
    map.src = "maps/kchor/kchor.html";
    let display = document.getElementById("searchdisplay");
    display.style.display = "";
    display.innerHTML = "<h1> KALPANA CHAWLA GIRLS HOSTEL</h1>";
    let anchor = document.getElementById("asearch");
    anchor.style.display = "";
    anchor.innerHTML = "<H3>CLICK HERE FOR DIRECTIONS</H3>"
    anchor.href = "https://www.google.com/maps/place/15%C2%B045'27.0%22N+78%C2%B002'18.9%22E/@15.7575,78.0385833,817m/data=!3m2!1e3!4b1!4m4!3m3!8m2!3d15.7575!4d78.0385833?entry=ttu";
})


let c = 45;

function draw() {
    document.documentElement.style.setProperty('--direction', c++ + 'deg');
    requestAnimationFrame(draw);
}

requestAnimationFrame(draw);

// var howtouse = document.getElementById("how-to-use");
// // var widthScreen = window.innerWidth;
// // function myFunction(x) {
// //     if (x.matches) {
// //       // If media query matches (viewport width <= 700px)
// //       howtouse.classList.remove("show")
// //     } else {
// //       // Otherwise (viewport width > 700px)
// //       document.body.style.backgroundColor = "pink";
// //     }
// //   }
  
// // //   // Create a MediaQueryList object for max-width: 700px
// // //   var x = window.matchMedia("(max-width: 991px)");
  
// // //   // Call the listener function at runtime
// // //   myFunction(x);
  
// // //   // Attach a listener function for state changes
// //   windowaddEventListener("change", function() {
// //     myFunction(x);
// //   });

// // if(widthScreen>"991px")
// // {
// //     howtouse.classList.remove("show");
// // }

// window.innerWidth.addEventListener = "change", ()=>
// {
//     if(window.innerWidth>991)
//     {
//         console.log(window.innerWidth)
//         howtouse.classList.remove("show");
//     }
// } 