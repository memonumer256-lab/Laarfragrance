/* =========================================================
   LAAR FRAGRANCE - MAIN SCRIPT
========================================================= */


/* =========================================================
   SECURITY HELPERS
   Makes user-written text safe before showing on the page
========================================================= */

function escapeHTML(text) {

    return String(text ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

}


function safeImageURL(url) {

    let value = String(url ?? "").trim();

    /* Block only dangerous links (javascript:, vbscript:, non-image data:) */
    if (
        /^\s*(javascript|vbscript)\s*:/i.test(value) ||
        (
            /^\s*data\s*:/i.test(value) &&
            !/^\s*data\s*:\s*image\//i.test(value)
        )
    ) {

        return "";

    }

    return escapeHTML(value);

}


/* =========================================================
   SUPABASE CONFIG
========================================================= */

const SUPABASE_URL =
    "https://emworxswydgeebwjshoj.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_PGZcWNslHusFmxHSGI-eLg_jqGKar3h";


/* =========================================================
   CART
========================================================= */

let cart =
    JSON.parse(
        localStorage.getItem("laarCart")
    ) || [];


function saveCart() {

    localStorage.setItem(
        "laarCart",
        JSON.stringify(cart)
    );

}


function openCart() {

    let cartPanel =
        document.getElementById("cartPanel");

    if (!cartPanel) {
        return;
    }

    cartPanel.classList.add("active");

    showCart();

}


function closeCart() {

    let cartPanel =
        document.getElementById("cartPanel");

    if (!cartPanel) {
        return;
    }

    cartPanel.classList.remove("active");

}


function addToCart(
    name,
    price,
    image
) {

    let size = "50ml";


    let existingItem =
        cart.find(function(item) {

            return (
                item.name === name &&
                item.size === size
            );

        });


    if (existingItem) {

        existingItem.quantity++;

    } else {

        cart.push({

            name: name,

            price: price,

            size: size,

            quantity: 1,

            image: image || ""

        });

    }


    saveCart();

    openCart();

}

function increaseQuantity(name, size) {

    let item =
        cart.find(function(item) {

            return (
                item.name === name &&
                item.size === size
            );

        });


    if (item) {

        item.quantity++;

    }


    saveCart();

    showCart();

    renderCartPage();

}


function decreaseQuantity(name, size) {

    let item =
        cart.find(function(item) {

            return (
                item.name === name &&
                item.size === size
            );

        });


    if (item) {

        item.quantity--;


        if (item.quantity <= 0) {

            cart =
                cart.filter(function(product) {

                    return !(
                        product.name === name &&
                        product.size === size
                    );

                });

        }

    }


    saveCart();

    showCart();

    renderCartPage();

}


function getCartItemImage(item) {

    if (item.image) {

        return item.image;

    }


    return "";

}


function showCart() {

    let cartItems =
        document.getElementById("cartItems");

    let cartTotal =
        document.getElementById("cartTotal");


    if (!cartItems || !cartTotal) {

        return;

    }


    if (cart.length === 0) {

        cartItems.innerHTML =
            "<p>Your cart is empty.</p>";

        cartTotal.innerHTML = "";

        return;

    }


    cartItems.innerHTML = "";

    let total = 0;


    cart.forEach(function(item) {

        let itemTotal =
            item.price * item.quantity;

        total += itemTotal;


        let image =
            getCartItemImage(item);


        cartItems.innerHTML += `

            <div class="cart-item">

                <img
                    src="${safeImageURL(image)}"
                    alt="${escapeHTML(item.name)}"
                    class="cart-item-image"
                >

                <div>

                    <h3>
    ${escapeHTML(item.name)}${item.name.includes(" - ") ? "" : " — " + escapeHTML(item.size || "50ml")}
</h3>

                    <p>
                        Rs. ${escapeHTML(item.price)} × ${escapeHTML(item.quantity)}
                    </p>

                    <div class="quantity-controls">

                        <button
                            onclick="decreaseQuantity('${item.name}', '${escapeHTML(item.size)}')">
                            −
                        </button>

                        <span>
                            ${escapeHTML(item.quantity)}
                        </span>

                        <button
                            onclick="increaseQuantity('${item.name}', '${escapeHTML(item.size)}')">
                            +
                        </button>

                    </div>

                </div>

            </div>

        `;

    });


    cartTotal.innerHTML = `

        <h3>
            Total: Rs. ${total}
        </h3>

    `;

}


function renderCartPage() {

    let cartItems =
        document.getElementById("cartPageItems");

    let cartTotal =
        document.getElementById("cartPageTotal");


    if (!cartItems || !cartTotal) {

        return;

    }


    if (cart.length === 0) {

        cartItems.innerHTML =
            "<p>Your cart is empty.</p>";

        cartTotal.innerHTML = "";

        return;

    }


    cartItems.innerHTML = "";

    let total = 0;


    cart.forEach(function(item) {

        let itemTotal =
            item.price * item.quantity;

        total += itemTotal;


        cartItems.innerHTML += `

            <div class="cart-page-item">

                <img
                    src="${safeImageURL(item.image || getCartItemImage(item))}"
                    alt="${escapeHTML(item.name)}"
                    class="cart-page-item-image"
                >

                <h3>
                    ${escapeHTML(item.name)}${item.name.includes(" - ") ? "" : " — " + escapeHTML(item.size || "50ml")}
                </h3>

                <p>
                    Rs. ${escapeHTML(item.price)}
                </p>

                <div class="quantity-controls">

                    <button
                        onclick="decreaseQuantity('${item.name}', '${escapeHTML(item.size)}')">
                        −
                    </button>

                    <span>
                        ${escapeHTML(item.quantity)}
                    </span>

                    <button
                        onclick="increaseQuantity('${item.name}', '${escapeHTML(item.size)}')">
                        +
                    </button>

                </div>

                <p>
                    Item Total: Rs. ${itemTotal}
                </p>

            </div>

        `;

    });


    cartTotal.innerHTML = `

        <h2>
            Total: Rs. ${total}
        </h2>

    `;

}


function addTesterToCart(
    name,
    button
) {

    if (!button) {
        return;
    }


    let selectedSize =
        button.parentElement.querySelector(
            ".size-option.active"
        );


    if (!selectedSize) {

        alert(
            "Please select a size first."
        );

        return;

    }


    let size =
        selectedSize.dataset.size;


    /* =========================
       DEFAULT HTML PRICE
       349 / 549
    ========================= */

    let price =
        Number(
            selectedSize.dataset.price
        );


    /* =========================
       GET CURRENT PRICE
       FROM SUPABASE
    ========================= */

    fetch(
        SUPABASE_URL +
        "/rest/v1/products?name=eq." +
        encodeURIComponent(name) +
        "&select=name,price_5ml,price_10ml,tester_image_url",
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
    )
    .then(function(response) {

        if (!response.ok) {

            throw new Error(
                "Product price could not be loaded."
            );

        }

        return response.json();

    })
    .then(function(products) {

        /* =========================
           USE ADMIN SAVED PRICE
        ========================= */

        if (
            products.length > 0
        ) {

            let product =
                products[0];


            if (
                size === "5ml" &&
                product.price_5ml !== null
            ) {

                price =
                    Number(
                        product.price_5ml
                    );

            }


            if (
                size === "10ml" &&
                product.price_10ml !== null
            ) {

                price =
                    Number(
                        product.price_10ml
                    );

            }

        }


        /* =========================
           TESTER IMAGE
        ========================= */

        let testerImage = "";




        /* =========================
           USE SAME IMAGE AS TESTER CARD
           (Supabase tester_image_url)
        ========================= */

        let cardImage = "";

        let testerCard =
            button.closest(".tester-card");

        if (testerCard) {

            let cardImg =
                testerCard.querySelector("img");

            if (cardImg) {

                cardImage =
                    cardImg.getAttribute("src") || "";

            }

        }


        if (
            products.length > 0 &&
            products[0].tester_image_url
        ) {

            testerImage =
                products[0].tester_image_url;

        }

        else if (cardImage) {

            testerImage =
                cardImage;

        }


        /* =========================
           ADD TO CART
        ========================= */

        let existingItem =
            cart.find(function(item) {

                return (
                    item.name === name &&
                    item.size === size
                );

            });


        if (existingItem) {

            existingItem.quantity++;

        }

        else {

            cart.push({

                name:
                    name,

                price:
                    price,

                size:
                    size,

                quantity:
                    1,

                image:
                    testerImage

            });

        }


        saveCart();

        openCart();

    })
    .catch(function(error) {

        console.error(
            "Tester price error:",
            error
        );

        alert(
            "Tester price load nahi ho saka.\n\n" +
            error.message
        );

    });

}


/* =========================================================
   SIZE OPTIONS
========================================================= */

document
    .querySelectorAll(".size-option")
    .forEach(function(button) {

        button.addEventListener(
            "click",
            function() {

                let parent =
                    button.parentElement;


                parent
                    .querySelectorAll(".size-option")
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


renderCartPage();


/* =========================================================
   PLACE ORDER
========================================================= */

async function placeOrder() {

    let name =
        document
            .getElementById("customerName")
            ?.value
            .trim();


    let phone =
        document
            .getElementById("customerPhone")
            ?.value
            .trim();


    let address =
        document
            .getElementById("customerAddress")
            ?.value
            .trim();


    if (cart.length === 0) {

        alert(
            "Your cart is empty."
        );

        return;

    }


    if (
        !name ||
        !phone ||
        !address
    ) {

        alert(
            "Please fill all delivery details."
        );

        return;

    }


    let total = 0;


    cart.forEach(function(item) {

        total +=
            item.price *
            item.quantity;

    });


    let order = {

        customer_name:
            name,

        customer_phone:
            phone,

        customer_address:
            address,

        products:
            cart,

        tottal:
            total,

        status:
            "Pending"

    };


    try {

        let response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/Oders",
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            "Bearer " +
                            SUPABASE_KEY,

                        "Prefer":
                            "return=minimal"

                    },

                    body:
                        JSON.stringify(order)

                }
            );


        let responseText =
            await response.text();


        if (!response.ok) {

            console.log(
                responseText
            );

            alert(
                "Order place nahi ho saka:\n\n" +
                responseText
            );

            return;

        }


        cart = [];

        saveCart();


        alert(
            "Thank you " +
            name +
            "! Your order has been placed."
        );


        renderCartPage();

    } catch (error) {

        console.log(error);

        alert(
            "ERROR: " +
            error.message
        );

    }

}


/* =========================================================
   ADMIN LOGIN
========================================================= */

async function adminLogin() {

    let email =
        document
            .getElementById("adminEmail")
            ?.value
            .trim();


    let password =
        document
            .getElementById("adminPassword")
            ?.value;


    let message =
        document.getElementById(
            "loginMessage"
        );


    if (
        !email ||
        !password
    ) {

        if (message) {

            message.innerText =
                "Please enter email and password.";

        }

        return;

    }


    try {

        let response =
            await fetch(
                SUPABASE_URL +
                "/auth/v1/token?grant_type=password",
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "apikey":
                            SUPABASE_KEY

                    },

                    body:
                        JSON.stringify({

                            email:
                                email,

                            password:
                                password

                        })

                }
            );


        let data =
            await response.json();


        if (!response.ok) {

            if (message) {

                message.innerText =
                    "Login failed.";

            }

            console.log(
                data
            );

            return;

        }


        localStorage.setItem(
            "laarAdminToken",
            data.access_token
        );


        window.location.href =
            "admin-orders.html";


    } catch (error) {

        console.log(error);

        if (message) {

            message.innerText =
                "Internet connection problem.";

        }

    }

}


