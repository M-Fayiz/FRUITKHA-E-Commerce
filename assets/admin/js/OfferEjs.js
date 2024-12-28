document.addEventListener('DOMContentLoaded', () => {
    const editStartDate = document.getElementById("newCreatedAt");
    const today = new Date().toISOString().split("T")[0];
    editStartDate.setAttribute("min", today);

    document.getElementById('newCategoryForm').addEventListener('submit', (e) => {
        e.preventDefault();

     
        let categoryID = document.getElementById('categorySelect').value;
        let productId = document.getElementById('productSelect').value;
        const offerPercentage = document.getElementById('Offer').value;
        const offerDescription = document.getElementById('description').value;
        const createdAt = editStartDate.value;
        const expiredAt = new Date(document.getElementById('newExpiredAt').value);

        if (createdAt > expiredAt) {
            return showToast('Expired date should be greater than created date', 'error');
        }

   
        console.log(categoryID, offerPercentage, offerDescription, createdAt, expiredAt, productId);
       


        if (!offerPercentage || !offerDescription || !createdAt || !expiredAt) {
            alert('Please fill all the fields!');
            return;
        }

     
        
            let toPass={
                       
                        offerPercentage,
                        offerDescription,
                        createdAt,
                        expiredAt,
                        productId
            }
        if(categoryID!==''){
            toPass.categoryID=categoryID
        }else if(productId!==''){
            toPass.productId=productId
        }

       
        
        fetch(`/admin/addOffer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(toPass)
        }).then(res => res.json())
            .then(data => {
                if (data.success) {
                    showToast(data.message, 'success');
                    location.reload()
                } else {
                    showToast(data.message, 'error');
                }
            });
    });
});




async function clearOfferPrice(OfferID) {
  console.log(OfferID,"offerid")
  
    try {
        const response = await fetch('/admin/clearOffer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ OfferID })
        })
        
        const data = await response.json()
        console.log(data)
        if (data.success) {
            showToast('Offer price cleared successfully!' ,'success')
            setTimeout(()=>{
                location.reload()
            },500)
           
        } else {
            showToast(data.message,'error')
        }
    } catch (error) {
        console.error('Error clearing offer price:', error)
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const radioCategory = document.getElementById("radioCategory");
    const radioProduct = document.getElementById("radioProduct");
    const categorySelect = document.getElementById("categorySelect");
    const productSelect = document.getElementById("productSelect");

    function updateVisibility() {
        if (radioCategory.checked) {
            categorySelect.style.display = "block";
            productSelect.style.display = "none";
            productSelect.disabled = true; 
            categorySelect.disabled = false; 
            productSelect.value = ""; 
        } else if (radioProduct.checked) {
            categorySelect.style.display = "none";
            productSelect.style.display = "block";
            categorySelect.disabled = true; 
            productSelect.disabled = false; 
            categorySelect.value = ""; 
        }
    }

    radioCategory.addEventListener("change", updateVisibility);
    radioProduct.addEventListener("change", updateVisibility);

    updateVisibility();
});

