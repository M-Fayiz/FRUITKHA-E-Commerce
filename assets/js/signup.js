document.getElementById("signupForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const form = e.target;
  const result = document.getElementById("result");

  // Clear previous error message
  setTimeout(() => {
    result.innerHTML = "";
  }, 8000); 

  const firstName = form.querySelector("#firstName").value.trim();
  const lastName = form.querySelector("#lastName").value.trim();
  const email = form.querySelector("#email").value.trim();
  const phone = form.querySelector("#phone").value.trim();
  const password = form.querySelector("#password").value.trim();
  const confirmPassword = form.querySelector("#confirmPassword").value.trim();

  console.log(password,confirmPassword);

 
  let isValid=true
  if (firstName === "" || lastName === "" || email === "" ||phone === "" ||password === "" ||confirmPassword === "" ){
     result.innerHTML="Please fill out all required fields correctly"
     isValid=false
  }
 
  if (!firstName.match(/^[A-Za-z ]+$/))  {  
   document.getElementById('firstNameerror').innerHTML='First Name should be letters'
   isValid=false;
  }
  if( !lastName.match(/^[A-Za-z ]+$/)){
    document.getElementById('lasterror').innerHTML='Last Name should be letters'
    isValid=false;
  }

  if (!email.match(/^([a-zA-Z0-9_]+)@([a-zA-Z0-9]+)\.([a-zA-Z]+)(.[a-zA-Z]+)?$/)) {
    document.getElementById('EMIALerror').innerHTML='Email should be valid'
    isValid=false;
  }

  if (!phone.match(/^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/)) {
   
    document.getElementById('PHONEerror').innerHTML='Phone number should be in a valid format'
    isValid=false;
  }
  if (!password.match(/^(?=.*\d).{8,}$/)) {
   
    document.getElementById('Passworderror').innerHTML='Password should be 8 digit'
    isValid=false;
}

if (!password.match(/^(?=.*[0-9])(?=.*[!@#$%^&])[a-zA-Z0-9!@#$%^&]{6,16}$/)) {

  document.getElementById('Passworderror').innerHTML='Password must contain at least one number and one special character.'
    isValid=false;
}

  if (password !== confirmPassword) {
    result.innerHTML = "Confirm Password does not match";
    return;
  }

  console.log(firstName,lastName,email)

  const fetchData = async () => {
    try {
      const response = await fetch("/genarateOTP", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          password,
        }),
      });
      
     
      
      const data = await response.json();
      console.log(data)
      if(data.success){

        if(data.success){
          showToast(data.message, 'success');
        
             window.location.href = `/getOTP`
      
      }else{
        showToast(data.message, 'error');
      }
       
      }
    } catch (err) {}
  };
  fetchData();

});
