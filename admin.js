/* =========================
   PRODUCT MANAGEMENT
========================= */

async function loadAdminProducts() {

    const productsList =
        document.getElementById("adminProductsList");

    if (!productsList) {
        return;
    }

    productsList.innerHTML =
        "<p>Loading products...</p>";

    try {

        const response =
            await fetch(
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

            const errorText =
                await response.text();

            throw new Error(
                "Products could not be loaded: " +
                errorText
            );
        }

        const products =
            await response.json();

        if (!products.length) {

            productsList.innerHTML =
                "<p>No products found.</p>";

            return;
        }

        productsList.innerHTML = "";

        products.forEach(function(product) {

            const productBox =
                document.createElement("div");

            productBox.className =
                "admin-product-card";

            productBox.innerHTML = `

                <div class="admin-product-name">
                    ${product.name || ""}
                </div>

                <!-- 50ML / MAIN PRODUCT IMAGE -->

                <label>
                    Product Image
                </label>

                <input
                    type="file"
                    id="image-${product.id}"
                    accept="image/jpeg,image/png,image/webp"
                >

                ${
                    product.image_url
                    ?
                    `
                    <img
                        src="${product.image_url}"
                        alt="${product.name}"
                        style="
                            width:120px;
                            margin:10px 0;
                            display:block;
                        "
                    >
                    `
                    :
                    `
                    <p>
                        No image uploaded yet.
                    </p>
                    `
                }


                <!-- TESTER IMAGE -->

                <label>
                    Tester Image (5ml / 10ml)
                </label>

                <input
                    type="file"
                    id="tester-image-${product.id}"
                    accept="image/jpeg,image/png,image/webp"
                >

                ${
                    product.tester_image_url
                    ?
                    `
                    <img
                        src="${product.tester_image_url}"
                        alt="${product.name} Tester"
                        style="
                            width:120px;
                            margin:10px 0;
                            display:block;
                        "
                    >
                    `
                    :
                    `
                    <p>
                        No tester image uploaded yet.
                    </p>
                    `
                }


                <!-- PRICES -->

                <label>
                    5ml Price
                </label>

                <input
                    type="number"
                    id="price5-${product.id}"
                    value="${product.price_5ml || ""}"
                >


                <label>
                    10ml Price
                </label>

                <input
                    type="number"
                    id="price10-${product.id}"
                    value="${product.price_10ml || ""}"
                >


                <label>
                    30ml Price
                </label>

                <input
                    type="number"
                    id="price30-${product.id}"
                    value="${product.price_30ml || ""}"
                >


                <label>
                    50ml Price
                </label>

                <input
                    type="number"
                    id="price50-${product.id}"
                    value="${product.price_50ml || ""}"
                >


                <button
                    type="button"
                    onclick="saveProduct(${product.id})"
                >
                    SAVE PRODUCT
                </button>

            `;

            productsList.appendChild(productBox);

        });

    }

    catch (error) {

        console.error(
            "Product loading error:",
            error
        );

        productsList.innerHTML =
            "<p>Unable to load products.</p>";

    }

}


/* =========================
   SAVE PRODUCT
========================= */

