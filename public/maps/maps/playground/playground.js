let maps = document.getElementsByClassName('maps')[0];
let coordinates= function(e){
   
    var bxcoord = maps.offsetLeft;
    var bycoord = maps.offsetTop;
    
    console.log(e.type,e.clientX,e.clientY)
    var xcoord;
    var ycoord;
    xcoord = e.clientX;
    ycoord= e.clientY;
    
    var start = document.getElementsByClassName('start')[0];
    var destination = document.getElementsByClassName('destination')[0];
    var sx=xcoord-bxcoord-5;
    var sy=ycoord-bycoord-5;
    let startBtn = document.getElementsByClassName('startBtn')[0];
    let destinationBtn = document.getElementsByClassName('destinationBtn')[0];
    startBtn.addEventListener("click",()=>
    {
        maps.addEventListener('click',coordinates) 
        start.setAttribute("style",`background-color:chartreuse; height:10px ;width:10px; position:absolute; top:${sy}px ;left:${sx}px`);
    });
    
    destinationBtn.addEventListener("click",()=>
    {
        maps.addEventListener('click',coordinates) 
        destination.setAttribute("style",`background-color:red; height:10px ;width:10px; position:absolute; top:${sy}px ;left:${sx}px`);
    });
    
    
             
    
    
 }
 

