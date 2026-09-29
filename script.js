let cart = JSON.parse(localStorage.getItem("laarCart")) || [];


function saveCart() {

    localStorage.setItem(
        "laarCart",
        JSON.stringify(cart)
    );

}


function openCart() {

    document
        .getElementById("cartPanel")
        .classList.add("active");

    showCart();
}


function closeCart() {

    document
        .getElementById("cartPanel")
        .classList.remove("active");

}


function addToCart(name, price,image) {

    let existingItem = cart.find(function(item) {

        return item.name === name;

    });


    if (existingItem) {

        existingItem.quantity++;

    } else {

        cart.push({

            name: name,

            price: price,

            quantity: 1,
          image: image

        });

    }

    saveCart();

    openCart();
}


function increaseQuantity(name) {

    let item = cart.find(function(item) {

        return item.name === name;

    });


    if (item) {

        item.quantity++;

    }

    saveCart();

    showCart();

    renderCartPage();
}


function decreaseQuantity(name) {

    let item = cart.find(function(item) {

        return item.name === name;

    });


    if (item) {

        item.quantity--;

        if (item.quantity <= 0) {

            cart = cart.filter(function(product) {

                return product.name !== name;

            });

        }

    }

    saveCart();

    showCart();

    renderCartPage();
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

        cartItems.innerHTML = `
            <p>Your cart is empty.</p>
        `;

        cartTotal.innerHTML = "";

        return;
    }


    cartItems.innerHTML = "";

    let total = 0;


    cart.forEach(function(item) {

        let itemTotal =
            item.price * item.quantity;

        total += itemTotal;


        let image = "";

if (item.image) {
    image = item.image;
} else if (item.name.includes("Breeze")) {
    image = "Images/Breeze1.jpg";
} else if (
    item.name.includes("Roby Oud") ||
    item.name.includes("Ruby Oud")
) {
    image = "Images/Ruby.jpg";
} else if (item.name.includes("Blue Savage")) {
    image = "Images/Blue.jpg";
} else if (item.name.includes("Secrete Night")) {
    image = "Images/Night.jpg";
}


        cartItems.innerHTML += `

            <div class="cart-item">

                <img
                    src="${image}"
                    alt="${item.name}"
                    class="cart-item-image"
                >

                <div>

                    <h3>
                        ${item.name}
                    </h3>

                    <p>
                        Rs. ${item.price} × ${item.quantity}
                    </p>

                    <div class="quantity-controls">

                        <button
                            onclick="decreaseQuantity('${item.name}')">
                            −
                        </button>

                        <span>
                            ${item.quantity}
                        </span>

                        <button
                            onclick="increaseQuantity('${item.name}')">
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

        cartItems.innerHTML = `
            <p>Your cart is empty.</p>
        `;

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
        src="${item.image || ''}"
        alt="${item.name}"
        class="cart-page-item-image"
    >

    <h3>
        ${item.name}
    </h3>
                <p>
                    Rs. ${item.price}
                </p>

                <div class="quantity-controls">

                    <button
                        onclick="decreaseQuantity('${item.name}')">
                        −
                    </button>

                    <span>
                        ${item.quantity}
                    </span>

                    <button
                        onclick="increaseQuantity('${item.name}')">
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


function addTesterToCart(name, button) {

    let selectedSize =
        button.parentElement.querySelector(".size-option.active");

    let size =
        selectedSize.dataset.size;

    let price =
        Number(selectedSize.dataset.price);

    let testerName =
        name + " Tester - " + size;

    addToCart(
        testerName,
        price
    );

    let item = cart.find(function(item) {
        return item.name === testerName;
    });

    if (item) {

        if (name === "Breeze") {
            item.image = "Images/Breezet.jpg";
        } else if (name === "Ruby Oud") {
            item.image = "Images/Rubyt.jpg";
        } else if (name === "Blue Savage") {
            item.image = "Images/Bluet.jpg";
        } else if (name === "Secrete Night") {
            item.image = "Images/Nightt.jpg";
        }

    }

    saveCart();
    showCart();

}
document.querySelectorAll(".size-option").forEach(function(button) {

    button.addEventListener("click", function() {

        let parent = button.parentElement;

        parent.querySelectorAll(".size-option").forEach(function(item) {
            item.classList.remove("active");
        });

        button.classList.add("active");

    });

});
renderCartPage();
async function placeOrder() {

    let name =
        document.getElementById("customerName").value.trim();

    let phone =
        document.getElementById("customerPhone").value.trim();

    let address =
        document.getElementById("customerAddress").value.trim();


    if (cart.length === 0) {

        alert("Your cart is empty.");

        return;
    }


    if (name === "" || phone === "" || address === "") {

        alert("Please fill all delivery details.");

        return;
    }


    let total = 0;


    cart.forEach(function(item) {

        total += item.price * item.quantity;

    });


    let order = {

        customer_name: name,

        customer_phone: phone,

        customer_address: address,

        products: cart,

        tottal: total,
          
      status: "Pending"

    };


    try {

      let response = await fetch(
   "https://emworxswydgeebwjshoj.supabase.co/rest/v1/Oders",
    {
        method: "POST",

        headers: {
            "Content-Type": "application/json",

            "apikey": "sb_publishable_PGZcWNslHusFmxHSGI-eLg_jqGKar3h",

            "Authorization":
              "Bearer sb_publishable_PGZcWNslHusFmxHSGI-eLg_jqGKar3h",
    "Prefer": "return=minimal"
        },

        body: JSON.stringify(order)
    }
);

let responseText = await response.text();

if (!response.ok) {

    console.log(responseText);

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
    "ERROR: " + error.message
);
    }

}
async function adminLogin() {

    let email =
        document.getElementById("adminEmail").value.trim();

    let password =
        document.getElementById("adminPassword").value;


    if (email === "" || password === "") {

        document.getElementById("loginMessage").innerText =
            "Please enter email and password.";

        return;
    }


    let response = await fetch(
        "https://emworxswydgeebwjshoj.supabase.co/auth/v1/token?grant_type=password",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "apikey": "sb_publishable_PGZcWNslHusFmxHSGI-eLg_jqGKar3h"
            },

            body: JSON.stringify({
                email: email,
                password: password
            })
        }
    );


    let data = await response.json();


    if (!response.ok) {

        document.getElementById("loginMessage").innerText =
            "Login failed.";

        console.log(data);

        return;
    }


    localStorage.setItem(
        "laarAdminToken",
        data.access_token
    );


    window.location.href = "admin-orders.html";

}
async function loadOrders() {

    let ordersList =
        document.getElementById("ordersList");

    if (!ordersList) {
        return;
    }

    let token =
        localStorage.getItem("laarAdminToken");

    if (!token) {

        ordersList.innerHTML =
            "<p>Please login first.</p>";

        return;
    }

    try {

        let response = await fetch(
            "https://emworxswydgeebwjshoj.supabase.co/rest/v1/Oders?select=*&order=created_at.desc",
            {
                method: "GET",

                headers: {

                    "apikey":
                        "sb_publishable_PGZcWNslHusFmxHSGI-eLg_jqGKar3h",

                    "Authorization":
                        "Bearer " + token

                }
            }
        );

        if (!response.ok) {

            let error =
                await response.text();

            console.log(error);

            ordersList.innerHTML =
                "<p>Orders load nahi ho sake.</p>";

            return;
        }


        if (!response.ok) {

    let error =
        await response.text();

    console.log(error);

    alert(
        "Supabase Error:\n\n" +
        error
    );

    return;
}

let orderId = await response.json();

        ordersList.innerHTML = "";

        orders.forEach(function(order) {

            let products = order.products;

            if (typeof products === "string") {
                products = JSON.parse(products);
            }

            let productsHTML = "";

            products.forEach(function(item) {

                productsHTML += `
                    <div class="order-product">

                        <strong>${item.name}</strong>

                        <span>
                            Quantity: ${item.quantity}
                        </span>

                        <span>
                            Price: Rs. ${item.price}
                        </span>

                    </div>
                `;

            });

            ordersList.innerHTML += `

                <div class="order-card">

                    <h3>
                        Order #${order.id}
                    </h3>
                    <p>
    <strong>Date:</strong>
    ${new Date(order.created_at).toLocaleString()}
</p>

                    <p>
                        <strong>Name:</strong>
                        ${order.customer_name}
                    </p>

                    <p>
                        <strong>Phone:</strong>
                        ${order.customer_phone}
                    </p>

                    <p>
                        <strong>Address:</strong>
                        ${order.customer_address}
                    </p>

                    <div class="order-products">

                        <strong>Products:</strong>

                        ${productsHTML}

                    </div>

                    <p>
                        <strong>Total:</strong>
                        Rs. ${order.tottal}
                    </p>
<p>
    <strong>Status:</strong>

    <select onchange="updateOrderStatus(${order.id}, this.value)">

        <option value="Pending" ${order.status === "Pending" ? "selected" : ""}>
            Pending
        </option>

        <option value="Confirmed" ${order.status === "Confirmed" ? "selected" : ""}>
            Confirmed
        </option>

        <option value="Shipped" ${order.status === "Shipped" ? "selected" : ""}>
            Shipped
        </option>

        <option value="Delivered" ${order.status === "Delivered" ? "selected" : ""}>
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
function adminLogout() {

    localStorage.removeItem("laarAdminToken");

    window.location.href = "admin.html";

}
async function updateOrderStatus(orderId, newStatus) {

    let token =
        localStorage.getItem("laarAdminToken");

    if (!token) {
        alert("Please login first.");
        return;
    }

    try {

        let response = await fetch(
            "https://emworxswydgeebwjshoj.supabase.co/rest/v1/Oders?id=eq." + orderId,
            {
                method: "PATCH",

                headers: {
                    "Content-Type": "application/json",
                    "apikey": "sb_publishable_PGZcWNslHusFmxHSGI-eLg_jqGKar3h",
                    "Authorization": "Bearer " + token,
                    "Prefer": "return=minimal"
                },

                body: JSON.stringify({
                    status: newStatus
                })
            }
        );

        if (!response.ok) {
            alert("Status update nahi ho saka.");
            return;
        }

        alert("Order status updated.");

        loadOrders();

    } catch (error) {

        console.log(error);

        alert("Internet connection problem.");

    }

}