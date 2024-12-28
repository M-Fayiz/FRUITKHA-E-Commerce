
document.getElementById('image').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        
        const modalImage = document.getElementById('modalImage');
        modalImage.src = e.target.result;
        
       
        document.getElementById('imageModal').style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });
  
  
  document.getElementById('closeModal').addEventListener('click', function () {
    document.getElementById('imageModal').style.display = 'none';
  });
  
  // Preview Image**********************
  
  
  // List and Unlist $$$$$$$$$$$$$$$$$$$$$$$$$$
  
            function toggleItemStatus(itemId,condition){
              console.log("working")
              console.log(itemId,condition);
              fetch("/admin/categoryStatus",{
                  method:"PATCH",
                  headers:{
                      "Content-Type":"application/json; charset=UTF-8"
                  },
                  body:JSON.stringify({itemId,condition})
              })
              .then(res=> res.json())
              .then(data=>{
                if(data.success){
                
                  showToast(data.message, 'success');
                  setTimeout(()=>{
                    location.reload()
                  })
                  // alert(data.message)
                  // updateHtml(data.response)
              }else{
              
                showToast(data.message, 'error');
              }
                  
                  
                  
              })
              
            }
  // end List and Unlist $$$$$$$$$$$$$$$$$$$$$$$$$$
  
  
  
  // EDIT CATEGORY [][[[[[]]]]]
  
  document.addEventListener("DOMContentLoaded", function() {
  
  
    const editButtons = document.querySelectorAll(".edit-btn");
    const modal = document.getElementById("editModal");
    const closeUpdateModal = document.getElementById("closeUpdateModal");
    const updateButton = document.getElementById("updateButton");
  
    // Check if edit buttons are being selected
    console.log("Edit buttons:", editButtons);
  
    // Open modal for clicked item
    editButtons.forEach((button) => {
      button.addEventListener("click", function() {
        const productId = this.getAttribute("data-id");
        console.log("Edit button clicked for product ID:", productId);
  
       
      
        
        modal.style.display = "flex";
        console.log("Modal should now be visible.");
  
        document.getElementById('edit-category').addEventListener('submit', (e) => {
      e.preventDefault(); // Prevent default form submission
      
      const modalTitle = document.getElementById("modalTitle").value.trim();
      const modalDescription = document.getElementById("modalDescription").value.trim();
      
      
      const imageFile = document.getElementById('modalImageInput').files[0];
  
      // Only show an alert if the title or description fields are non-empty and contain invalid characters
      if ((modalTitle && !modalTitle.match(/^[A-Za-z ]+$/)) || 
          (modalDescription && !modalDescription.match(/^[A-Za-z ]+$/))) {
          alert("Title and Description should contain only letters and spaces.");
          return; // Stop execution if validation fails
      }
      const formData = new FormData();
  
      if (modalTitle) {
          formData.append('modalTitle', modalTitle);
      }
      if (modalDescription) {
          formData.append('modalDescription', modalDescription);
      }
      
      if (imageFile) {
          formData.append('image', imageFile);
      }
  formData.append('productId', productId);
  console.log('nbnm');
  
  fetch('/admin/EditCategory', {
    method: "PATCH",
    body: formData,
  })
    .then(res => res.json())
    .then(data => {
      console.log(data)
      if(data.success){
        showToast(data.message,'success');
        // alert(data.message)
                 setTimeout(()=>{
                  location.reload()
                })
              }else{
                showToast(data.message, 'error');
                // alert(data.message)
              }
    })
    .catch(error => console.error('Error:', error));
  
  
        })
      });
    });
  
    closeUpdateModal.addEventListener("click", function() {
      modal.style.display = "none";
      console.log("Modal closed.");
    });
  
    updateButton.addEventListener("click", function() {
      console.log("Update button clicked.");
      // Add your update logic here
      modal.style.display = "none";
    });
  
  
    window.addEventListener("click", function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
        console.log("Modal closed by clicking outside.");
      }
    });
  })
  
  
  // End Edit Category [[[[[[[[[[]]]]]]]]]]
  
  
  //####### ADDDD CATEGORY
  
      document.getElementById('form-category').addEventListener('submit',(e)=>{
       console.log('add Category')
       e.preventDefault()
       const title = document.getElementById('title').value.trim();
       const discription = document.getElementById('discr').value.trim();
  
  
       if (!title.match(/^[A-Za-z ]+$/) || !discription.match(/^[A-Za-z ]+$/)) {
     
         showToast("Name  and Discriotion should contain only letters and spaces.",'info') 
      
      return;
    }
       const formData=new FormData()
       formData.append('title',document.getElementById('title').value.trim())
       formData.append('discription',document.getElementById('discr').value.trim())
      
       formData.append('image',document.getElementById('image').files[0])
    
  
  
       
       
       
           try {
           fetch('/admin/addCategory',{
            method:'post',
            body:formData
           }).then(res=>res.json())
           .then(data=>{
           
            if(data.success){
              // alert(data.message)
              console.log(data)
              showToast(data.message, 'success');
                 setTimeout(()=>{
                  location.reload()
                 })
              }else{
                // alert(data.message)
                console.log(data)
                showToast(data.message, 'error');
              }
              })
        
           } catch (error) {
           console.log(error.message);
           
           }
    
      })
     
  