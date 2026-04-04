// adding classes 
// search option js code for main search options to embend in map

for (i = 0; i < 9; i++) {
    var cseandece3 = document.getElementsByClassName('arnav_search')[`${i}`]
    cseandece3.addEventListener('click', () => {
        console.log("Clicked")
        let map = document.getElementsByClassName('map')[0];
        map.src = "maps/cseandece/cseandece3/cseandece3.html";
        let display =document.getElementById("searchdisplay");
        display.style.display="";
        display.innerHTML="<h1>CSE AND ECE FLOOR 3</h1>";
        let anchor =document.getElementById("asearch");
        anchor.style.display="";
        anchor.innerHTML="<H3>CLICK HERE FOR DIRECTIONS</H3>"
        anchor.href="https://www.google.com/maps/place/15%C2%B045'40.6%22N+78%C2%B002'18.0%22E/@15.761278,78.0376973,279m/data=!3m2!1e3!4b1!4m4!3m3!8m2!3d15.761278!4d78.038341?entry=ttu";
        document.getElementById("myDropdown").classList.toggle("show");
    })
}
for (i = 9; i < 18; i++) {
    var academic1 = document.getElementsByClassName('arnav_search')[`${i}`]
    academic1.addEventListener('click', () => {
        console.log("Clicked")
        let map = document.getElementsByClassName('map')[0];
        map.src = "maps/new-academic/new-academic1/new-academic1.html";
        let display =document.getElementById("searchdisplay");
        display.style.display="";
        display.innerHTML="<h1>NEW-ACADEMIC FLOOR 1</h1>";
        let anchor =document.getElementById("asearch");
        anchor.style.display="";
        anchor.innerHTML="<H3>CLICK HERE FOR DIRECTIONS</H3>"
        anchor.href="https://www.google.com/maps/place/15%C2%B045'40.9%22N+78%C2%B002'20.9%22E/@15.761361,78.0384853,279m/data=!3m2!1e3!4b1!4m4!3m3!8m2!3d15.761361!4d78.039129?entry=ttu";
        document.getElementById("myDropdown").classList.toggle("show");   
    })
}
for (i = 18; i < 25; i++) {
    var cseandece2 = document.getElementsByClassName('arnav_search')[`${i}`]
    cseandece2.addEventListener('click', () => {
        console.log("Clicked")
        let map = document.getElementsByClassName('map')[0];
        map.src = "maps/cseandece/cseandece2/cseandece2.html";
        let display =document.getElementById("searchdisplay");
        display.style.display="";
        display.innerHTML="<h1>CSE AND ECE FLOOR 2</h1>";
        let anchor =document.getElementById("asearch");
        anchor.style.display="";
        anchor.innerHTML="<H3>CLICK HERE FOR DIRECTIONS</H3>"
        anchor.href="https://www.google.com/maps/place/15%C2%B045'40.6%22N+78%C2%B002'18.0%22E/@15.761278,78.0376973,279m/data=!3m2!1e3!4b1!4m4!3m3!8m2!3d15.761278!4d78.038341?entry=ttu";
        document.getElementById("myDropdown").classList.toggle("show");
    })
}
for (i = 25; i < 33; i++) {
    var playground1 = document.getElementsByClassName('arnav_search')[`${i}`]
    playground1.addEventListener('click', () => {
        console.log("Clicked")
        let map = document.getElementsByClassName('map')[0];
        map.src = "maps/playground/playground.html";
        let display =document.getElementById("searchdisplay");
        display.style.display="";
        display.innerHTML="<h1>SPORTS COMPLEX</h1>";
        let anchor =document.getElementById("asearch");
        anchor.style.display="";
        anchor.innerHTML="<H3>CLICK HERE FOR DIRECTIONS</H3>"
        anchor.href="https://www.google.com/maps/place/Indoor+Stadium-IIITDMK/@15.7590015,78.0342926,1116m/data=!3m1!1e3!4m6!3m5!1s0x3bb5ddae23a961d3:0xfb836b7c509f72d3!8m2!3d15.7590012!4d78.0356758!16s%2Fg%2F11tshcg867?entry=ttu";
    document.getElementById("myDropdown").classList.toggle("show");
    })
}
for (i = 33; i < 44; i++) {
    var academic0 = document.getElementsByClassName('arnav_search')[`${i}`]
    academic0.addEventListener('click', () => {
        console.log("Clicked")
        let map = document.getElementsByClassName('map')[0];
        map.src = "maps/new-academic/new-academic0/new-academic0.html";
        let display =document.getElementById("searchdisplay");
        display.style.display="";
        display.innerHTML="<h1>NEW ACADEMICS FLOOR 0</h1>";
        let anchor =document.getElementById("asearch");
        anchor.style.display="";
        anchor.innerHTML="<H3>CLICK HERE FOR DIRECTIONS</H3>"
        anchor.href="https://www.google.com/maps/place/15%C2%B045'40.9%22N+78%C2%B002'20.9%22E/@15.761361,78.0384853,279m/data=!3m2!1e3!4b1!4m4!3m3!8m2!3d15.761361!4d78.039129?entry=ttu";
    document.getElementById("myDropdown").classList.toggle("show");
    })
}

