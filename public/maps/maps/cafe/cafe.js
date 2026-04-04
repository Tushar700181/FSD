const items = [
    "Tea (small)",
    "Tea (large)",
    "Green Tea","Lemon Tea","Instant Coffee","Filter Coffee","Black Coffee","Sonite Coffee","Boost","Bournavita","Horlicks",
    "Cold Coffee","Chocolate Cold Coffee","Snickers Cold Coffee","Kit Kat Cold Coffee","Oreo Cold Coffee","Belgium Ice Cream Coffee",
    "Vanila Shake","Oreo Shake","Chocolate Shake","Kit Kat Shake","Belgium Shake","Butterscotch Shake","Mango Shake","Strawberry Shake","Black Current Shake",
    "Plain Lassi","Rooh Afza Lassi","Mango Lassi","Chocolate Lassi","Butter Milk","Lemon Soda","Sharbat",
    "Veg Maggie","Cheese Maggie","Corn Maggie","Corn Cheese Maggie","Paneer Maggie","Paneer Cheese Maggie","Egg Maggie","Egg Cheese Maggie","Chicken Maggie","Chicken Cheese Maggie","Chicken & Egg Maggie",
    "Veg Sandwich","Veg Cheese Sandwich","Corn Sandwich","Corn Cheese Sandwich","Paneer Sandwich","Paneer Cheese Sandwich","Egg Sandwich","Egg Cheese Sandwich","Chicken Sandwich","Chicken Cheese Sandwich",
    "Gobi Manchurian","Gobi 65","Gobi Chilli",
    "Veg Noodle","Egg Noodle","Chicken Noodle","Paneer Noodle","Veg Pasta","Egg Pasta","Chicken Pasta",
    "Goobie Fried Rice","Paneer Fried Rice","Mushroom Fried Rice","Shezwan Fried Rice","Kaju Fried Rice","Egg Fried Rice","Egg Shezwan Fried Rice","Egg Paneer Fried Rice","Chicken Egg Fried Rice"
];
const price=[7,15,
             15,15,20,20,20,15,20,20,20,
             35,60,70,70,70,100,
             70,90,90,90,120,90,90,90,90,
             25,30,60,50,20,20,25,
             30,45,35,45,60,75,40,50,60,70,70,
             40,50,45,55,55,70,45,50,60,65,
             75,75,75,
             50,60,80,75,50,60,80,
             75,70,70,60,80,60,70,75,80
]
for(let i=0;i<items.length;i++){
var html= `<tr class="tr">
                <td>${i+1}</td>
                <td class="item_name">${items[i]}</td>
                <td>${price[i]}</td>
            </tr>`;
   let a =document.getElementById("food")
   a.innerHTML = a.innerHTML + html;
 }

 function arnav() {
    var input, filter, tr, a, i, txtValue;
    input = document.getElementById('myInput');
    filter = input.value.toUpperCase();
    tr = document.getElementsByClassName('item_name');
    for (i = 0; i < tr.length; i++) {
      a = tr[i];
      txtValue = a.textContent || a.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        document.getElementsByClassName("tr")[i].style.display = "";
      } else {
        document.getElementsByClassName("tr")[i].style.display = "none";
      }
    }
  }