/* =========================================================
   LOAD ORDERS
========================================================= */

async function loadOrders() {

    let ordersList =
        document.getElementById(
            "ordersList"
        );


    if (!ordersList) {

        return;

    }


    let token =
        localStorage.getItem(
            "laarAdminToken"
        );


    if (!token) {

        ordersList.innerHTML =
            "<p>Please login first.</p>";

        return;

    }


    try {

        let response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/Oders?select=*&order=created_at.desc",
                {
                    method: "GET",

                    headers: {

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            "Bearer " +
                            token

                    }

                }
            );


        if (!response.ok) {

            let error =
                await response.text();


            console.log(
                error
            );


            ordersList.innerHTML =
                "<p>Orders load nahi ho sake.</p>";

            return;

        }


        let orders =
            await response.json();


        if (orders.length === 0) {

            ordersList.innerHTML =
                "<p>No orders found.</p>";

            return;

        }


        ordersList.innerHTML = "";


        orders.forEach(function(order) {

            let products =
                order.products;


            if (
                typeof products ===
                "string"
            ) {

                products =
                    JSON.parse(
                        products
                    );

            }


            let productsHTML =
                "";


            products.forEach(function(item) {

                productsHTML += `

                    <div class="order-product">

                        <strong>
                            ${escapeHTML(item.name)}
                        </strong>

                        <span>
                            Quantity:
                            ${escapeHTML(item.quantity)}
                        </span>

                        <span>
                            Price:
                            Rs. ${escapeHTML(item.price)}
                        </span>

                    </div>

                `;

            });


            ordersList.innerHTML += `

                <div class="order-card">

                    <h3>
                        Order #${escapeHTML(order.id)}
                    </h3>

                    <p>
                        <strong>Date:</strong>
                        ${
                            new Date(
                                order.created_at
                            ).toLocaleString()
                        }
                    </p>

                    <p>
                        <strong>Name:</strong>
                        ${escapeHTML(order.customer_name)}
                    </p>

                    <p>
                        <strong>Phone:</strong>
                        ${escapeHTML(order.customer_phone)}
                    </p>

                    <p>
                        <strong>Address:</strong>
                        ${escapeHTML(order.customer_address)}
                    </p>

                    <div class="order-products">

                        <strong>
                            Products:
                        </strong>

                        ${productsHTML}

                    </div>

                    <p>
                        <strong>Total:</strong>
                        Rs. ${escapeHTML(order.tottal)}
                    </p>

                    <p>

                        <strong>
                            Status:
                        </strong>

                        <select
                            onchange="
                                updateOrderStatus(
                                    ${Number(order.id)},
                                    this.value
                                )
                            "
                        >

                            <option
                                value="Pending"
                                ${
                                    order.status ===
                                    "Pending"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Pending
                            </option>

                            <option
                                value="Confirmed"
                                ${
                                    order.status ===
                                    "Confirmed"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Confirmed
                            </option>

                            <option
                                value="Shipped"
                                ${
                                    order.status ===
                                    "Shipped"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Shipped
                            </option>

                            <option
                                value="Delivered"
                                ${
                                    order.status ===
                                    "Delivered"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Delivered
                            </option>

                        </select>

                    </p>

                </div>

            `;

        });


    } catch (error) {

        console.log(error);

        ordersList.innerHTML =
            "<p>Internet connection problem.</p>";

    }

}


