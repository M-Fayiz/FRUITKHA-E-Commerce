function cancelFromButton(buttonElement) {
    const itemId = buttonElement.getAttribute('data-id');
    const orderId = buttonElement.getAttribute('data-order-id');
    const productId = buttonElement.getAttribute('data-product');
    const quantity = buttonElement.getAttribute('data-quantity');
  
  
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
        await cancel(itemId, orderId, productId, quantity);
      } else {
        Swal.fire('Cancelled', 'Your product remains in the order.', 'info');
      }
    });
  }
  
  async function cancel(itemId, orderId, productId, quantity) {
    console.log('In cancel function:', itemId, orderId, productId, quantity);
  
    
      const response = await fetch('/cancel-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId, orderId, productId, quantity,status:'Cancelled' }),
      });
  
      const data = await response.json();
  
      if (data.success) {
        Swal.fire('Cancelled!', 'Your product has been successfully canceled.', 'success');
        setTimeout(()=>{
          location.reload()
        },600)
      } else {
        Swal.fire('Failed!', data.message || 'There was an issue canceling the product.', 'error');
      }
    
  }
  
  // return product \
  function returnItem(element){
    // const itemId = buttonElement.getAttribute('data-id');
    const orderId = element.getAttribute('data-order-id')
    const productId = element.getAttribute('data-product')
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
                  // Using Bootstrap's JavaScript API to show the modal
                  document.getElementById('OrderId').value = orderId
                  document.getElementById('productId').value=productId
                  var myModal = new bootstrap.Modal(document.getElementById('returnModal'));
                  myModal.show()
              } else {
                  Swal.fire('Cancelled', 'Your product remains in the order.', 'info');
              }
    })
  
  
    document.getElementById('return-form').addEventListener('submit',(e)=>{
      e.preventDefault()
  
      const orderId=document.getElementById('OrderId').value
      const productId=document.getElementById('productId').value
      const Reason=document.getElementById('returnReason').value.trim()
      const productImage=document.getElementById('productImage').files[0]
     if(!Reason|| !productImage){
      return showToast('Please Insert Required Fields','error')
     }
      
      const formData=new FormData()
       formData.append('orderId',orderId)
       formData.append('productId',productId)
       formData.append('Reason',Reason)
       formData.append('productImage',productImage)
  
  
        console.log(orderId,productId,Reason)
        fetch('/req-return',{
          method:'post',
          
          body:formData
        }).then(res=>res.json())
        .then(data=>{
          if(data.success){
            showToast(data.message,'info')
            setTimeout(()=>{
              location.reload()
            },700)
          }else{
            alert(data.message)
          }
          
        })
    })
  
  }
  
  
  
      window.onload = function () {
     
        const paymentMethod = "<%= Order.payment %>";
        const paymentStatus = "<%= Order.paymentStatus %>";
  
      
        if (paymentMethod === "razorpay" && paymentStatus === "Pending") {
          showToast("Your payment is pending. Please complete your payment.",'info');
        }
      }
  
      const retryBtn = document.getElementById('orderID');
  if (retryBtn) {
    retryBtn.addEventListener('click', async (e) => {
      const orderId = retryBtn.getAttribute('data-id');
  
      try {
        // Step 1: Fetch Razorpay order details for retry
        const response = await fetch('/retry-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orderId }),
        });
  
        const data = await response.json();
    console.log(data)
        if (!data.success) {
          Swal.fire({
            icon: 'error',
            title: 'Retry Payment Failed',
            text: data.message,
          });
          return;
        }
  
        const { razorpayOrder, razorpayKey } = data; // Include key from backend
  
       console.log(razorpayKey,'key')
        const options = {
          key: razorpayKey,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: 'FRUITKHA',
          description: 'Retry Payment',
          image: '/img/logo.png',
          order_id: razorpayOrder.id,
          handler: async function (response) {
            
            try {
              const verifyResponse = await fetch('/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: orderId,
                }),
              });
  
              const verifyResult = await verifyResponse.json();
  
              if (verifyResult.success) {
                Swal.fire({
                  icon: 'success',
                  title: 'Payment Successful',
                  text: 'Your payment has been successfully processed.',
                });
                setTimeout(() => window.location.reload(), 1000);
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Payment Verification Failed',
                  text: 'Your payment could not be verified. Please contact support.',
                });
              }
            } catch (error) {
              Swal.fire({
                icon: 'error',
                title: 'Unexpected Error',
                text: `Something went wrong: ${error.message}. Please try again later.`,
              });
            }
          },
          theme: { color: '#F37254' },
        };
  
        console.log('jjjj')
        const razorpay = new Razorpay(options)
        console.log('hhh')
        razorpay.on('payment.failed', function (response) {
          Swal.fire({
            icon: 'error',
            title: 'Payment Failed',
            html: `
              <p>Your payment has failed. You can retry again from your <a href="/order-history" style="color: #007BFF; text-decoration: underline;">Order History</a>.</p>
              <p style="font-size: 14px; color: #888;">Reason: ${response.error.description}</p>
            `,
            confirmButtonText: 'OK',
            confirmButtonColor: '#007BFF',
          });
        });
  
        razorpay.open();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Retry Payment Failed',
          text: `Something went wrong: ${error.message}. Please try again later.`,
        });
      }
    });
  }
  
  
  async function download(orderId) {
          try {
              const response = await fetch(`/invoice/${orderId}`);
              if (!response.ok) {
                  throw new Error(`HTTP error! Status: ${response.status}`);
              }
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `invoice_${orderId}.pdf`;
              a.click();
              window.URL.revokeObjectURL(url);
          } catch (error) {
              console.error('Error downloading invoice:', error);
          }
      }
  
  