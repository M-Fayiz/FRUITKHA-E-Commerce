
//    COD IS NOT ALLOWED FOR LIMITED RUPEES
            const getamount=document.getElementById('place')
            const amount=getamount.getAttribute('data-amount')
            const info=document.getElementById('inform')
            const cod=document.getElementById('cod')
            if (amount>500) {
              cod.disabled  =true
              info.innerHTML='Cash on Delivery is unavailable for orders above 500. Please choose another payment option'
            }
//   PLACE ORDER  |   PLACE ORDER   |   PLACE ORDER
 document.getElementById('order-form').addEventListener('submit', async (e) => {
          e.preventDefault(); 
         console.log('get in place Order')
          const selectedAddress = document.querySelector('input[name="selectedAddress"]:checked');
          const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
          const place = document.getElementById('place');
          const Amount = place.getAttribute('data-amount')
          console.log(paymentMethod.value,'  ',Amount)
        
          
        
          if (!selectedAddress || !paymentMethod) {
            let errorMessage = "Please select:";
            if (!selectedAddress) errorMessage += " a shipping address";
            if (!selectedAddress && !paymentMethod) errorMessage += " and";
            if (!paymentMethod) errorMessage += " a payment method";
        
            showToast(errorMessage, 'info'); 
            return; 
          }
        let limit=500
          if(paymentMethod.value==='COD'&&Amount>limit){
           return  showToast(`Cash on Delivery is unavailable for orders above ₹${limit}. Please choose another payment option`,'info')
          }
        
          
        
        
          if (paymentMethod.value === 'razorpay') {
          const amount = parseInt(Amount);
        
          try {
           
            const formData = {
              selectedAddress: selectedAddress.value,
              paymentMethod: 'razorpay',
              amount,
            };
        
            const placeOrderResponse = await fetch('/placeOrder', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(formData),
            });
        
            const orderData = await placeOrderResponse.json();
        
          let orderId= orderData.order._id
         
          let OrderId=orderData.order._id
            if (!orderData.success) {
              throw new Error('Failed to place order');
            }
        
            const response = await fetch('/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ amount }),
            });
        
            if (!response.ok) throw new Error('Failed to create Razorpay order');
        
            const { order } = await response.json();
            if (!order || !order.id) throw new Error('Invalid Razorpay order response from server');
        
            const options = {
              key: 'rzp_test_rYOACsUGVDxGZE',
              amount: order.amount,
              currency: order.currency,
              name: 'FRUITKHA',
              description: 'Please pay your order payment',
              image: '/img/logo.png',
              order_id: order.id,
              handler: async function (response) {
                try {
                  const verifyResponse = await fetch('/verify-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      razorpay_order_id: response.razorpay_order_id,
                      razorpay_payment_id: response.razorpay_payment_id,
                      razorpay_signature: response.razorpay_signature,
                      orderId: OrderId,
                    }),
                  });
        
                  const verifyResult = await verifyResponse.json();
        
                  if (verifyResult.success) {
                    showOrderSuccess();
                    setTimeout(() => window.location.href = `/success/${orderId}`, 800);
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
        
            const razorpay = new Razorpay(options);
        
            razorpay.on('payment.failed', function (response) {
              Swal.fire({
                icon: 'error',
                title: 'Payment Failed',
                html: `
                  <p>Your payment has failed. You can retry payment from your <a href="/orderList" style="color: #007BFF; text-decoration: underline;">Order History</a>.</p>
                 
                `,
                confirmButtonText: 'OK',
                confirmButtonColor: '#007BFF',
              }).then((result)=>{
                if(result.isConfirmed){
              
                 window.location.href=`/orderDetails/${OrderId}`
             
              }
              })
             
             
             
              console.error('Payment failed:', response.error);
            });
        
            razorpay.open();
          } catch (error) {
            Swal.fire({
              icon: 'error',
              title: 'Order Error',
              text: `Failed to place order: ${error.message}`,
            });
          }
        }
        
         else {
            
            
            const form = e.target;
            const formData = new FormData(form);
            const formObject = Object.fromEntries(formData.entries());
        
            try {
              fetch('/placeOrder', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(formObject),
              }).then(res=>res.json())
              .then(data=>{
              let orderId=  data.order._id
                if(data.success){
                  showOrderSuccess();
                  setTimeout(() => window.location.href = `/success/${orderId}`, 800);
                }else{
                  // showToast(data.message,'error')
                  Swal.fire('Error', data.message, 'error')
                }
              })
            } catch (error) {
              alert('Failed to place the order: ' + error.message);
            }
          }
        });
        
        function showOrderSuccess() {
          Swal.fire({
            title: 'Order Placed Successfully!',
            text: 'Your order has been placed successfully. We will notify you once it is shipped.',
            icon: 'success',
            confirmButtonText: 'Okay'
          });
        }
        
        
