/* =========================
   LOAD ADMIN PRICES
========================= */

async function loadCollectionPrices() {

    try {

        let response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/products?select=name,price_5ml,price_10ml,price_30ml,price_50ml,image_url,image_url,tester_image_url",
                {
                    headers: {
                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            "Bearer " +
                            SUPABASE_KEY
                    }
                }
            );


        if (!response.ok) {

            throw new Error(
                "Prices could not be loaded."
            );

        }


        let products =
            await response.json();


        let productMap = {};


        products.forEach(function(product) {

            productMap[
                product.name.trim().toLowerCase()
            ] = product;

        });


        /* =========================
           UPDATE BUTTON PRICES
        ========================= */

        document
            .querySelectorAll(".collection-product")
            .forEach(function(product) {

                let name =
                    product.querySelector("h2")
                        .textContent
                        .trim();


                let currentProduct =
                    productMap[
                        name.toLowerCase()
                    ];


                if (!currentProduct) {
                    return;
                }
              let collectionImage =
    product.querySelector(
        ".collection-image img"
    );

if (
    collectionImage &&
    currentProduct.image_url
) {

    collectionImage.src =
        currentProduct.image_url;

}


                let buttons =
                    product.querySelectorAll(
                        ".collection-size-option"
                    );


                buttons.forEach(function(button) {

                    let size =
                        button.dataset.size;


                    let price = null;


                    if (size === "5ml") {

                        price =
                            currentProduct.price_5ml;

                    }

                    else if (size === "10ml") {

                        price =
                            currentProduct.price_10ml;

                    }

                    else if (size === "30ml") {

                        price =
                            currentProduct.price_30ml;

                    }

                    else if (size === "50ml") {

                        price =
                            currentProduct.price_50ml;

                    }


                    if (price !== null) {

                        button.dataset.price =
                            price;


                        button.textContent =
                            size +
                            " - Rs. " +
                            price;

                    }

                });

            });

    }


    catch (error) {

        console.error(
            "Collection price loading error:",
            error
        );

    }

}


/* =========================
   SIZE BUTTONS
========================= */

document.querySelectorAll(
    ".collection-size-option"
).forEach(function(button) {

    button.addEventListener(
        "click",
        function() {

            let parent =
                button.parentElement;


            parent
                .querySelectorAll(
                    ".collection-size-option"
                )
                .forEach(function(item) {

                    item.classList.remove(
                        "active"
                    );

                });


            button.classList.add(
                "active"
            );

        }
    );

});


/* =========================
   SHOP BUTTON
========================= */

document.querySelectorAll(
    ".collection-shop-button"
).forEach(function(button) {

    button.addEventListener(
        "click",
        async function() {

            let product =
                button.closest(
                    ".collection-product"
                );


            let name =
                product.querySelector("h2")
                    .textContent
                    .trim();


            let selectedSize =
                product.querySelector(
                    ".collection-size-option.active"
                );


            let size =
                selectedSize.dataset.size;


            let price =
                Number(
                    selectedSize.dataset.price
                );


            /* =========================
               GET CURRENT ADMIN PRICE
            ========================= */
            let products = [];
            try {

                let response =
                    await fetch(
                        SUPABASE_URL +
                        "/rest/v1/products?name=eq." +
                        encodeURIComponent(name) +
                        "&select=name,price_5ml,price_10ml,price_30ml,price_50ml,image_url,image_url,tester_image_url",
                        {
                            method: "GET",

                            headers: {
                                "apikey":
                                    SUPABASE_KEY,

                                "Authorization":
                                    "Bearer " +
                                    SUPABASE_KEY
                            }
                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        "Product price could not be loaded."
                    );

                }


                 products =
                    await response.json();


                if (products.length > 0) {

                    let currentProduct =
                        products[0];


                    if (
                        size === "5ml" &&
                        currentProduct.price_5ml !== null
                    ) {

                        price =
                            Number(
                                currentProduct.price_5ml
                            );

                    }


                    else if (
                        size === "10ml" &&
                        currentProduct.price_10ml !== null
                    ) {

                        price =
                            Number(
                                currentProduct.price_10ml
                            );

                    }


                    else if (
                        size === "30ml" &&
                        currentProduct.price_30ml !== null
                    ) {

                        price =
                            Number(
                                currentProduct.price_30ml
                            );

                    }


                    else if (
                        size === "50ml" &&
                        currentProduct.price_50ml !== null
                    ) {

                        price =
                            Number(
                                currentProduct.price_50ml
                            );

                    }

                }


            }

            catch (error) {

                console.error(
                    "Collection price error:",
                    error
                );


                alert(
                    "Product price load nahi ho saka."
                );


                return;

            }


            /* =========================
               PRODUCT IMAGE
            ========================= */

            let image =
    product.querySelector(
        ".collection-image img"
    ).getAttribute("src");


if (
    size === "5ml" ||
    size === "10ml"
) {

    if (
        products.length > 0 &&
        products[0].tester_image_url
    ) {

        image =
            products[0].tester_image_url;

    }

}


if (
    size === "50ml" &&
    products.length > 0 &&
    products[0].image_url
) {

    image =
        products[0].image_url;

}


            /* =========================
               ADD TO CART
            ========================= */

            let productName =
                name + " - " + size;


            addToCart(
                productName,
                price,
                image
            );

        }
    );

});


/* =========================
   LOAD PRICES ON PAGE LOAD
========================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadCollectionPrices();

    }
);
