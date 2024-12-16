document.getElementById('resendBtn').addEventListener('click', async function(event) {
    event.preventDefault();
  console.log('OTP kayari');
  
    try {
        // console.log('inside try');
        
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
    event.preventDefault();
    const EMAIL=document.getElementById('Email-Otp').value
    const otpInputs = document.querySelectorAll('.otp-input');
    let otpValue = '';
    otpInputs.forEach(input => {
      otpValue += input.value;
    });
  
    
    try {
      const response = await fetch('/verifyOTP', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ otp: otpValue ,EMAIL})
      });

      console.log(response)
  
      const data = await response.json();
      
      if (data.success) {
       
        // alert("OTP Verified!", 'success',data.message);
        showToast(data.message, 'success');
        setTimeout(()=>{
          window.location.href = '/'
        },800)
       
      } else {
      //  alert(data.message);
       showToast(data.message, 'error');
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });
  