loadOrders();


/* =========================================================
   ADMIN LOGOUT
========================================================= */

function adminLogout() {

    localStorage.removeItem(
        "laarAdminToken"
    );


    window.location.href =
        "admin.html";

}


/* =========================================================
   UPDATE ORDER STATUS
========================================================= */

async function updateOrderStatus(
    orderId,
    newStatus
) {

    let token =
        localStorage.getItem(
            "laarAdminToken"
        );


    if (!token) {

        alert(
            "Please login first."
        );

        return;

    }


    try {

        let response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/Oders?id=eq." +
                orderId,
                {
                    method: "PATCH",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            "Bearer " +
                            token,

                        "Prefer":
                            "return=minimal"

                    },

                    body:
                        JSON.stringify({

                            status:
                                newStatus

                        })

                }
            );


        if (!response.ok) {

            alert(
                "Status update nahi ho saka."
            );

            return;

        }


        alert(
            "Order status updated."
        );


        loadOrders();


    } catch (error) {

        console.log(error);

        alert(
            "Internet connection problem."
        );

    }

}


/* =========================================================
   IMAGE POPUP
========================================================= */

function openImagePopup(
    imageSrc,
    imageAlt
) {

    let popup =
        document.getElementById(
            "imagePopup"
        );


    let popupImage =
        document.getElementById(
            "popupImage"
        );


    if (
        !popup ||
        !popupImage
    ) {

        return;

    }


    popupImage.src =
        imageSrc;


    popupImage.alt =
        imageAlt || "";


    popup.classList.add(
        "active"
    );

}


function closeImagePopup() {

    let popup =
        document.getElementById(
            "imagePopup"
        );


    if (!popup) {

        return;

    }


    popup.classList.remove(
        "active"
    );

}


/* PRODUCT + TESTER IMAGE CLICK */

