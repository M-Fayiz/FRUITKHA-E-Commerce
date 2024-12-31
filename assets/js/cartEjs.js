document.addEventListener("DOMContentLoaded", () => {
    console.log('GET IN UPDATE CART QUANTITY');

    
    document.querySelectorAll(".inc-button").forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.getAttribute('data-id');
            updateCartQuantity(productId, 1); 
        });
    });

   
    document.querySelectorAll('.dec-button').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.getAttribute('data-id');
            updateCartQuantity(productId, -1); 
        });
    });

   
    const updateCartQuantity = (productId, QNTY) => {
        fetch('/update-quantity', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId, QNTY })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // console.log(data)
                    const productSubtotalElement = document.getElementById(`subtotal-${productId}`)
                    const quantityvalue=document.getElementById(`quantity-${productId}`)
                    const decre=document.getElementById(`decre-${productId}`)
                  
                        
                 
                    const updatedProduct = data.cart.Products.find(p => p.productId === productId);
                    // console.log(updatedProduct)
                    if (productSubtotalElement && updatedProduct) {
                        productSubtotalElement.textContent = `${updatedProduct.TOTAL} ₹`;
                        quantityvalue.value=`${updatedProduct.quantity}`
                        parseInt(quantityvalue.value)>1?decre.style.display='block':decre.style.display='none'
                    }
    
                  

                    const cartSubtotalElement = document.querySelector('.total-data td:nth-child(2)');
                    if (cartSubtotalElement) {
                        cartSubtotalElement.textContent = `₹${data.cart.subTotal}`;
                    }

                } else {
					showToast(data.message,'error')
                    console.error('Failed to update quantity');
                }
            })
            .catch(error => {
                console.error('Error while updating Cart:', error);
            });
    };
});




    function remove(button){
		const productId = button.getAttribute('data-id');
		console.log(productId)
		 
		 fetch('/removeCart',{
			method:'post',
			headers:{
				'Content-Type':'application/json'
			},
			body:JSON.stringify({productId})
		 }).then(res=>res.json())
		 .then(data=>{
			if(data.success){
				showToast(data.message,'success')
				setTimeout(()=>{
					location.reload()
				},500)
			}else{
				showToast(data.message,'erroe')
			}
		 })
	}

	