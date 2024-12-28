
document.getElementById('applyFiltersBtn').addEventListener('click', async function() {
    await handleSearch();
});

async function handleSearch() {
    const query = document.getElementById('search-input').value.trim();
    const categories = document.querySelectorAll(".form-check-input");
    const sortBy = document.getElementById("sortBy");
    const priceRange = document.getElementById("priceRange");

    console.log('query', query);

    const selectedCategories = Array.from(categories)
        .filter((checkbox) => checkbox.checked) 
        .map((checkbox) => checkbox.value);

    console.log('selectedCategories:', selectedCategories);

    const selectedSortBy = sortBy.value;
    console.log('selectedSortBy:', selectedSortBy);

   
    let params = new URLSearchParams();

    
    if (query) {
        params.append('search', query);
    }

    if (selectedCategories.length > 0) {
        params.append('selectedCategories', selectedCategories.join(','));
    }

    if (priceRange) {
        params.append('priceRange', priceRange.value);
    }

    if (selectedSortBy) {
        params.append('sortOrder', selectedSortBy);
    }

   
    const url = `/search?${params.toString()}`;

    try {
       
        const response = await fetch(url);
        const products = await response.json(); 

        console.log(products);
        if (!products.length) {
            return displayNoProduct();
        }
        displayProduct(products);
    } catch (error) {
        console.error('Error fetching search results:', error);
        document.querySelector('.product-lists').innerHTML = '<p>Error fetching search results.</p>';
    }
}



async function fetchAllproduct() {
	console.log('fetch');
	
    try {
        const response = await fetch('/ALL');
		console.log('respo',response);
		
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const products = await response.json();
        displayProduct(products.products);

    } catch (error) {
        console.error('Error fetching products:', error.message);
        document.querySelector('.product-lists').innerHTML = '<p>Error fetching all products.</p>';
    }
}

function displayProduct(products) {
	console.log('produc',products);
	
    const productList = document.querySelector('.product-lists');
    if (products.length === 0) {
        productList.innerHTML = '<h4 style="color:grey;">No products found.</h4>';
        return;
    }

    productList.innerHTML = products.map(item => `
        <div class="col-md-4 product-item" style=' overflow: hidden;'>
			
		  
            <div class="single-product-item">
                <div style="width: 280px;" class="product-image">
                    <a href="/product/${item._id}">
                        <img src="http://localhost:4000/images/${item.primaryImage}" alt="${item.productTitle}">
                        ${item.OfferPrice > 0 ? `<div style="position: absolute; top: 5px; left: 5px; background-color: green; border-radius: 2px; padding: 5px;">
                            <span style="color: rgb(255, 255, 255); font-weight: 600;">${Math.round(((item.RegulerPrice - item.OfferPrice) / item.RegulerPrice) * 100)}% OFF</span>
                        </div>` : ''}
                    </a>
                </div>
                <div style="display: flex; flex-direction: column;margin-left: 15px; margin-right: 15px;">
                    <h3>${item.productTitle}</h3>
                    <div style='display flex';>
                        ${item.OfferPrice ? `<p style="color: gray;">Per Kg <del>${item.RegulerPrice}</del>₹</p>
                        <h3 style="color: green;">Offer: ${item.OfferPrice} ₹</h3>` 
                        : `<p>Per Kg ${item.RegulerPrice}₹</p>`}
                    </div>
                    <div>
                        ${item.Stock > 10 ? `<span class="inline-block px-3 py-2 text-xs bg-green-100 text-green-800 rounded">In Stock: ${item.Stock}</span>` :
                        item.Stock > 0 ? `<span class="inline-block px-3 py-2 text-xs bg-yellow-100 text-yellow-800 rounded">Low Stock: ${item.Stock}</span>` :
                        `<span class="inline-block px-3 py-2 text-xs bg-red-100 text-red-800 rounded">Out of Stock</span>`}
                    </div>
                </div>
                <div>
                    <a href="cart.html" class="cart-btn">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

function displayNoProduct(){

	const productList = document.querySelector('.product-lists');
	productList.innerHTML =" <h4 style='color:grey; margin-left:50px;' >No products found.</h4>"

}




const sidebar = document.getElementById('sidebar');
		const overlay = document.getElementById('overlay');
		const sidebarToggle = document.getElementById('sidebarToggle');
		const closeBtn = document.getElementById('closeBtn');
		const priceRange = document.getElementById('priceRange');
		const priceValue = document.getElementById('priceValue');
	
		
		function toggleSidebar() {
			sidebar.classList.toggle('active');
			overlay.classList.toggle('active');
			sidebarToggle.classList.toggle('hidden');
		}
	
		
		sidebarToggle.addEventListener('click', toggleSidebar);
		closeBtn.addEventListener('click', toggleSidebar);
		overlay.addEventListener('click', toggleSidebar);
	
		
		priceRange.addEventListener('input', (e) => {
			priceValue.textContent = `₹${e.target.value}`;
		});

/////////////|| ADD TO CART ||///////////////////////

function pass(productId,name,Reguler,Offer){
	console.log(productId,name,Reguler,Offer)

	fetch('/addCart',{
		method:'post',
		headers:{
			'Content-Type':'application/json'
		},
		body:JSON.stringify({
			productId,name,Reguler,Offer
		})
	}).then(res=>res.json())
	.then(data=>{
		if(data.login==false){
			location.href='/login'
		}
		if(data.success){
			showToast(data.message,'success')
		}else{
			showToast(data.message,'error')
		}
		
	})
}


function wishList(val){

	const wishlistIcon = document.getElementById('wishlistIcon1');


	console.log('po')
    const isInWishlist = wishlistIcon.classList.contains('bi-heart-fill') 
    // const val = wishlistIcon.getAttribute('data-id'); 

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
                location.reload()
            } else {
                showToast(data.message,'error'); 
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToat('Something went wrong!','error');
        });


}