document
    .querySelectorAll(
        ".product-card img, .tester-card img"
    )
    .forEach(function(image) {

        image.addEventListener(
            "click",
            function() {

                openImagePopup(
                    image.src,
                    image.alt
                );

            }
        );

    });


/* CLOSE POPUP BACKGROUND */

let imagePopup =
    document.getElementById(
        "imagePopup"
    );


if (imagePopup) {

    imagePopup.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                this
            ) {

                closeImagePopup();

            }

        }
    );

}


/* =========================================================
   CUSTOMER REVIEWS
========================================================= */

let selectedReviewRating = 0;


/* RATING STARS */

document
    .querySelectorAll(
        ".rating-star"
    )
    .forEach(function(star) {

        star.addEventListener(
            "click",
            function() {

                selectedReviewRating =
                    Number(
                        this.dataset.rating
                    );


                document
                    .querySelectorAll(
                        ".rating-star"
                    )
                    .forEach(function(item) {

                        let rating =
                            Number(
                                item.dataset.rating
                            );


                        if (
                            rating <=
                            selectedReviewRating
                        ) {

                            item.classList.add(
                                "active"
                            );

                        } else {

                            item.classList.remove(
                                "active"
                            );

                        }

                    });

            }
        );

    });


/* LOAD APPROVED REVIEWS */

async function loadReviews() {

    let reviewsList =
        document.getElementById(
            "reviewsList"
        );


    if (!reviewsList) {

        return;

    }


    try {

        let response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/review?select=id,name,perfume,rating,comment,created_at&status=eq.approved&order=created_at.desc",
                {
                    method: "GET",

                    headers: {

                        "apikey":
                            SUPABASE_KEY

                    }

                }
            );


        if (!response.ok) {

            let error =
                await response.text();


            console.log(
                error
            );


            reviewsList.innerHTML =
                "<p>Reviews load nahi ho sake: " +
                escapeHTML(error) +
                "</p>";

            return;

        }


        let reviews =
            await response.json();


        if (
            reviews.length ===
            0
        ) {

            reviewsList.innerHTML =
                "<p class='reviews-loading'>Be the first to share your experience.</p>";

            return;

        }


        reviewsList.innerHTML =
            "";


        reviews.forEach(function(review) {

            let stars =
                "";


            for (
                let i = 1;
                i <= 5;
                i++
            ) {

                stars +=
                    i <= review.rating
                        ? "★"
                        : "☆";

            }


            reviewsList.innerHTML += `

                <div class="review-card">

                    <div class="review-stars">
                        ${stars}
                    </div>

                    <h3>
                        ${escapeHTML(review.name)}
                    </h3>

                    <div class="review-perfume">
                        ${escapeHTML(review.perfume)}
                    </div>

                    <p class="review-comment">
                        ${escapeHTML(review.comment)}
                    </p>

                </div>

            `;

        });


    } catch (error) {

        console.log(error);

        reviewsList.innerHTML =
            "<p>Internet connection problem.</p>";

    }

}


loadReviews();


/* SUBMIT REVIEW */

async function submitReview() {

    let name =
        document
            .getElementById(
                "reviewName"
            )
            ?.value
            .trim();


    let perfume =
        document
            .getElementById(
                "reviewPerfume"
            )
            ?.value;


    let comment =
        document
            .getElementById(
                "reviewComment"
            )
            ?.value
            .trim();


    let message =
        document.getElementById(
            "reviewMessage"
        );


    if (!message) {

        return;

    }


    if (!name) {

        message.innerText =
            "Please enter your name.";

        return;

    }


    if (!perfume) {

        message.innerText =
            "Please select a perfume.";

        return;

    }


    if (
        selectedReviewRating === 0
    ) {

        message.innerText =
            "Please select a rating.";

        return;

    }


    if (!comment) {

        message.innerText =
            "Please write your review.";

        return;

    }


    try {

        let response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/review",
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            "Bearer " +
                            SUPABASE_KEY,

                        "Prefer":
                            "return=minimal"

                    },

                    body:
                        JSON.stringify({

                            name:
                                name,

                            perfume:
                                perfume,

                            rating:
                                selectedReviewRating,

                            comment:
                                comment

                        })

                }
            );


        if (!response.ok) {

            let error =
                await response.text();


            console.log(
                error
            );


            message.innerText =
                "Review submit nahi ho saka: " +
                error;

            return;

        }


        message.innerText =
            "Thank you! Your review has been submitted for approval.";


        let reviewName =
            document.getElementById(
                "reviewName"
            );


        let reviewPerfume =
            document.getElementById(
                "reviewPerfume"
            );


        let reviewComment =
            document.getElementById(
                "reviewComment"
            );


        if (reviewName) {

            reviewName.value =
                "";

        }


        if (reviewPerfume) {

            reviewPerfume.value =
                "";

        }


        if (reviewComment) {

            reviewComment.value =
                "";

        }


        selectedReviewRating =
            0;


        document
            .querySelectorAll(
                ".rating-star"
            )
            .forEach(function(star) {

                star.classList.remove(
                    "active"
                );

            });


    } catch (error) {

        console.log(error);

        message.innerText =
            "Review submit nahi ho saka: " +
            error;

    }

}


/* DELETE REVIEW */

