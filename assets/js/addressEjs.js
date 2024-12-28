document.getElementById('address-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const adres_name = document.getElementById('addressName').value.trim();
    const Name = document.getElementById('NAME').value.trim();
    const pincode = document.getElementById('pincode').value.trim();
    const place = document.getElementById('place').value.trim();
    const city = document.getElementById('city').value.trim();
    const state = document.getElementById('state').value.trim();
    const mark=document.getElementById('landmark').value.trim()
    const user = document.getElementById('user').value;
    const resultDiv = document.getElementById("validationResult");

    if(Name==''||pincode==''||place==''||city==""||state==''||mark==''||adres_name==''){

        resultDiv.innerHTML = `<p class="text-danger">Fill out Required Field.</p>`;
    }

    try {
        
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();

        if (data[0].Status === "Success") {
            const postOffices = data[0].PostOffice;
            const PIN_region = postOffices.map(val => val.Name);

            
            populatePlaceDropdown(PIN_region);

            
            const isValidState = postOffices.some(
                (office) => office.State.toLowerCase() === state.toLowerCase()
            );
            const isValidDistrict = postOffices.some(
                (office) => office.District.toLowerCase() === city.toLowerCase()
            );
            const isValidStreet = postOffices.some(
                (office) => office.Name.toLowerCase() === place.toLowerCase()
            );

            if (isValidState && isValidDistrict && isValidStreet) {
                resultDiv.innerHTML = `<p class="text-success">Validation Successful! All details match.</p>`;
            } else {
                resultDiv.innerHTML = `<p class="text-danger">Validation Failed! Please check the details.</p>`;
            }
        } else {
            resultDiv.innerHTML = `<p class="text-danger">Invalid Pincode or No Data Found.</p>`;
        }
    } catch (error) {
        resultDiv.innerHTML = `<p class="text-danger">Error: ${error.message}</p>`;
    }

    fetch('/addADRS',{
        method:'post',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
            Name,
            adres_name,
            pincode,
            place,
            city,
            state,
            mark,
            user
        })
    }).then(res=>res.json())
    .then(data=>{
        if(data.success){
        showToast(data.message,'success')
         window.location.reload()
        }else{
            showToast(data.message,'error')
        }
    })
    
});


function populatePlaceDropdown(places) {
    const placeDropdown = document.getElementById("place")
    placeDropdown.innerHTML = `<option value="">Select a place</option>`; // Clear existing options

    places.forEach((place) => {
        const option = document.createElement("option");
        option.value = place;
        option.textContent = place;
        placeDropdown.appendChild(option);
    });

    
}


document.getElementById("pincode").addEventListener("input", async function () {
    const pincode = this.value.trim();

    if (pincode.length === 6) { // Fetch only for valid-length pincodes
        try {
            const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
            const data = await response.json();

            if (data[0].Status === "Success") {
                const postOffices = data[0].PostOffice;
                const state = postOffices[0].State;
                const district = postOffices[0].District;
                const PIN_region = postOffices.map((val) => val.Name);

                document.getElementById("state").value = state;
                document.getElementById("city").value = district;

                populatePlaceDropdown(PIN_region);
            } else {
                resetFields();
            }
        } catch (error) {
            console.error("Error fetching pincode data:", error);
            resetFields();
        }
    } else {
        resetFields();
    }
});

function resetFields() {
    document.getElementById("place").innerHTML = `<option value="">Select a place</option>`;
    document.getElementById("state").value = "";
    document.getElementById("city").value = "";
}


// DELET ADDRESS // DELET ADDRESS // DELET ADDRESS // DELET ADDRESS

function deleteAddress(adrsID){
    fetch('/delete-Adres',{
        method:'DELETE',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({adrsID})
    }).then(res=>res.json())
    .then(data=>{
        if(data.success){
            showToast(data.message,'success')
            setTimeout(()=>{
                window.location.reload()
            })
            
        }else{
            showToast(data.message,'error')
        }
    })
}
/// EDIT ADDRESS // EDIT ADDRESS // EDIT ADDRESS // EDIT ADDRESS 

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

                    // Make PATCH request to update the address
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
                            showToast(data.message, 'success');
                            setTimeout(()=>{
                                window.location.reload();
                            },200)
                           
                        } else {
                            showToast(data.message, 'error');
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
