const items = [
    "Gobi Manchuria", "Gobi 65", "Veg Manchuria", "Paneer 65", "Chilly Paneer", "Paneer Manchuria", "Chilly Mushroom", "Mushroom 65", "Alu 65", "Tomato Curry", "Paneer Butter Masala", "Palak Paneer", "Kaju Paneer masala", "Mushroom Masala",
    "Veg Fried Rice", "Gobi Fried Rice", "Jeera Fried Rice", "Tomato Fried Rice", "Kaju Fried Rice", "Kaju Paneer Fried Rice", "Mushroom Fried Rice", "Paneer Fried Rice", "Curd Rice", "Special Curd Rice", "Sweetcorn Fried Rice", "Egg Fried Rice", "Double Egg Fried Rice", "Chicken Fried Rice", "Fish Fried Rice",
    "Chicken Dum Biryani", "Chicken Dum Biryani (2pcs)", "Chicken Lollipop Biryani(2pcs)", "Special Chicken Biryani", "Roast Chicken Biryani", "Biryani Masala Rice", "Extra Biryani Rice (250g)", "Chicken Pakoda", "Fish 65", "Fish Curry(2pcs) wed,Sun",
    "Chicken 65", "Chilly Chicken", "Chicken Manchuria", "Chicken Lollipop (4pcs) Fry", "Chicken Lollipop (4pcs) Juicy", "Chicken Curry", "Kaju Chicken Curry/Butter",
    "Boiled Egg", "Single Egg Omelette", "Double Egg Omelette", "Egg Bhurji (3 Eggs)", "Egg Bhurji (4 Eggs)", "Egg Roast (3 Eggs)", "Egg Roast (6 Eggs)", "Egg Curry (3 Eggs)", "Egg Curry (4 Eggs)", "Egg2 Butter Masala", "Bread Omelette",
    "Veg Noodles", "Gobi Noodles", "Paneer Noodles", "Kaju Noodles", "Mushroom Noodles", "Egg Noodles", "Double Egg Noodles", "Chicken Noodles", "Fish Noodles", "Parota (2pcs)", "Parota (1pc)", "Chapathi (3pcs)", "Chapathi (1pc)",
    "Plain Dosa", "Masala Dosa", "Paneer Dosa", "Butter Dosa", "Ghee Dosa", "Cheese Dosa", "Ghee karam Dosa", "Onion Dosa", "Dosa chicken curry 1cup", "Chicken keema Dosa", "Puri", "Puri chicken curry", "Vada"
];

const price=[
    60, 70, 50, 90, 90, 90, 90, 100, 70, 80, 100, 100, 150, 120,
    50, 60, 60, 60, 90, 120, 90, 90, 40, 70, 90, 60, 70, 80, 100,
    100, 150, 160, 150, 150, 80, 50, 100, 100, 100,
    100, 100, 100, 120, 120, 100, 180,
    10, 20, 30, 40, 50, 50, 90, 50, 60, 100, 40,
    50, 70, 80, 100, 80, 60, 70, 80, 100, 30, 15, 30, 10,
    30, 40, 60, 60, 60, 70, 70, 40, 100, 120, 40, 100, 40
];
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