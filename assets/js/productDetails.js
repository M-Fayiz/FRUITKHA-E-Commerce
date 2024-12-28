
const reviewButton = document.getElementById('review-button');
	const reviewsSection = document.getElementById('reviews-section');
	

	reviewButton.addEventListener('click', () => {
		if (reviewsSection.style.display === 'none') {
			reviewsSection.style.display = 'block';
			reviewButton.textContent = 'Hide Reviews'; 
		} else {
			reviewsSection.style.display = 'none'; 
			reviewButton.textContent = 'Show Reviews'; 
		}
	});

		function changeImage(thumbnail) {
		
			const imageUrl = thumbnail.querySelector('img').src;
	
			
			document.getElementById('mainImage').src = imageUrl;
	
			
			document.querySelectorAll('.thumbnail').forEach(thumb => {
				thumb.classList.remove('active');
			});
			thumbnail.classList.add('active');
		}
	
		
		const mainImage = document.getElementById('mainImage');
		const mainImageContainer = document.querySelector('.main-image');
	
		mainImageContainer.addEventListener('mousemove', (e) => {
			const bounds = mainImageContainer.getBoundingClientRect();
			const x = (e.clientX - bounds.left) / bounds.width;
			const y = (e.clientY - bounds.top) / bounds.height;
			
			mainImage.style.transformOrigin = `${x * 100}% ${y * 100}%`;
			mainImage.style.transform = 'scale(1.5)';
		});
	
		mainImageContainer.addEventListener('mouseleave', () => {
			mainImage.style.transform = 'scale(1)';
		});

// pass product to cart

		function pass(productId,name,Reguler,Offer){

const quantity=document.getElementById('num').value
console.log(quantity)
			console.log('GET IN PASS DATA')
               console.log(productId,name,Reguler,quantity)

            	fetch('/addCart', {
				method: 'post',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					productId,
					name,
					Reguler,
					Offer,
					quantity
				}),
				})
				.then((res) => res.json())
				.then((data) => {
					if(data.User==false){
						location.href='/login'
					}
					if (data.success) {
					alert(data.message);
					location.href = '/cart';
					} else {
					alert(data.message);
					}
				})
				.catch((error) => {
					console.error('Error:', error);
					alert('An error occurred. Please try again later.');
				});

		}


		const wishlistIcon = document.getElementById('wishlistIcon1');

wishlistIcon.addEventListener('click', () => {
    const isInWishlist = wishlistIcon.classList.contains('bi-heart-fill') 
    const val = wishlistIcon.getAttribute('data-id'); 

    fetch('/toggleWishList', {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ val, isInWishlist }), 
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
				showToast(data.message,'success'); 
                wishlistIcon.classList.toggle('bi-heart');
                wishlistIcon.classList.toggle('bi-heart-fill');
                wishlistIcon.classList.toggle('text-danger');
                
            } else {
                showToast(data.message,'error'); 
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToat('Something went wrong!','error');
        });
});
