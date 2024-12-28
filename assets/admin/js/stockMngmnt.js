

document.querySelectorAll(".edit-quantity-btn").forEach(button => {
button.addEventListener("click", function () {

const productId = this.getAttribute("data-productId");


console.log("Selected Product ID:", productId);

document.getElementById("editQuantityForm").addEventListener("submit", function (e) {
e.preventDefault();


const quantityInput = document.getElementById("quantityInput");
const expiryDateInput = document.getElementById("expiryDateInput");

if (quantityInput.value <= 0) {
quantityInput.classList.add("is-invalid");
return;
} else {
quantityInput.classList.remove("is-invalid");
}

const currentDate = new Date().toISOString().split("T")[0]; 
if (expiryDateInput.value < currentDate) {
expiryDateInput.classList.add("is-invalid");
return;
} else {
expiryDateInput.classList.remove("is-invalid");
}

const quantity = quantityInput.value;
const expiryDate = expiryDateInput.value;

fetch('/admin/addStock', {
method: 'POST',
headers: {
  'Content-Type': 'application/json'
},
body: JSON.stringify({ quantity, expiryDate, productId })
}).then(res => res.json())
.then(data=>{
if(data.success){
  location.reload()
}else{
  showToast(data.message,'error')
}
})
});
});
});

