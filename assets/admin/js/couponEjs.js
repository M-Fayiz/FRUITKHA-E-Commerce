document.addEventListener("DOMContentLoaded", () => {

    const start = document.getElementById("startDate");
    const today = new Date().toISOString().split("T")[0];
    start.setAttribute("min", today);

    const couponValueContainer = document.getElementById("couponValueContainer");
    const couponType = document.getElementById("couponType");
    const couponValue = document.getElementById("couponValue");
    const maxContainer=document.getElementById('maxContainer')
    couponType.addEventListener("change", () => {
        const selectedType = couponType.value;

        couponValue.value = "";
        couponValue.removeAttribute("min");
        couponValue.removeAttribute("max");
        couponValueContainer.style.display = "block";

        if (selectedType === "Percentage") {
            couponValue.setAttribute("min", "1");
            couponValue.setAttribute("max", "100");
            couponValue.setAttribute("placeholder", "Enter a percentage (1-100)");
            maxContainer.style.display='block'
        } else if (selectedType === "Fixed") {
            couponValue.setAttribute("min", "1");
            couponValue.removeAttribute("max");
            couponValue.setAttribute("placeholder", "Enter a fixed amount");
        } else if (selectedType === "Shipping_Offer") {
            couponValueContainer.style.display = "none";
        }
    });

    document.getElementById("coupon-form").addEventListener("submit", async (e) => {
        e.preventDefault();

        const couponCode = document.getElementById("couponCode").value.trim();
        const couponType = document.getElementById("couponType").value;
        const couponValue = document.getElementById("couponValue").value;
        const startDate = start.value;
        const endDate = document.getElementById("endDate").value;
        const maxDiscount=document.getElementById('maxDiscount').value
        const maxUses = document.getElementById("maxUses").value;
        const usedPerUser = document.getElementById("usedPerUser").value;
        const minCartValue = document.getElementById("minCartValue").value;
        const description=document.getElementById('couponDesc').value

        if (/\s/.test(couponCode)) {
            return showToast("Coupon code should not contain spaces and must be a single word.", "error");
        }

        if (!couponCode || !couponType || !startDate || !endDate || !maxUses || !usedPerUser || !minCartValue) {
            return showToast("Please fill in all the required fields.", "error");
        }

        if (endDate < startDate) {
            return showToast("The end date should be greater than the start date.", "error");
        }

        try {
            const response = await fetch("/admin/addCoupon", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    couponCode,
                    description,
                    couponType,
                    couponValue,
                    startDate,
                    endDate,
                    maxUses,
                    usedPerUser,
                    minCartValue,
                    maxDiscount
                }),
            });

            const data = await response.json();
            if (response.ok) {
                if(data.success){
                    showToast(data.message || "Coupon added successfully!", "success")
                    location.reload()
                }else{
                    showToast(data.message || "Coupon added successfully!", "error")
                }
                
            } else {
                showToast(data.message || "Failed to add coupon.", "error");
            }
        } catch (error) {
            showToast("An error occurred while submitting the form.", "error");
        }
    });
});

function deleteCoupon(couponId){
     fetch('/admin/removeCoupon',{
        method:'post',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({couponId})
     }).then(res=>res.json())
     .then(data=>{
        showToast(data.message,'success')
        setTimeout(()=>{
            location.reload()
        },400)
     })
}


