document.getElementById('edit-profile').addEventListener('submit',(e)=>{
    e.preventDefault()

    const FIRST=document.getElementById('FIRST').value.trim()
    const LAST=document.getElementById('LAST').value.trim()
    const phone=document.getElementById('phone').value.trim()
    const ID=document.getElementById('ID').value
console.log(ID)
    console.log(FIRST,LAST,phone)
 const isValid=true

if (!FIRST.match(/^[A-Za-z ]+$/))  {  
document.getElementById('Firsterror').innerHTML='First Name should be letters'
isValid=false;
}
if (!LAST.match(/^[A-Za-z ]+$/))  {  
document.getElementById('Lasterror').innerHTML='Last Name should be letters'
isValid=false;
}
if (!phone.match(/^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/)) {

document.getElementById('PHONEerror').innerHTML='Phone number should be in a valid format'
isValid=false;
}


        fetch('/editProfile', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ FIRST, LAST, phone,ID }),
        })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                  showToast(data.message,'success')
                    setTimeout(() => {
                        location.reload(); // Reload the page after 500ms
                    }, 500);
                } else {
                    showToast(data.message,'error')
                }

        });


})

// <!-- Change Password -->

document.getElementById('pass-form').addEventListener('submit',(e)=>{
e.preventDefault()

const password=document.getElementById('password').value
const PAS1=document.getElementById('PAS1').value
const PAS2=document.getElementById("PAS2").value
const userID=document.getElementById('userID').value
console.log('userID',userID);

let Valid=true

        // if (!password.match(/^(?=.*\d).{8,}$/)||!PAS1.match(/^(?=.*\d).{8,}$/)) {
        // document.getElementById('Passworderror').innerHTML='Password should be 8 digit'
        // Valid=false;
        // }

        if (!PAS1.match(/^(?=.*[0-9])(?=.*[!@#$%^&])[a-zA-Z0-9!@#$%^&]{6,16}$/)) {

        document.getElementById('PAS1error').innerHTML='Password must contain at least one number and one special character.'
        Valid=false;
        }

        if (PAS1 !== PAS2) {
            document.getElementById('PAS2error').innerHTML=''
            document.getElementById('PAS2error').innerHTML='Password and Confirm Password do not Match.'
            Valid=false;
        }

 fetch('/change-Password',{
    method:'PATCH',
    headers:{
        'Content-Type': 'application/json',
    },
    body:JSON.stringify({
        password,
        PAS1,
        userID
    })
 }).then(res=>res.json())
 .then(data=>{
    console.log(data)
    if(data.success){
        showToast(data.message,'success')
        setTimeout(()=>{
            location.reload()
        },1000)
    }else{
        showToast(data.message,'error')
    }
 })   

})