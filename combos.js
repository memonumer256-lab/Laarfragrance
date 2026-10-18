/* =====================================
   LAAR FRAGRANCE - COMBO DEALS
===================================== */

const comboProductNames = [
    "Breeze",
    "Ruby Oud",
    "Blue Savage",
    "Secrete Night"
];

let comboProducts = {};

/* =====================================
   LOAD ADMIN COMBO SETTINGS
===================================== */

let comboOffers = {};

async function loadComboOffers() {

    try {

        const response = await fetch(
            SUPABASE_URL +
            "/rest/v1/sale_offers?select=package_key,image_url,offer_price,active&active=eq.true",
            {
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": "Bearer " + SUPABASE_KEY
                }
            }
        );

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const offers = await response.json();

        comboOffers = {};

        offers.forEach(function(offer) {

            if (offer.package_key) {
                comboOffers[offer.package_key] = offer;
            }

        });

        updateComboImages();
        update50mlTotal();
        updateComboPrices();
      
    } catch (error) {

        console.error(
            "Admin combo settings load error:",
            error
        );

    }

}

const blankComboImage =
    "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";


/* =====================================
   LOAD PRODUCTS AND IMAGES
===================================== */

async function loadComboProducts() {

    try {

        const response = await fetch(
            SUPABASE_URL +
            "/rest/v1/products?select=name,image_url,tester_image_url,price_50ml",
            {
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": "Bearer " + SUPABASE_KEY
                }
            }
        );

        if (!response.ok) {
            throw new Error("Products load nahi huay.");
        }

        const products = await response.json();

        products.forEach(function(product) {

            comboProducts[
                product.name.toLowerCase()
            ] = product;

        });

        updateComboImages();
        update50mlTotal();

    } catch (error) {

        console.error("Combo products error:", error);

    }

}


/* =====================================
   PRODUCT LOOKUP
===================================== */

function getComboProduct(name) {

    return comboProducts[
        name.toLowerCase()
    ] || null;

}


function getComboImage(name, isTester) {

    const product = getComboProduct(name);

    if (!product) {
        return "";
    }

    if (isTester) {
        return product.tester_image_url || "";
    }

    return product.image_url || "";

}



/* =====================================
   UPDATE PACKAGE IMAGES
===================================== */

function updateComboImages() {

    const imageSettings = [
        {
            key: "tester5",
            selector: '[data-combo-image="tester5"]',
            name: document.querySelector(
                ".tester5-select"
            )?.value,
            tester: true
        },
        {
            key: "tester10",
            selector: '[data-combo-image="tester10"]',
            name: document.querySelector(
                ".tester10-select"
            )?.value,
            tester: true
        },
        {
            key: "perfume30",
            selector: '[data-combo-image="perfume30"]',
            name: document.getElementById(
                "perfume30a"
            )?.value,
            tester: false
        },
        {
            key: "perfume50",
            selector: '[data-combo-image="perfume50"]',
            name: document.getElementById(
                "perfume50a"
            )?.value,
            tester: false
        }
    ];

    imageSettings.forEach(function(setting) {

        const image = document.querySelector(
            setting.selector
        );

        if (!image) {
            return;
        }

        const adminOffer = comboOffers[setting.key];

        if (adminOffer && adminOffer.image_url) {

            image.src = adminOffer.image_url;
            return;

        }

        if (!setting.name) {
            return;
        }

        const imageUrl = getComboImage(
            setting.name,
            setting.tester
        );

        image.src = imageUrl || blankComboImage;

    });

}


/* =====================================
   ADMIN PRICE FOR A PACKAGE
   (falls back to the default price)
===================================== */

function getComboOfferPrice(key, defaultPrice) {

    const adminOffer = comboOffers[key];

    if (
        adminOffer &&
        adminOffer.offer_price != null &&
        Number(adminOffer.offer_price) > 0
    ) {

        return Number(adminOffer.offer_price);

    }

    return Number(defaultPrice);

}


/* =====================================
   SHOW ADMIN PRICES ON PACKAGES 1, 2, 3
===================================== */

function updateComboPrices() {

    ["tester5", "tester10", "perfume30"].forEach(
        function(key) {

            const adminOffer = comboOffers[key];

            if (
                !adminOffer ||
                adminOffer.offer_price == null ||
                Number(adminOffer.offer_price) <= 0
            ) {
                return;
            }

            const image = document.querySelector(
                '[data-combo-image="' + key + '"]'
            );

            if (!image) {
                return;
            }

            const priceElement = image
                .closest(".combo-card")
                ?.querySelector(".combo-price");

            if (!priceElement) {
                return;
            }

            priceElement.textContent =
                "Get in Just Rs. " +
                Number(adminOffer.offer_price)
                    .toLocaleString("en-PK");

        }
    );

}


/* =====================================
   UPDATE 50ML COMBO TOTAL
===================================== */


function update50mlTotal() {

    const firstName = document.getElementById(
        "perfume50a"
    )?.value;

    const secondName = document.getElementById(
        "perfume50b"
    )?.value;

    const priceElement = document.querySelector(
        "#perfume50a"
    )?.closest(".combo-details")
     ?.querySelector(".combo-price");

    if (!firstName || !secondName || !priceElement) {
        return;
    }

    const adminOffer = comboOffers["perfume50"];

    if (
        adminOffer &&
        adminOffer.offer_price != null &&
        Number(adminOffer.offer_price) > 0
    ) {
        priceElement.textContent =
            "Total: Rs. " +
            Number(adminOffer.offer_price).toLocaleString("en-PK") +
            " — 2 testers FREE";

        return;
    }

    const firstProduct = getComboProduct(firstName);
    const secondProduct = getComboProduct(secondName);

    if (!firstProduct || !secondProduct) {
        return;
    }

    const firstPrice =
        Number(firstProduct.price_50ml ?? 3500);

    const secondPrice =
        Number(secondProduct.price_50ml ?? 3500);

    priceElement.textContent =
        "Total: Rs. " +
        (firstPrice + secondPrice).toLocaleString("en-PK") +
        " — 2 testers FREE";
}