async function deleteReview(
    reviewId
) {

    let token =
        localStorage.getItem(
            "laarAdminToken"
        );


    if (!token) {

        alert(
            "Please login first."
        );

        return;

    }


    let confirmDelete =
        confirm(
            "Kya aap is review ko permanently delete karna chahte hain?"
        );


    if (!confirmDelete) {

        return;

    }


    try {

        let response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/review?id=eq." +
                reviewId,
                {
                    method: "DELETE",

                    headers: {

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            "Bearer " +
                            token,

                        "Prefer":
                            "return=minimal"

                    }

                }
            );


        if (!response.ok) {

            let error =
                await response.text();


            console.log(
                error
            );


            alert(
                "Review delete nahi ho saka:\n\n" +
                error
            );

            return;

        }


        alert(
            "Review permanently delete ho gaya."
        );


        loadAdminReviews();


    } catch (error) {

        console.log(error);

        alert(
            "Internet connection problem."
        );

    }

}


/* =========================================================
   ADMIN CUSTOMER REVIEWS
========================================================= */

async function loadAdminReviews() {

    let reviewsList =
        document.getElementById(
            "adminReviewsList"
        );


    if (!reviewsList) {

        return;

    }


    let token =
        localStorage.getItem(
            "laarAdminToken"
        );


    if (!token) {

        reviewsList.innerHTML =
            "<p>Please login first.</p>";

        return;

    }


    try {

        let response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/review?select=*&order=created_at.desc",
                {
                    method: "GET",

                    headers: {

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            "Bearer " +
                            token

                    }

                }
            );


        if (!response.ok) {

            let error =
                await response.text();


            console.log(
                error
            );


            reviewsList.innerHTML =
                "<p>Reviews load nahi ho sake: " +
                escapeHTML(error) +
                "</p>";

            return;

        }


        let reviews =
            await response.json();


        if (
            reviews.length ===
            0
        ) {

            reviewsList.innerHTML =
                "<p>No reviews found.</p>";

            return;

        }


        reviewsList.innerHTML =
            "";


        reviews.forEach(function(review) {

            let stars =
                "";


            for (
                let i = 1;
                i <= 5;
                i++
            ) {

                stars +=
                    i <= review.rating
                        ? "★"
                        : "☆";

            }


            let statusClass =
                review.status ===
                "approved"
                    ? "review-approved"
                    : review.status ===
                      "rejected"
                    ? "review-rejected"
                    : "review-pending";


            reviewsList.innerHTML += `

                <div class="admin-review-card">

                    <div class="review-stars">
                        ${stars}
                    </div>

                    <h3>
                        ${escapeHTML(review.name)}
                    </h3>

                    <p>
                        <strong>
                            Perfume:
                        </strong>

                        ${escapeHTML(review.perfume)}
                    </p>

                    <p>
                        <strong>
                            Review:
                        </strong>

                        ${escapeHTML(review.comment)}
                    </p>

                    <p>

                        <strong>
                            Status:
                        </strong>

                        <span
                            class="${statusClass}"
                        >
                            ${escapeHTML(review.status)}
                        </span>

                    </p>

                    <div class="review-admin-buttons">

                        <button
                            type="button"
                            onclick="
                                updateReviewStatus(
                                    ${Number(review.id)},
                                    'approved'
                                )
                            "
                        >
                            APPROVE
                        </button>

                        <button
                            type="button"
                            onclick="
                                updateReviewStatus(
                                    ${Number(review.id)},
                                    'rejected'
                                )
                            "
                        >
                            REJECT
                        </button>

                        <button
                            type="button"
                            onclick="
                                deleteReview(
                                    ${Number(review.id)}
                                )
                            "
                        >
                            DELETE
                        </button>

                    </div>

                </div>

            `;

        });


    } catch (error) {

        console.log(error);

        reviewsList.innerHTML =
            "<p>Internet connection problem.</p>";

    }

}


async function updateReviewStatus(
    reviewId,
    newStatus
) {

    let token =
        localStorage.getItem(
            "laarAdminToken"
        );


    if (!token) {

        alert(
            "Please login first."
        );

        return;

    }


    try {

        let response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/review?id=eq." +
                reviewId,
                {
                    method: "PATCH",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            "Bearer " +
                            token,

                        "Prefer":
                            "return=minimal"

                    },

                    body:
                        JSON.stringify({

                            status:
                                newStatus

                        })

                }
            );


        if (!response.ok) {

            let error =
                await response.text();


            console.log(
                error
            );


            alert(
                "Review status update nahi ho saka:\n\n" +
                error
            );

            return;

        }


        alert(
            "Review " +
            newStatus +
            " ho gaya."
        );


        loadAdminReviews();


    } catch (error) {

        console.log(error);

        alert(
            "Internet connection problem."
        );

    }

}


loadAdminReviews();


/* =========================================================
   ADMIN BLOG MANAGEMENT
========================================================= */


/* LOAD ADMIN BLOGS */

