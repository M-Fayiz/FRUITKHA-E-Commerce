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
					
					location.reload()

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

	