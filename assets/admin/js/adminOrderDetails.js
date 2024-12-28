document.getElementById('status-form').addEventListener('submit',(e)=>{
    e.preventDefault()
    const Status=document.getElementById('status').value
    const OrderID=document.getElementById('OrdeID').value
    
    console.log(Status,OrdeID)

    fetch('/admin/OrderStatus',{
        method:'PUT',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
            Status,
            OrderID
        })
    }).then(res=>res.json())
    .then(data=>{
        if(data.success){
            location.reload()
        }else{
            alert(data.mesage)
        }
        // alert(data.message)
    })

})


document.addEventListener('DOMContentLoaded', () => {

const forms = document.querySelectorAll('.individual');
console.log('Number of forms found:', forms.length);

forms.forEach((form) => {
const select = form.querySelector('.ind');
const itemId = form.querySelector('.itemId').value;
const orderId = form.querySelector('.orderId').value;

select.addEventListener('change', (e) => {

const selected = select.value;

fetch('/admin/productRes', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify({ itemId, selected ,orderId}),
})
.then((res) => res.json())
.then((data) => {
if (data.success) {
showToast(data.message, 'success')
location.reload()
} else {
showToast(data.message, 'error');
}
})
.catch((error) => {
console.error('Fetch error:', error);
showToast('Something went wrong!', 'error');
});
});
});

const approveForm = document.getElementById('approve-form');
if (approveForm) {
console.log('Approve form exists! Attaching event listener.');

approveForm.addEventListener('change', (e) => {
e.preventDefault();

const selected = document.getElementById('approval').value;
const orderId = document.getElementById('orderrrID').value;
console.log(selected ,orderId)

fetch('/admin/response', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify({ selected, orderId }),
})
.then((res) => res.json())
.then((data) => {
if (data.success) {
setTimeout(() => {
  location.reload();
}, 1000);
} else {
showToast(data.message, 'error');
}
})
.catch((error) => {
console.error('Fetch error:', error);
showToast('Something went wrong!', 'error');
});
});
}
});
