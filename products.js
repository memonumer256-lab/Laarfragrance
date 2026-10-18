/* =========================
   HOME PRODUCTS
========================= */

async function loadHomeProducts() {

    try {

        const response = await fetch(
            SUPABASE_URL +
            "/rest/v1/products?select=*",
            {
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization":
                        "Bearer " + SUPABASE_KEY
                }
            }
        );

        if (!response.ok) {

            throw new Error(
                "Products could not be loaded"
            );

        }

        const products =
            await response.json();


        const productMap = {};


        products.forEach(
            function(product) {

                productMap[
                    product.name
                        .trim()
                        .replace(/\s+/g, " ")
                        .toLowerCase()
                ] = product;

            }
        );


        const cards =
            document.querySelectorAll(
                ".product-card"
            );


        cards.forEach(
            function(card) {

                const title =
                    card.querySelector(
                        "h3, h2"
                    );

                if (!title) {
                    return;
                }


                const cardName =
                    title.textContent
                        .trim()
                        .replace(/\s+/g, " ")
                        .toLowerCase();


                let product =
                    productMap[cardName];


                if (!product) {
                    return;
                }


                /* PRODUCT IMAGE */

                const image =
                    card.querySelector(
                        "img"
                    );

                if (
                    image &&
                    product.image_url
                ) {

                    image.src =
                        product.image_url;

                }


                /* FROM PRICE */

                const priceElements =
                    card.querySelectorAll(
                        "p"
                    );

                priceElements.forEach(
                    function(element) {

                        if (
                            element.textContent
                                .includes(
                                    "From Rs."
                                )
                        ) {

                            element.textContent =
                                "From Rs. " +
                                product.price_50ml;

                        }

                    }
                );


                /* SHOP NOW BUTTON */

                const button =
                    card.querySelector(
                        "button"
                    );

                if (button) {

                    button.onclick =
                        function() {

                            addToCart(
                                product.name,
                                product.price_50ml,
                                product.image_url
                            );

                        };

                }

            }
        );
        /* =========================
           HOME TESTER IMAGES
        ========================= */

        const testerCards =
            document.querySelectorAll(
                ".tester-card"
            );

        testerCards.forEach(
            function(card) {

                const title =
                    card.querySelector("h3");

                const image =
                    card.querySelector("img");

                if (!title || !image) {
                    return;
                }

                const testerName =
                    title.textContent
                        .trim()
                        .replace(/\s+/g, " ")
                        .toLowerCase();

                const product =
                    productMap[testerName];

                if (
                    product &&
                    product.tester_image_url
                ) {

                    image.src =
                        product.tester_image_url;

                }

            }
        );
    }


      
    catch (error) {

        console.error(
            "Home products error:",
            error
        );

    }

}


/* =========================
   LOAD HOME PRODUCTS
========================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadHomeProducts();

    }
);

/* =========================
   4 PRODUCT SMOOTH LOOP
========================= */

document.addEventListener("DOMContentLoaded", function () {

    const container =
        document.querySelector(".products");

    if (!container) {
        return;
    }

    const cards =
        Array.from(
            container.querySelectorAll(".product-card")
        );

    if (cards.length !== 4) {
        return;
    }


    /* Clone the 4 cards */

    cards.forEach(function (card) {

        const clone =
            card.cloneNode(true);

        /* Image popup click for cloned cards */

        clone.querySelectorAll("img").forEach(function (img) {

            img.addEventListener("click", function () {

                if (typeof openImagePopup === "function") {

                    openImagePopup(
                        img.src,
                        img.alt
                    );

                }

            });

        });

        container.appendChild(clone);

    });


    let position = 0;

    const speed = 0.35;

    let paused = false;

    let resumeTimer = null;


    /* Pause the loop while the customer touches / swipes */

    container.addEventListener("touchstart", function () {

        paused = true;

        clearTimeout(resumeTimer);

    }, { passive: true });


    function resumeLoop() {

        clearTimeout(resumeTimer);

        resumeTimer = setTimeout(function () {

            position = container.scrollLeft;

            paused = false;

        }, 1500);

    }

    container.addEventListener("touchend", resumeLoop);

    container.addEventListener("touchcancel", resumeLoop);


    function move() {

        if (paused) {

            requestAnimationFrame(move);

            return;

        }


        position += speed;

        container.scrollLeft =
            position;


        const firstCard =
            cards[0];

        const cardStyle =
            window.getComputedStyle(
                firstCard
            );

        const gap =
            parseFloat(
                window.getComputedStyle(
                    container
                ).gap
            ) || 0;


        const cardWidth =
            firstCard.offsetWidth +
            gap;


        const loopWidth =
            cardWidth * 4;


        if (position >= loopWidth) {

            position -= loopWidth;

            container.scrollLeft =
                position;

        }


        requestAnimationFrame(move);

    }


    requestAnimationFrame(move);

});