async function loadAdminBlogs() {

    let blogList =
        document.getElementById(
            "adminBlogList"
        );


    if (!blogList) {

        return;

    }


    let token =
        localStorage.getItem(
            "laarAdminToken"
        );


    if (!token) {

        blogList.innerHTML =
            "<p>Please login first.</p>";

        return;

    }


    try {

        let response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/blog?select=*&order=created_at.desc",
                {
                    method: "GET",

                    headers: {

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            "Bearer " +
                            token

                    }

                }
            );


        if (!response.ok) {

            let error =
                await response.text();


            console.log(
                error
            );


            blogList.innerHTML =
                "<p>Articles load nahi ho sake.</p>";

            return;

        }


        let blogs =
            await response.json();


        if (
            blogs.length ===
            0
        ) {

            blogList.innerHTML =
                "<p>No articles found.</p>";

            return;

        }


        blogList.innerHTML =
            "";


        blogs.forEach(function(blog) {

            let statusClass =
                blog.status ===
                "published"
                    ? "blog-published"
                    : "blog-draft";


            blogList.innerHTML += `

                <div class="admin-blog-card">

                    ${
                        blog.image_url
                            ? `
                                <img
                                    src="${safeImageURL(blog.image_url)}"
                                    alt="${escapeHTML(blog.title)}"
                                    class="admin-blog-image"
                                >
                              `
                            : ""
                    }

                    <h3>
                        ${escapeHTML(blog.title)}
                    </h3>

                    <p>
                        <strong>
                            Category:
                        </strong>

                        ${escapeHTML(blog.category)}
                    </p>

                    <p>
                        ${escapeHTML(blog.excerpt)}
                    </p>

                    <p>

                        <strong>
                            Status:
                        </strong>

                        <span
                            class="${statusClass}"
                        >
                            ${escapeHTML(blog.status)}
                        </span>

                    </p>

                    <div class="blog-admin-buttons">

                        <button
                            type="button"
                            onclick="
                                editBlogArticle(
                                    ${Number(blog.id)}
                                )
                            "
                        >
                            EDIT
                        </button>

                        <button
                            type="button"
                            onclick="
                                toggleBlogStatus(
                                    ${Number(blog.id)},
                                    '${blog.status === "published" ? "published" : "draft"}'
                                )
                            "
                        >
                            ${
                                blog.status ===
                                "published"
                                    ? "UNPUBLISH"
                                    : "PUBLISH"
                            }
                        </button>

                        <button
                            type="button"
                            onclick="
                                deleteBlogArticle(
                                    ${Number(blog.id)}
                                )
                            "
                        >
                            DELETE
                        </button>

                    </div>

                </div>

            `;

        });


    } catch (error) {

        console.log(error);

        blogList.innerHTML =
            "<p>Internet connection problem.</p>";

    }

}


/* =========================================================
   BLOG IMAGE UPLOAD
========================================================= */

async function uploadBlogImage(
    file,
    token
) {

    if (!file) {

        return null;

    }


    let allowedTypes = [

        "image/jpeg",

        "image/png",

        "image/webp"

    ];


    if (
        !allowedTypes.includes(
            file.type
        )
    ) {

        alert(
            "Sirf JPG, PNG aur WEBP images allowed hain."
        );

        return null;

    }


    if (
        file.size >
        5 * 1024 * 1024
    ) {

        alert(
            "Image 5 MB se choti honi chahiye."
        );

        return null;

    }


    let extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();


    let fileName =
        "blog-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 8) +
        "." +
        extension;


    let uploadResponse =
        await fetch(
            SUPABASE_URL +
            "/storage/v1/object/blog-images/" +
            fileName,
            {
                method: "POST",

                headers: {

                    "apikey":
                        SUPABASE_KEY,

                    "Authorization":
                        "Bearer " +
                        token,

                    "Content-Type":
                        file.type,

                    "x-upsert":
                        "false"

                },

                body:
                    file

            }
        );


    if (!uploadResponse.ok) {

        let error =
            await uploadResponse.text();


        console.log(
            "Image upload error:",
            error
        );


        alert(
            "Image upload nahi ho saki:\n\n" +
            error
        );


        return null;

    }


    return (
        SUPABASE_URL +
        "/storage/v1/object/public/blog-images/" +
        fileName
    );

}


/* =========================================================
   SAVE / UPDATE BLOG ARTICLE
========================================================= */

async function saveBlogArticle() {

    let token =
        localStorage.getItem(
            "laarAdminToken"
        );


    if (!token) {

        alert(
            "Please login first."
        );

        return;

    }


    let id =
        document
            .getElementById(
                "blogId"
            )
            .value;


    let title =
        document
            .getElementById(
                "blogTitle"
            )
            .value
            .trim();


    let category =
        document
            .getElementById(
                "blogCategory"
            )
            .value
            .trim();


    let image =
        document
            .getElementById(
                "blogImage"
            )
            .value
            .trim();


    let imageFile =
        document
            .getElementById(
                "blogImageFile"
            )
            .files[0];


    let excerpt =
        document
            .getElementById(
                "blogExcerpt"
            )
            .value
            .trim();


    let content =
        document
            .getElementById(
                "blogContent"
            )
            .value
            .trim();


    let seoTitle =
        document
            .getElementById(
                "blogSeoTitle"
            )
            .value
            .trim();


    let seoDescription =
        document
            .getElementById(
                "blogSeoDescription"
            )
            .value
            .trim();


    let slug =
        document
            .getElementById(
                "blogSlug"
            )
            .value
            .trim();


    let status =
        document
            .getElementById(
                "blogStatus"
            )
            .value;


    if (
        title === "" ||
        category === "" ||
        excerpt === "" ||
        content === ""
    ) {

        alert(
            "Please fill all required fields."
        );

        return;

    }


    try {

        /* UPLOAD NEW IMAGE */

        if (imageFile) {

            let uploadedImage =
                await uploadBlogImage(
                    imageFile,
                    token
                );


            if (!uploadedImage) {

                return;

            }


            image =
                uploadedImage;

        }


        let article = {

            title:
                title,

            category:
                category,

            excerpt:
                excerpt,

            content:
                content,

            image_url:
                image || null,

            slug:
                slug,

            seo_title:
                seoTitle,

            seo_description:
                seoDescription,

            status:
                status

        };


        let url =
            SUPABASE_URL +
            "/rest/v1/blog";


        let method =
            "POST";


        if (id !== "") {

            url +=
                "?id=eq." +
                id;

            method =
                "PATCH";

        }


        let response =
            await fetch(
                url,
                {
                    method:
                        method,

                    headers: {

                        "Content-Type":
                            "application/json",

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            "Bearer " +
                            token,

                        "Prefer":
                            "return=minimal"

                    },

                    body:
                        JSON.stringify(
                            article
                        )

                }
            );


        if (!response.ok) {

            let error =
                await response.text();


            console.log(
                error
            );


            alert(
                "Article save nahi ho saka:\n\n" +
                error
            );


            return;

        }


        alert(
            id === ""
                ? "Article added successfully."
                : "Article updated successfully."
        );


        clearBlogForm();

        loadAdminBlogs();


    } catch (error) {

        console.log(error);

        alert(
            "Internet connection problem."
        );

    }

}


