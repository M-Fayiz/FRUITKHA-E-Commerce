

    document.getElementById('login_form').addEventListener('submit', (e)=>{
        e.preventDefault();
        
            let email=document.getElementById('email').value
            let password=document.getElementById('password').value
            
            if(email==""||password==""){
              showToast('Please fill out all required fields correctly', 'error');
                 
                   return false
               
            }
            try{

                fetchData(email,password)
            }
            catch(err){

                console.log("err", err.message)
            }
          
          
        
    
    }) 
       
    

    const fetchData = async (email, password) => {
        console.log("working")
          const response = await fetch("/verify_lagin", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
               email,
               password,
             
            }),
          });
          
          
          console.log('body boody');
          
          const data = await response.json();
          console.log("data of login",data)
          if(data.success){
            showToast(data.message, 'success');
            setTimeout(()=>{
             window. location.href='/'
            },1000)
         
          }else{
            showToast(data.message,'error');
            if(data.inf==true){
              window.location.href='/signUp'
            }
            
          //  window.location.href='/login'
            // throw Error(data)
          }
        } 
        
      