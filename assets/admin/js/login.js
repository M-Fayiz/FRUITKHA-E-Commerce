

document.getElementById('form_login').addEventListener('submit',(e)=>{

    e.preventDefault()

    const email=document.getElementById('email').value
    const password=document.getElementById('password').value
    console.log(email,password);
    
    if(email==""||password==""){
        simpleToast.show(false, "Fill Out all required Field")
        return false
    }

        fetchData(email,password)

})

const fetchData= async(email,password)=>{
    console.log('kayariii');
    
    try {
        const response = await fetch('/admin/verify_login',{
            method:'post',
            headers:{
                "Content-Type": "application/json",
            },
            body:JSON.stringify({
                email,
                password
        
            })
                
         })
         if(!response.ok){
            throw Error(response.statusText)
         }
   
         
      const data = await response.json()
      console.log('hhhhh');
      
      console.log(data.message);
      if(data.success){
        
        showToast(data.message, 'success');
        setTimeout(()=>{
  window.location.href='/admin/'
        },1000)
        
      
       
      }else{
        showToast(data.message, 'error');
      }
       
    } catch (error) {
     console.log(error.message);
        
    }
             

          
}