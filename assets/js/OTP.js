document.getElementById('resendBtn').addEventListener('click', async function(event) {
    event.preventDefault();
  console.log('OTP kayari');
  
    try {
        console.log('inside try');
        
      const response = await fetch('/resendOTP', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
  
      const result = await response.json();
      if (result.success) {
       
        showToast("A new OTP has been sent to your email.", 'success');
      } else {
    
        showToast("Failed to resend OTP. Please try again.", 'error');
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
    }
  });

//   verify OOOO--TTTT--PPPP
  
  document.getElementById('otpForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent form from refreshing the page
    // let endpoint
    // if(' <%= RESULT %>'){
    //   console.log('result');
      
    //   endpoint='/forgetPASS'
    // }else if('<%= email %>'){
    //   console.log('email');
      
    //  endpoint='/verifyOTP'
      
    // }
    // Collect OTP values
    const otpInputs = document.querySelectorAll('.otp-input');
    let otpValue = '';
    otpInputs.forEach(input => {
      otpValue += input.value;
    });
  
    // Send OTP to backend
    try {
      const response = await fetch('/verifyOTP', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ otp: otpValue })
      });

      console.log(response)
  
      const data = await response.json();
      
      if (data.success) {
       
        alert("OTP Verified!", 'success',data.message);
        
        window.location.href = '/'
      } else {
       alert(data.message);
       
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });
  