/* =========================================================
   EDIT BLOG ARTICLE
========================================================= */

async function editBlogArticle(
    blogId
) {

    let token =
        localStorage.getItem(
            "laarAdminToken"
        );


    if (!token) {

        alert(
            "Please login first."
        );

        return;

    }


    try {

        let response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/blog?id=eq." +
                blogId +
                "&select=*",
                {
                    method: "GET",

                    headers: {

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            "Bearer " +
                            token

                    }

                }
            );


        if (!response.ok) {

            alert(
                "Article load nahi ho saka."
            );

            return;

        }


        let blogs =
            await response.json();


        if (
            blogs.length ===
            0
        ) {

            alert(
                "Article nahi mila."
            );

            return;

        }


        let blog =
            blogs[0];


        document.getElementById(
            "blogId"
        ).value =
            blog.id;


        document.getElementById(
            "blogTitle"
        ).value =
            blog.title || "";


        document.getElementById(
            "blogCategory"
        ).value =
            blog.category || "";


        document.getElementById(
            "blogImage"
        ).value =
            blog.image_url || "";


        document.getElementById(
            "blogExcerpt"
        ).value =
            blog.excerpt || "";


        document.getElementById(
            "blogContent"
        ).value =
            blog.content || "";


        document.getElementById(
            "blogSeoTitle"
        ).value =
            blog.seo_title || "";


        document.getElementById(
            "blogSeoDescription"
        ).value =
            blog.seo_description || "";


        document.getElementById(
            "blogSlug"
        ).value =
            blog.slug || "";


        document.getElementById(
            "blogStatus"
        ).value =
            blog.status || "draft";


        let imageFile =
            document.getElementById(
                "blogImageFile"
            );


        if (imageFile) {

            imageFile.value =
                "";

        }


        window.scrollTo({

            top:
                0,

            behavior:
                "smooth"

        });


    } catch (error) {

        console.log(error);

        alert(
            "Internet connection problem."
        );

    }

}


/* =========================================================
   PUBLISH / UNPUBLISH BLOG
========================================================= */

async function toggleBlogStatus(
    blogId,
    currentStatus
) {

    let token =
        localStorage.getItem(
            "laarAdminToken"
        );


    if (!token) {

        alert(
            "Please login first."
        );

        return;

    }


    let newStatus =
        currentStatus ===
        "published"
            ? "draft"
            : "published";


    try {

        let response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/blog?id=eq." +
                blogId,
                {
                    method: "PATCH",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            "Bearer " +
                            token,

                        "Prefer":
                            "return=minimal"

                    },

                    body:
                        JSON.stringify({

                            status:
                                newStatus

                        })

                }
            );


        if (!response.ok) {

            let error =
                await response.text();


            console.log(
                error
            );


            alert(
                "Status update nahi ho saka."
            );

            return;

        }


        loadAdminBlogs();


    } catch (error) {

        console.log(error);

        alert(
            "Internet connection problem."
        );

    }

}


/* =========================================================
   DELETE BLOG ARTICLE
========================================================= */

async function deleteBlogArticle(
    blogId
) {

    let token =
        localStorage.getItem(
            "laarAdminToken"
        );


    if (!token) {

        alert(
            "Please login first."
        );

        return;

    }


    let confirmDelete =
        confirm(
            "Kya aap is article ko permanently delete karna chahte hain?"
        );


    if (!confirmDelete) {

        return;

    }


    try {

        let response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/blog?id=eq." +
                blogId,
                {
                    method: "DELETE",

                    headers: {

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            "Bearer " +
                            token,

                        "Prefer":
                            "return=minimal"

                    }

                }
            );


        if (!response.ok) {

            let error =
                await response.text();


            console.log(
                error
            );


            alert(
                "Article delete nahi ho saka:\n\n" +
                error
            );


            return;

        }


        alert(
            "Article permanently delete ho gaya."
        );


        loadAdminBlogs();


    } catch (error) {

        console.log(error);

        alert(
            "Internet connection problem."
        );

    }

}


/* =========================================================
   CLEAR BLOG FORM
========================================================= */

function clearBlogForm() {

    let blogId =
        document.getElementById(
            "blogId"
        );


    let blogTitle =
        document.getElementById(
            "blogTitle"
        );


    let blogCategory =
        document.getElementById(
            "blogCategory"
        );


    let blogImage =
        document.getElementById(
            "blogImage"
        );


    let blogExcerpt =
        document.getElementById(
            "blogExcerpt"
        );


    let blogContent =
        document.getElementById(
            "blogContent"
        );


    let blogSeoTitle =
        document.getElementById(
            "blogSeoTitle"
        );


    let blogSeoDescription =
        document.getElementById(
            "blogSeoDescription"
        );


    let blogSlug =
        document.getElementById(
            "blogSlug"
        );


    let blogStatus =
        document.getElementById(
            "blogStatus"
        );


    let imageFile =
        document.getElementById(
            "blogImageFile"
        );


    if (blogId) {
        blogId.value = "";
    }


    if (blogTitle) {
        blogTitle.value = "";
    }


    if (blogCategory) {
        blogCategory.value = "";
    }


    if (blogImage) {
        blogImage.value = "";
    }


    if (blogExcerpt) {
        blogExcerpt.value = "";
    }


    if (blogContent) {
        blogContent.value = "";
    }


    if (blogSeoTitle) {
        blogSeoTitle.value = "";
    }


    if (blogSeoDescription) {
        blogSeoDescription.value = "";
    }


    if (blogSlug) {
        blogSlug.value = "";
    }


    if (blogStatus) {
        blogStatus.value = "draft";
    }


    if (imageFile) {
        imageFile.value = "";
    }

}


