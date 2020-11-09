// custom-bundle.js for interaction in bundle-form.liquid
const pagePath = location.pathname;

/** handler for bundle item selection on bundle product page */
const bundleSelectHandler = ()=>{
    /** Product page - custom JS code for bundling */
    try{
        const bundleForm = document.getElementById('bundle-form');    
        const selects = bundleForm.getElementsByTagName("select");
        const addToCartButton = document.querySelector('.product-form__add-to-cart');
        const bundlePrice = document.getElementById('bundle-price-container');
        /** Loop through the selected options to make sure all are non-empty */
        for(let select of selects){
            select.addEventListener('change', e => {
                let allSelected = true;
                // check whether all fields are selected by user with non-empty values
                for(let select of selects){
                    // any select field that has value empty?
                    if(!select.value) 
                        allSelected = false;
                }
                // enable or disable Add to Cart button depending on whether all fields are selected
                addToCartButton.setAttribute('aria-disabled', !allSelected);
            });
        }
        
        /** Handle form submission */
        bundleForm.addEventListener("submit", e => {
            e.preventDefault();
            const bundleId = bundleForm.getAttribute('data_bundle_id');
            // initiate data for form submission
            data = {
                "items": [
                    {
                        "id": bundleId,
                        "quantity": 1,
                        "properties": {
                            "bundle": "yes"
                        }
                    }
                ]
            }
            // append the line items of the bundle into data
            let bundleItemCount = 0;
            for(let select of selects) {
                let variantId = select.value;
                let quantity = 1;
                data["items"].push({
                    "id": variantId,
                    "quantity": quantity,
                    "properties": {
                        "bundle-item": "yes"
                    }
                });
                let bundleItemId = 'bundle-item-' + bundleItemCount+'-variant-id';
                data["items"][0]["properties"][bundleItemId] = variantId;
                bundleItemCount += 1;
            }
            
            console.log(JSON.stringify(data));
            // check MDN's reference on using fetch for POST: 
            // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
            fetch('/cart/add.js', {
                method: 'POST',
                body: JSON.stringify(data),
                credentials: 'same-origin', // include, *same-origin, omit
                headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                redirect: 'follow', // manual, *follow, error
            })
            .then( res => {
                // console.log(res);
                // redirect customer to cart to view the bundle
                window.location.href="/cart";
            })
            .catch(err => {
                console.error(err);
            });

        })


    } catch(err){
        console.error(err);
    }

}



/** for Cart stage */
const cartBundleRemoveHandler = () => {
    try{
        const removeLinks = document.getElementsByClassName('cart__remove');
        for(let link of removeLinks ){
            link.addEventListener('click', (e) => {
                e.preventDefault();
                // loop through the variant IDs to submit to /cart/update.js for removal
                variantIds = link.getAttribute('arial-data').split(',');
                data = {
                    "updates": {}
                }
                // construct the POST request body for removing items at /cart/update.js:
                // https://shopify.dev/docs/themes/ajax-api/reference/cart#post-cart-update-js
                variantIds.forEach(variantId => data["updates"][variantId] = "0");
    
                fetch('/cart/update.js', {
                    method: 'POST',
                    body: JSON.stringify(data),
                    credentials: 'same-origin', // include, *same-origin, omit
                    headers: {
                      'Content-Type': 'application/json'
                      // 'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    redirect: 'follow', // manual, *follow, error
                })
                .then( res => {
                    // console.log(res);
                    // refresh cart page after removal is completed
                    window.location.href="/cart";
                })
                .catch(err => {
                    console.error(err);
                });
            });
        }
    } catch(err) {
        console.log(err);
    }
}


// Depending on which page the customer is, run the required custom code
if(pagePath.includes('/collections/bundles/products/') ){
    bundleSelectHandler();
} else if (pagePath.includes('/cart')){
    cartBundleRemoveHandler();
}