//  edit coupon  
document.addEventListener("DOMContentLoaded", () => {
    const editStartDate = document.getElementById("editStartDate");
    const today = new Date().toISOString().split("T")[0];
    editStartDate.setAttribute("min", today);

    const editCouponValueContainer = document.getElementById("editCouponValueContainer");
    const editCouponType = document.getElementById("editCouponType");
    const editCouponValue = document.getElementById("editCouponValue");
    const editMax=document.getElementById('editMax')
    const handleTypeChange = () => {
        const selectedType = editCouponType.value;

        editCouponValue.value = "";
        editCouponValue.removeAttribute("min");
        editCouponValue.removeAttribute("max");
        editCouponValueContainer.style.display = "block";

        if (selectedType === "Percentage") {
            editCouponValue.setAttribute("min", "1");
            editCouponValue.setAttribute("max", "100");
            editCouponValue.setAttribute("placeholder", "Enter a percentage (1-100)");
            editMax.style.display='block'
        } else if (selectedType === "Fixed") {
            editCouponValue.setAttribute("min", "1");
            editCouponValue.removeAttribute("max");
            editCouponValue.setAttribute("placeholder", "Enter a fixed amount")
            editMax.style.display='none'
        } else if (selectedType === "Shipping_Offer") {
            editCouponValueContainer.style.display = "none";
        }
    };

    editCouponType.addEventListener("change", handleTypeChange);

    document.getElementById("edit-coupon-form").addEventListener("submit", async (e) => {
        e.preventDefault();

        const id = document.getElementById("editCouponId").value; 
        const editCouponCode = document.getElementById("editCouponCode").value.trim()
        const editCouponType = document.getElementById("editCouponType").value
        const EditcouponDesc = document.getElementById("EditcouponDesc").value
        const editCouponValue = document.getElementById("editCouponValue").value
        const startDate = editStartDate.value
        const editEndDate = document.getElementById("editEndDate").value
        const editMaxUses = document.getElementById("editMaxUses").value
        const editUsedPerUser = document.getElementById("editUsedPerUser").value
        const editMinCartValue = document.getElementById("editMinCartValue").value
        const couponMaxDiscoun=document.getElementById('couponMaxDiscoun').value

        if (/\s/.test(editCouponCode)) {
            return showToast("Coupon code should not contain spaces and must be a single word.",'error')
        }

        if (editEndDate < startDate) {
            return showToast("The end date should be greater than the start date.",'error')
        }

        try {
            const response = await fetch('/admin/editCoupon', {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id,
                    code: editCouponCode,
                    Description: EditcouponDesc,
                    type: editCouponType,
                    value: editCouponValue,
                    startDate,
                    endDate: editEndDate,
                    maxUses: editMaxUses,
                    usedPerUser: editUsedPerUser,
                    minCartValue: editMinCartValue,
                    maxDiscount:couponMaxDiscoun
                }),
            });

            const data = await response.json();
            if (data.success) {
                // alert(data.message)
                showToast(data.message ,'success')
                setTimeout(()=>{
                    location.reload()
                })
            } else {
                // alert(data.message)
                showToast(data.message ,'error')
            }
        } catch (error) {
            console.log(error.message)
            showToast("An error occurred while updating the coupon.",'error');

        }
    });
});
//   Edit coupon for value assign 
 function editCoupon(id, code, Type, Value, maxUses, usedPerUser, minCartValue, startDate, endDate,maxDiscount) {
    console.log(id, code, Type, Value, maxUses, usedPerUser, minCartValue, startDate, endDate);
   const END= new Date(endDate).toLocaleDateString('en-GB', {day: '2-digit',month: '2-digit', year: 'numeric' })
   const START= new Date(startDate).toLocaleDateString('en-GB', {day: '2-digit',month: '2-digit', year: 'numeric' })
                                    
                    console.log(END,START)                
                                   
                                 
    document.getElementById("editCouponId").value = id; 
    document.getElementById("editCouponCode").value = code;
    const editCouponType = document.getElementById("editCouponType");
    const editCouponValue = document.getElementById("editCouponValue");
    const editStartDate = document.getElementById("editStartDate");

    editCouponType.value = Type;
    editCouponValue.value = Value;
    editStartDate.value = START;
    document.getAnimations('couponMaxDiscoun').value=maxDiscount
    document.getElementById("editEndDate").value = END;
    document.getElementById("editMaxUses").value = maxUses;
    document.getElementById("editUsedPerUser").value = usedPerUser;
    document.getElementById("editMinCartValue").value = minCartValue;

    
    const handleTypeChange = () => {
        const selectedType = editCouponType.value;
        editCouponValue.removeAttribute("min");
        editCouponValue.removeAttribute("max");

        if (selectedType === "Percentage") {
            editCouponValue.setAttribute("min", "1");
            editCouponValue.setAttribute("max", "100");
            editCouponValue.setAttribute("placeholder", "Enter a percentage (1-100)");
        } else if (selectedType === "Fixed") {
            editCouponValue.setAttribute("min", "1");
            editCouponValue.setAttribute("placeholder", "Enter a fixed amount");
        } else if (selectedType === "Shipping_Offer") {
            document.getElementById("editCouponValueContainer").style.display = "none";
        }
    };

    handleTypeChange();
}



   