//  EDIT ADDRESS FROM CHECK OUT  |  EDIT ADDRESS FROM CHECK OUT
        
        function editAddress(Name, adName, State, District, Place, Pincode, mark, user) {
            console.log(Name, adName, State, District, Place, Pincode, mark);
        
            
            document.getElementById('editCustomerName').value = Name;
            document.getElementById('editAddressName').value = adName;
            document.getElementById('editPincode').value = Pincode;
            document.getElementById('editPlace').value = Place;
            document.getElementById('editCity').value = District;
            document.getElementById('editState').value = State;
            document.getElementById('editLandmark').value = mark;
        
           
            document.getElementById('edit-address-form').setAttribute('data-user', user);
        
            
            document.getElementById('edit-address-form').addEventListener('submit', async (e) => {
                e.preventDefault();
        
                const editCustomerName = document.getElementById('editCustomerName').value.trim();
                const editAddressName = document.getElementById('editAddressName').value.trim();
                const editPincode = document.getElementById('editPincode').value.trim();
                const editPlace = document.getElementById('editPlace').value.trim();
                const editCity = document.getElementById('editCity').value.trim();
                const editState = document.getElementById('editState').value.trim();
                const editLandmark = document.getElementById('editLandmark').value.trim();
                const user = document.getElementById('edit-address-form').getAttribute('data-user');
        
                try {
                    // Fetch API to validate pincode
                    const response = await fetch(`https://api.postalpincode.in/pincode/${editPincode}`);
                    const data = await response.json();
        
                    if (data[0].Status === "Success") {
                        const postOffices = data[0].PostOffice;
                        const isValidState = postOffices.some(
                            (office) => office.State.toLowerCase() === editState.toLowerCase()
                        );
                        const isValidDistrict = postOffices.some(
                            (office) => office.District.toLowerCase() === editCity.toLowerCase()
                        );
                        const isValidStreet = postOffices.some(
                            (office) => office.Name.toLowerCase() === editPlace.toLowerCase()
                        );
        
                        if (isValidState && isValidDistrict && isValidStreet) {
                            document.getElementById('Result').innerHTML = `<p class="text-success">Validation Successful! All details match.</p>`;
        
                           
                            await fetch('/editADRS', {
                                method: 'PATCH',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    Name: editCustomerName,
                                    AdName: editAddressName,
                                    PIN: editPincode,
                                    PLace: editPlace,
                                    City: editCity,
                                    State: editState,
                                    Mark: editLandmark,
                                    user: user,
                                }),
                            }).then((res) => res.json())
                              .then((data) => {
                                if (data.success) {
                                    // showToast(data.message, 'success');
                                    setTimeout(()=>{
                                        window.location.reload();
                                    },200)
                                   
                                } else {
                                    // showToast(data.message, 'error');
                                }
                            });
                        } else {
                            document.getElementById('Result').innerHTML = `<p class="text-danger">Validation Failed! Please check the details.</p>`;
                        }
                    } else {
                        document.getElementById('Result').innerHTML = `<p class="text-danger">Invalid Pincode or No Data Found.</p>`;
                    }
                } catch (error) {
                    document.getElementById('Result').innerHTML = `<p class="text-danger">Error: ${error.message}</p>`;
                }
            });
        }
          
       // EVENT DELEGATION FOR APPLY COUPON
document.body.addEventListener('click', (event) => {
    if (event.target && event.target.id === 'apply') {
        const coupon = document.getElementById('coupon-input').value.trim();
        const result = document.getElementById('result');

        const applyButton = event.target;
        const userId = applyButton.getAttribute('data-user');
        const total = applyButton.getAttribute('data-total');

        if (!coupon) {
            result.innerHTML = 'Enter A Valid Coupon Code';
            return;
        }

        fetch('/couponDetails', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                coupon,
                userId,
                total,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    location.reload(); // Assuming this updates the DOM to show the applied coupon
                } else {
                    showToast(data.message, 'error');
                }
            })
            .catch((error) => {
                console.error('Error during coupon application:', error);
                showToast('An error occurred while applying the coupon.', 'error');
            });
    }
});

// EVENT DELEGATION FOR REMOVE COUPON
document.body.addEventListener('click', (event) => {
    if (event.target && event.target.id === 'remove') {
        const removeBtn = event.target;
        const couponId = removeBtn.getAttribute('data-coupon');
        const userId = removeBtn.getAttribute('data-user');

        console.log('Removing coupon with ID:', couponId, 'for user:', userId);

        fetch('/remove-coupon', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ couponId, userId }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.message) {
                    location.reload(); // Assuming this updates the DOM to show the button again
                } else {
                    showToast('Failed to remove coupon. Please try again.', 'error');
                }
            })
            .catch((error) => {
                console.error('Error during coupon removal:', error);
                showToast('An error occurred while removing the coupon.', 'error');
            });
    }
});
