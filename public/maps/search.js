function myFunction() {
  document.getElementById("myDropdown").classList.toggle("show");
}

function arnav (){
  var ui, f, ul, li, a, i;
  ui = document.getElementById("myInput");
  f = ui.value.toUpperCase();
  div = document.getElementById("myDropdown");
  a = div.getElementsByTagName("a");
  for (i = 0; i < a.length; i++) {
    txtValue = a[i].textContent || a[i].innerText;
    if (txtValue.toUpperCase().indexOf(f) > -1) {
      a[i].style.display = "";
    } else {
      a[i].style.display = "none";
    }
  }
}