loadAdminBlogs();


/* =========================================================
   PUBLIC BLOG
========================================================= */

async function loadPublicBlogs() {

    let blogContainer =
        document.getElementById(
            "blogContainer"
        );


    if (!blogContainer) {

        return;

    }


    try {

        let response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/blog?select=*&status=eq.published&order=created_at.desc",
                {
                    method: "GET",

                    headers: {

                        "apikey":
                            SUPABASE_KEY

                    }

                }
            );


        if (!response.ok) {

            console.log(
                await response.text()
            );


            blogContainer.innerHTML =
                "<p>Articles load nahi ho sake.</p>";

            return;

        }


        let blogs =
            await response.json();


        if (
            blogs.length ===
            0
        ) {

            blogContainer.innerHTML =
                "<p class='blog-empty'>No articles published yet.</p>";

            return;

        }


        blogContainer.innerHTML =
            "";


        blogs.forEach(function(blog) {

            let article =
                document.createElement(
                    "article"
                );


            article.className =
                "blog-card";


            /* IMAGE */

            if (blog.image_url) {

                let image =
                    document.createElement(
                        "img"
                    );


                image.src =
                    blog.image_url;


                image.alt =
                    blog.title ||
                    "Laar Fragrance Blog";


                image.className =
                    "blog-card-image";


                article.appendChild(
                    image
                );

            }


            /* CONTENT */

            let content =
                document.createElement(
                    "div"
                );


            content.className =
                "blog-card-content";


            /* CATEGORY */

            let category =
                document.createElement(
                    "div"
                );


            category.className =
                "blog-card-label";


            category.textContent =
                blog.category ||
                "FRAGRANCE";


            content.appendChild(
                category
            );


            /* TITLE */

            let title =
                document.createElement(
                    "h2"
                );


            title.textContent =
                blog.title;


            content.appendChild(
                title
            );


            /* EXCERPT */

            let excerpt =
                document.createElement(
                    "p"
                );


            excerpt.textContent =
                blog.excerpt;


            content.appendChild(
                excerpt
            );


            /* FULL CONTENT */

            let fullContent =
                document.createElement(
                    "div"
                );


            fullContent.className =
                "blog-full-content";


            let paragraphs =
                String(
                    blog.content || ""
                )
                .split(
                    /\n\s*\n/
                );


            paragraphs.forEach(
                function(text) {

                    if (
                        text.trim() ===
                        ""
                    ) {

                        return;

                    }


                    let paragraph =
                        document.createElement(
                            "p"
                        );


                    paragraph.textContent =
                        text.trim();


                    fullContent.appendChild(
                        paragraph
                    );

                }
            );


            content.appendChild(
                fullContent
            );

             
             /* VIEW ARTICLE */

               if (blog.slug) {

                let articleButton =
                    document.createElement("a");

                articleButton.className =
                    "blog-view-article";

                articleButton.href =
                    "/blog/" +
                    encodeURIComponent(blog.slug) +
                    ".html";

                articleButton.textContent =
                    "VIEW ARTICLE";

                articleButton.style.display =
                    "inline-block";

                articleButton.style.textDecoration =
                    "none";

                content.appendChild(
                    articleButton
                );

            }
            
            article.appendChild(
                content
            );


            blogContainer.appendChild(
                article
            );

        });


    } catch (error) {

        console.log(error);

        blogContainer.innerHTML =
            "<p>Internet connection problem.</p>";

    }

}


loadPublicBlogs();


/* =========================================================
   BLOG SEO AUTO FILL
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        let titleField =
            document.getElementById(
                "blogTitle"
            );


        let excerptField =
            document.getElementById(
                "blogExcerpt"
            );


        let seoTitleField =
            document.getElementById(
                "blogSeoTitle"
            );


        let seoDescriptionField =
            document.getElementById(
                "blogSeoDescription"
            );


        let slugField =
            document.getElementById(
                "blogSlug"
            );


        if (!titleField) {

            return;

        }


        /* TITLE → SEO TITLE + SLUG */

        titleField.addEventListener(
            "input",
            function() {

                if (
                    seoTitleField &&
                    seoTitleField.value.trim() === ""
                ) {

                    seoTitleField.value =
                        titleField.value.trim() +
                        " | Laar Fragrance";

                }


                if (
                    slugField &&
                    slugField.value.trim() === ""
                ) {

                    slugField.value =
                        titleField.value
                            .toLowerCase()
                            .trim()
                            .replace(
                                /[^a-z0-9\s-]/g,
                                ""
                            )
                            .replace(
                                /\s+/g,
                                "-"
                            )
                            .replace(
                                /-+/g,
                                "-"
                            );

                }

            }
        );


        /* SHORT DESCRIPTION → SEO DESCRIPTION */

        if (excerptField) {

            excerptField.addEventListener(
                "input",
                function() {

                    if (
                        seoDescriptionField &&
                        seoDescriptionField.value.trim() === ""
                    ) {

                        seoDescriptionField.value =
                            excerptField.value.trim();

                    }

                }
            );

        }

    }
);
