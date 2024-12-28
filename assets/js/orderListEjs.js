function cancel(element) {
    const orderId = element.getAttribute('data-id')
    console.log(orderId)
  Swal.fire({
    title: 'Are you sure?',
    text: "Do you want to cancel this product from the order? This action cannot be undone!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, cancel it!',
    cancelButtonText: 'No, keep it',
  }).then(async (result) => {
    if (result.isConfirmed) {
      await  cancelOrder(orderId)
    } else {
      Swal.fire('Cancelled', 'Your product remains in the order.', 'info');
    }
  });
}

  
async function cancelOrder(orderId) {
    console.log(orderId);

    try {
        const response = await fetch('/order-cancel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                orderId,
            }),
        });

       
        const data = await response.json();

        

        if (data.success) {
            Swal.fire('Cancelled!', 'Your product has been successfully canceled.', 'success');
            showToast(data.message, 'success')
            setTimeout(()=>{
              location.reload();
            },400)
            
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('An error occurred while canceling the order.', 'error');
    }
}

//  RETURN ORDER 

function orderReturn(element) {
        const orderId = element.getAttribute('data-id');
        Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to cancel this product from the order? This action cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, cancel it!',
            cancelButtonText: 'No, keep it',
        }).then((result) => {
            if (result.isConfirmed) {
              
                document.getElementById('OrderId').value = orderId;
                var myModal = new bootstrap.Modal(document.getElementById('returnModal'));
                myModal.show();
            } else {
                Swal.fire('Cancelled', 'Your product remains in the order.', 'info');
            }
        });
    }

 document.getElementById('return-form').addEventListener('submit',(e)=>{
  e.preventDefault()
  const orderId=document.getElementById('OrderId').value
  const Reason=document.getElementById('returnReason').value.trim()
  const prodctImage=document.getElementById('productImage').files[0]
  console.log(prodctImage)
   if(!Reason|| !prodctImage){
    return showToast('Please Insert Required Fields','error')
   }
   const formData=new FormData()
     formData.append('orderId',orderId)
  
     formData.append('Reason',Reason)
     formData.append('prodctImage',prodctImage)

  fetch('/return-Order',{
    method:'post',
    body:formData
  }).then(res=>res.json())
  .then(data=>{
    if(data.success){
      showToast(data.message,'info')
      setTimeout(()=>{
        location.reload()
      },600)
    }else{
      showToast(data.message,'error')
    }

  })
 })