for (i = 44; i < 49; i++) {
    var mech1 = document.getElementsByClassName('arnav_search')[`${i}`]
    mech1.addEventListener('click', () => {
        console.log("Clicked")
        let map = document.getElementsByClassName('map')[0];
        map.src = "maps/mech/mech1/mech1.html";
        let display =document.getElementById("searchdisplay");
        display.style.display="";
        display.innerHTML="<h1>MECHANICAL BUILDING FLOOR 1</h1>";
        let anchor =document.getElementById("asearch");
        anchor.style.display="";
        anchor.innerHTML="<H3>CLICK HERE FOR DIRECTIONS</H3>"
        anchor.href="https://www.google.com/maps/place/IIITDM+KURNOOL+CENTRAL+WORKSHOP/@15.7597796,78.0399145,556m/data=!3m1!1e3!4m6!3m5!1s0x3bb5dd97f31e49b1:0x516d16aa978028d2!8m2!3d15.760187!4d78.0397524!16s%2Fg%2F11sbtpwr3g?entry=ttu";
      document.getElementById("myDropdown").classList.toggle("show");  
    })
}

for (i = 49; i < 51; i++) {
    var mech0 = document.getElementsByClassName('arnav_search')[`${i}`]
    mech0.addEventListener('click', () => {
        console.log("Clicked")
        let map = document.getElementsByClassName('map')[0];
        map.src = "maps/mech/mech0/mech0.html";
        let display =document.getElementById("searchdisplay");
        display.style.display="";
        display.innerHTML="<h1>MECHANICAL BUILDING FLOOR 0</h1>";
        let anchor =document.getElementById("asearch");
        anchor.style.display="";
        anchor.innerHTML="<H3>CLICK HERE FOR DIRECTIONS</H3>"
        anchor.href="https://www.google.com/maps/place/IIITDM+KURNOOL+CENTRAL+WORKSHOP/@15.7597796,78.0399145,556m/data=!3m1!1e3!4m6!3m5!1s0x3bb5dd97f31e49b1:0x516d16aa978028d2!8m2!3d15.760187!4d78.0397524!16s%2Fg%2F11sbtpwr3g?entry=ttu";
    document.getElementById("myDropdown").classList.toggle("show");
    })
}