async function saveProduct(productId) {

    const price5Input =
        document.getElementById(
            "price5-" + productId
        );

    const price10Input =
        document.getElementById(
            "price10-" + productId
        );

    const price30Input =
        document.getElementById(
            "price30-" + productId
        );

    const price50Input =
        document.getElementById(
            "price50-" + productId
        );

    const imageInput =
        document.getElementById(
            "image-" + productId
        );

    const testerImageInput =
        document.getElementById(
            "tester-image-" + productId
        );


    if (
        !price5Input ||
        !price10Input ||
        !price30Input ||
        !price50Input
    ) {

        alert(
            "Price fields not found."
        );

        return;
    }


    const price5 =
        price5Input.value;

    const price10 =
        price10Input.value;

    const price30 =
        price30Input.value;

    const price50 =
        price50Input.value;


    if (
        !price5 ||
        !price10 ||
        !price30 ||
        !price50
    ) {

        alert(
            "Please enter all prices."
        );

        return;
    }


    try {

        let imageUrl = null;

        let testerImageUrl = null;


        /* =========================
           TESTER IMAGE UPLOAD
        ========================= */

        if (
            testerImageInput &&
            testerImageInput.files &&
            testerImageInput.files.length > 0
        ) {

            const testerFile =
                testerImageInput.files[0];


            const testerFileExtension =
                testerFile.name
                    .split(".")
                    .pop()
                    .toLowerCase();


            const testerFileName =
                "tester-" +
                productId +
                "-" +
                Date.now() +
                "." +
                testerFileExtension;


            const testerUploadResponse =
                await fetch(
                    SUPABASE_URL +
                    "/storage/v1/object/product-images/" +
                    testerFileName,
                    {
                        method: "POST",

                        headers: {
                            "apikey":
                                SUPABASE_KEY,

                            "Authorization":
                                "Bearer " +
                                SUPABASE_KEY,

                            "Content-Type":
                                testerFile.type
                        },

                        body:
                            testerFile
                    }
                );


            if (!testerUploadResponse.ok) {

                const testerUploadError =
                    await testerUploadResponse.text();

                console.error(
                    "Tester image upload error:",
                    testerUploadError
                );

                alert(
                    "Tester Image Error:\n\n" +
                    testerUploadError
                );

                throw new Error(
                    "Tester image upload failed"
                );

            }


            testerImageUrl =
                SUPABASE_URL +
                "/storage/v1/object/public/product-images/" +
                testerFileName;

        }


        /* =========================
           50ML / MAIN IMAGE UPLOAD
        ========================= */

        if (
            imageInput &&
            imageInput.files &&
            imageInput.files.length > 0
        ) {

            const file =
                imageInput.files[0];


            const fileExtension =
                file.name
                    .split(".")
                    .pop()
                    .toLowerCase();


            const fileName =
                productId +
                "-" +
                Date.now() +
                "." +
                fileExtension;


            const uploadResponse =
                await fetch(
                    SUPABASE_URL +
                    "/storage/v1/object/product-images/" +
                    fileName,
                    {
                        method: "POST",

                        headers: {
                            "apikey":
                                SUPABASE_KEY,

                            "Authorization":
                                "Bearer " +
                                SUPABASE_KEY,

                            "Content-Type":
                                file.type
                        },

                        body:
                            file
                    }
                );


            if (!uploadResponse.ok) {

                const uploadError =
                    await uploadResponse.text();

                console.error(
                    "50ml image upload error:",
                    uploadError
                );

                alert(
                    "50ml Image Error:\n\n" +
                    uploadError
                );

                throw new Error(
                    "50ml image upload failed"
                );

            }


            imageUrl =
                SUPABASE_URL +
                "/storage/v1/object/public/product-images/" +
                fileName;

        }


        /* =========================
           PRODUCT DATA
        ========================= */

        const productData = {

            price_5ml:
                Number(price5),

            price_10ml:
                Number(price10),

            price_30ml:
                Number(price30),

            price_50ml:
                Number(price50)

        };


        /* =========================
           TESTER IMAGE URL
        ========================= */

        if (testerImageUrl) {

            productData.tester_image_url =
                testerImageUrl;

        }


        /* =========================
           50ML IMAGE URL
        ========================= */

        if (imageUrl) {

            productData.image_url =
                imageUrl;

        }


        /* =========================
           UPDATE SUPABASE PRODUCT
        ========================= */

        const response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/products?id=eq." +
                productId,
                {
                    method: "PATCH",

                    headers: {

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            "Bearer " +
                            SUPABASE_KEY,

                        "Content-Type":
                            "application/json",

                        "Prefer":
                            "return=representation"

                    },

                    body:
                        JSON.stringify(
                            productData
                        )

                }
            );


        if (!response.ok) {

            const updateError =
                await response.text();

            console.error(
                "Product update error:",
                updateError
            );

            alert(
                "Product Update Error:\n\n" +
                updateError
            );

            throw new Error(
                "Product could not be updated"
            );

        }


        alert(
            "Product saved successfully."
        );


        loadAdminProducts();

    }

    catch (error) {

        console.error(
            "Save product error:",
            error
        );

        alert(
            "Product save failed:\n\n" +
            error.message
        );

    }

}


/* =========================
   LOAD PRODUCTS
========================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadAdminProducts();

    }
);