/* =====================================
   SAVE ITEM TO EXISTING CART
===================================== */

function addComboCartItem(
    name,
    price,
    size,
    image
) {

    const existingItem = cart.find(function(item) {

        return (
            item.name === name &&
            item.size === size &&
            Number(item.price) === Number(price)
        );

    });

    if (existingItem) {

        existingItem.quantity++;

    } else {

        cart.push({
            name: name,
            price: Number(price),
            size: size,
            quantity: 1,
            image: image || ""
        });

    }

}


/* =====================================
   FINISH ADDING COMBO
===================================== */

function finishComboOrder() {

    saveCart();

    alert("Combo cart mein add ho gaya hai.");

    window.location.href = "./cart.html";

}


/* =====================================
   PACKAGE 1 AND 2
   FOUR TESTERS
===================================== */

function addTesterCombo(
    size,
    offerPrice,
    regularPrice,
    button
) {

    const card = button.closest(".combo-card");

    const selectorClass =
        size === "5ml"
            ? ".tester5-select"
            : ".tester10-select";

    const selectors = card.querySelectorAll(
        selectorClass
    );

    const selectedNames = Array.from(
        selectors
    ).map(function(select) {

        return select.value;

    });

    if (selectedNames.length !== 4) {

        alert("Please select all four testers.");

        return;

    }

    const comboName =
        "4 Testers Combo (" +
        size +
        "): " +
        selectedNames.join(", ");

    const firstImage = getComboImage(
        selectedNames[0],
        true
    );

    /* ADMIN PRICE (falls back to the price in the page) */

    const packageKey =
        size === "5ml"
            ? "tester5"
            : "tester10";

    const finalPrice =
        getComboOfferPrice(
            packageKey,
            offerPrice
        );

    addComboCartItem(
        comboName,
        finalPrice,
        "Combo",
        firstImage
    );

    finishComboOrder();

}


/* =====================================
   PACKAGE 3
   TWO 30ML PERFUMES
===================================== */

function addPerfume30Combo() {

    const firstName = document.getElementById(
        "perfume30a"
    ).value;

    const secondName = document.getElementById(
        "perfume30b"
    ).value;

    const comboName =
        "2 Perfumes 30ml Combo: " +
        firstName +
        " + " +
        secondName;

    const firstImage = getComboImage(
        firstName,
        false
    );

    /* ADMIN PRICE (falls back to 3000) */

    const finalPrice =
        getComboOfferPrice(
            "perfume30",
            3000
        );

    addComboCartItem(
        comboName,
        finalPrice,
        "Combo",
        firstImage
    );

    finishComboOrder();

}


/* =====================================
   PACKAGE 4
   TWO 50ML + TWO FREE 10ML
===================================== */


function addPerfume50Combo() {

    const firstName = document.getElementById("perfume50a").value;
    const secondName = document.getElementById("perfume50b").value;
    const freeTesterA = document.getElementById("freeTesterA").value;
    const freeTesterB = document.getElementById("freeTesterB").value;

    const firstProduct = getComboProduct(firstName);
    const secondProduct = getComboProduct(secondName);

    if (!firstProduct || !secondProduct) {
        alert("Perfume prices load nahi huay. Dobara try karein.");
        return;
    }

    const adminOffer = comboOffers["perfume50"];

    if (
        adminOffer &&
        adminOffer.offer_price != null &&
        Number(adminOffer.offer_price) > 0
    ) {

        const comboName =
            "2 Perfumes 50ml Combo: " +
            firstName + " + " + secondName +
            " (2 Free Testers: " +
            freeTesterA + " + " + freeTesterB + ")";

        addComboCartItem(
            comboName,
            Number(adminOffer.offer_price),
            "Combo",
            adminOffer.image_url || firstProduct.image_url
        );

    } else {

        const firstPrice = Number(firstProduct.price_50ml ?? 3500);
        const secondPrice = Number(secondProduct.price_50ml ?? 3500);

        addComboCartItem(
            firstName,
            firstPrice,
            "50ml",
            firstProduct.image_url
        );

        addComboCartItem(
            secondName,
            secondPrice,
            "50ml",
            secondProduct.image_url
        );

        addComboCartItem(
            freeTesterA + " (Free Tester)",
            0,
            "10ml",
            getComboImage(freeTesterA, true)
        );

        addComboCartItem(
            freeTesterB + " (Free Tester)",
            0,
            "10ml",
            getComboImage(freeTesterB, true)
        );
    }

    finishComboOrder();
}




/* =====================================
   IMAGE AND PRICE SELECTION EVENTS
===================================== */

document.querySelectorAll(
    ".tester5-select, .tester10-select, #perfume30a, #perfume30b, #perfume50a, #perfume50b"
).forEach(function(select) {

    select.addEventListener("change", function() {

        updateComboImages();
        update50mlTotal();

    });

});


/* =====================================
   START
===================================== */

loadComboProducts();
loadComboOffers();