for (i = 51; i < 62; i++) {
    var cseandece0 = document.getElementsByClassName('arnav_search')[`${i}`]
    cseandece0.addEventListener('click', () => {
        console.log("Clicked")
        let map = document.getElementsByClassName('map')[0];
        map.src = "maps/cseandece/cseandece0/cseandece0.html";
        let display =document.getElementById("searchdisplay");
        display.style.display="";
        display.innerHTML="<h1>CSE AND ECE BUILDING FLOOR 0</h1>";
        let anchor =document.getElementById("asearch");
        anchor.style.display="";
        anchor.innerHTML="<H3>CLICK HERE FOR DIRECTIONS</H3>"
        anchor.href="https://www.google.com/maps/place/15%C2%B045'40.6%22N+78%C2%B002'18.0%22E/@15.761278,78.0376973,279m/data=!3m2!1e3!4b1!4m4!3m3!8m2!3d15.761278!4d78.038341?entry=ttu";
        document.getElementById("myDropdown").classList.toggle("show");    
    })
}
for (i=62;i<72;i++){
    var oldacademic0 = document.getElementsByClassName('arnav_search')[i]
    oldacademic0.addEventListener('click', () => {
        console.log("Clicked")
        let map = document.getElementsByClassName('map')[0];
        map.src = "maps/old-academic/old-academic0/old-academic0.html";
        let display =document.getElementById("searchdisplay");
        display.style.display="";
        display.innerHTML="<h1>OLD ACADEMIC BUILDING FLOOR 0</h1>";
        let anchor =document.getElementById("asearch");
        anchor.style.display="";
        anchor.innerHTML="<H3>CLICK HERE FOR DIRECTIONS</H3>"
        anchor.href="https://www.google.com/maps/place/Indian+Institute+Of+Information+Technology,+Design+%26+Manufacturing,+Kurnool/@15.756247,78.0434222,2734m/data=!3m1!1e3!4m6!3m5!1s0x3bb5dc3bfcf99645:0x52358ddcfb659cb9!8m2!3d15.7617232!4d78.0363767!16s%2Fg%2F11b8cdwgnh?entry=ttu";
        document.getElementById("myDropdown").classList.toggle("show");
    })
}
    for (i=72;i<79;i++){
        var oldacademic1 = document.getElementsByClassName('arnav_search')[`${i}`]
        oldacademic1.addEventListener('click', () => {
            console.log("Clicked")
            let map = document.getElementsByClassName('map')[0];
            map.src = "maps/old-academic/old-academic1/old-academic1.html";
            let display =document.getElementById("searchdisplay");
            display.style.display="";
            display.innerHTML="<h1>OLD ACADEMIC BUILDING FLOOR 1</h1>";
        
        let anchor =document.getElementById("asearch");
        anchor.style.display="";
        anchor.innerHTML="<H3>CLICK HERE FOR DIRECTIONS</H3>"
        anchor.href="https://www.google.com/maps/place/Indian+Institute+Of+Information+Technology,+Design+%26+Manufacturing,+Kurnool/@15.756247,78.0434222,2734m/data=!3m1!1e3!4m6!3m5!1s0x3bb5dc3bfcf99645:0x52358ddcfb659cb9!8m2!3d15.7617232!4d78.0363767!16s%2Fg%2F11b8cdwgnh?entry=ttu";
       document.getElementById("myDropdown").classList.toggle("show");
        })
}
for(i=79;i<83;i++){
    var cseandece1 = document.getElementsByClassName('arnav_search')[`${i}`]
    cseandece1.addEventListener('click', () => {
        console.log("Clicked")
        let map = document.getElementsByClassName('map')[0];
        map.src = "maps/cseandece/cseandece1/cseandece1.html";
        let display =document.getElementById("searchdisplay");
        display.style.display="";
        display.innerHTML="<h1>CSE AND ECE FLOOR 3</h1>";
        let anchor =document.getElementById("asearch");
        anchor.style.display="";
        anchor.innerHTML="<H3>CLICK HERE FOR DIRECTIONS</H3>"
        anchor.href="https://www.google.com/maps/place/15%C2%B045'40.6%22N+78%C2%B002'18.0%22E/@15.761278,78.0376973,279m/data=!3m2!1e3!4b1!4m4!3m3!8m2!3d15.761278!4d78.038341?entry=ttu";
    document.getElementById("myDropdown").classList.toggle("show");
    })
}
for(i=83;i<84;i++){
let mvhr = document.getElementsByClassName('arnav_search')[i];
mvhr.addEventListener('click', ()=>{
    console.log("Clicked")
    let map = document.getElementsByClassName('map')[0];
    map.src = "maps/mvhr/mvhr.html";
    document.getElementById("myDropdown").classList.toggle("show");
})
}

for(i=84;i<85;i++){
let srkh = document.getElementsByClassName('arnav_search')[i];
srkh.addEventListener('click', ()=>{
    console.log("Clicked")
    let map = document.getElementsByClassName('map')[0];
    map.src = "maps/srkh/srkh.html";
document.getElementById("myDropdown").classList.toggle("show");
})  
}

for(i=85;i<86;i++){
let kalpana = document.getElementsByClassName('arnav_search')[i];
kalpana.addEventListener('click', ()=>{
    console.log("Clicked")
    let map = document.getElementsByClassName('map')[0];
    map.src = "maps/kchor/kchor.html";
document.getElementById("myDropdown").classList.toggle("show");
}) }

for(i=86;i<87;i++){ 
let sfc = document.getElementsByClassName('arnav_search')[i];
sfc.addEventListener('click', ()=>{
    console.log("Clicked")
    let map = document.getElementsByClassName('map')[0];
    map.src = "maps/sfc/sfc.html";
document.getElementById("myDropdown").classList.toggle("show");
})  
}
// codes of embending in map ends here

function draw(){
let c = 45;
  document.documentElement.style.setProperty('--direction', c++ + 'deg');
  requestAnimationFrame(draw);
}

requestAnimationFrame(draw);
