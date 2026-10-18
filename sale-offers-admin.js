/* =====================================
   LAAR FRAGRANCE - COMBO ADMIN
   Edit package image and price
===================================== */

/* =====================================
   ADMIN LOGIN TOKEN HELPERS
===================================== */

function getAdminToken() {

    return localStorage.getItem(
        "laarAdminToken"
    );

}


/* Returns true (and sends admin to login) when the login has expired */

function adminSessionExpired(status, text) {

    if (
        status === 401 ||
        /jwt|expired/i.test(text || "")
    ) {

        alert(
            "Admin login expire ho gaya hai. Dobara login karein."
        );

        localStorage.removeItem(
            "laarAdminToken"
        );

        window.location.href =
            "admin.html";

        return true;

    }

    return false;

}


const comboAdminPackages = [
    {
        key: "tester5",
        title: "4 × 5ml Testers",
        defaultPrice: 1000,
        order: 1
    },
    {
        key: "tester10",
        title: "4 × 10ml Testers",
        defaultPrice: 1900,
        order: 2
    },
    {
        key: "perfume30",
        title: "2 × 30ml Perfumes",
        defaultPrice: 3000,
        order: 3
    },
    {
        key: "perfume50",
        title: "2 × 50ml Perfumes + 2 Free Testers",
        defaultPrice: 3000,
        order: 4
    }
];


/* =====================================
   LOAD COMBO PACKAGES
===================================== */

async function loadSaleOffers() {

    const list = document.getElementById(
        "adminSaleOffersList"
    );

    if (!list) return;

    list.innerHTML = "<p>Loading combo packages...</p>";

    try {

        const response = await fetch(
            SUPABASE_URL +
            "/rest/v1/sale_offers?select=*",
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

        list.innerHTML = "";

        comboAdminPackages.forEach(function(pkg) {

            const offer = offers.find(function(item) {
                return item.package_key === pkg.key;
            });

            const card = document.createElement("div");
            card.className = "admin-product-card";

            const heading = document.createElement("h3");
            heading.textContent = pkg.title;

            const image = document.createElement("img");
            image.alt = pkg.title;
            image.style.width = "150px";
            image.style.maxWidth = "100%";
            image.style.display = "block";
            image.style.margin = "10px 0";

            if (offer && offer.image_url) {
                image.src = offer.image_url;
            }

            const priceLabel = document.createElement("label");
            priceLabel.textContent = "Package Price (Rs.)";
            priceLabel.htmlFor = "comboPrice_" + pkg.key;

            const priceInput = document.createElement("input");
            priceInput.type = "number";
            priceInput.id = "comboPrice_" + pkg.key;
            priceInput.min = "1";
            priceInput.step = "1";
            priceInput.value =
                offer && offer.offer_price != null
                    ? offer.offer_price
                    : pkg.defaultPrice;

            priceInput.style.display = "block";
            priceInput.style.margin = "8px 0 14px";

            const imageLabel = document.createElement("label");
            imageLabel.textContent = "Change Package Image";
            imageLabel.htmlFor = "comboImage_" + pkg.key;

            const imageInput = document.createElement("input");
            imageInput.type = "file";
            imageInput.id = "comboImage_" + pkg.key;
            imageInput.accept = "image/jpeg,image/png,image/webp";
            imageInput.style.display = "block";
            imageInput.style.margin = "8px 0 14px";

            imageInput.addEventListener("change", function() {

                const file = imageInput.files[0];

                if (file) {
                    image.src = URL.createObjectURL(file);
                }

            });

            const status = document.createElement("p");
            status.textContent = offer
                ? "Package record available"
                : "Not saved yet";

            const saveButton = document.createElement("button");
            saveButton.type = "button";
            saveButton.textContent = "SAVE IMAGE & PRICE";

            saveButton.addEventListener("click", function() {
                saveComboPackage(pkg, offer, priceInput, imageInput, saveButton);
            });

            card.appendChild(heading);
            card.appendChild(image);
            card.appendChild(priceLabel);
            card.appendChild(priceInput);
            card.appendChild(imageLabel);
            card.appendChild(imageInput);
            card.appendChild(status);
            card.appendChild(saveButton);

            list.appendChild(card);

        });

    } catch (error) {

        console.error("Combo packages loading error:", error);

        list.innerHTML =
            "<p>Could not load packages. Check Supabase permissions.</p>";

    }

}


/* =====================================
   SAVE PACKAGE IMAGE AND PRICE
===================================== */

async function saveComboPackage(
    pkg,
    oldOffer,
    priceInput,
    imageInput,
    button
) {

    const token = getAdminToken();

    if (!token) {
        alert("Please login first.");
        window.location.href = "admin.html";
        return;
    }

    const price = Number(priceInput.value);
    const file = imageInput.files[0];

    if (!priceInput.value.trim() || !Number.isFinite(price) || price <= 0) {
        alert("Please enter a valid package price.");
        return;
    }

    if (
        file &&
        !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    ) {
        alert("Please select a JPG, PNG, or WebP image.");
        return;
    }

    if (file && file.size > 5 * 1024 * 1024) {
        alert("Image size must be 5 MB or less.");
        return;
    }

    if (!file && !(oldOffer && oldOffer.image_url)) {
        alert("Please select an image for this package.");
        return;
    }

    button.disabled = true;

    try {

        let imageUrl = oldOffer ? oldOffer.image_url : "";

        /* UPLOAD NEW IMAGE IF SELECTED */

        if (file) {

            const extension = file.name.split(".").pop().toLowerCase();

            const fileName =
                "combo-" + pkg.key + "-" + Date.now() + "." + extension;

            const uploadResponse = await fetch(
                SUPABASE_URL +
                "/storage/v1/object/product-images/" +
                fileName,
                {
                    method: "POST",
                    headers: {
                        "apikey": SUPABASE_KEY,
                        "Authorization": "Bearer " + token,
                        "Content-Type": file.type,
                        "x-upsert": "false"
                    },
                    body: file
                }
            );

            if (!uploadResponse.ok) {

                const uploadError = await uploadResponse.text();

                if (adminSessionExpired(uploadResponse.status, uploadError)) {
                    return;
                }

                throw new Error(
                    "Image upload failed: " + uploadError
                );
            }

            imageUrl =
                SUPABASE_URL +
                "/storage/v1/object/public/product-images/" +
                fileName;

        }

        const packageData = {
            package_key: pkg.key,
            title: pkg.title,
            image_url: imageUrl,
            offer_price: price,
            active: true,
            sort_order: pkg.order
        };

        let saveResponse;

        if (oldOffer) {

            saveResponse = await fetch(
                SUPABASE_URL +
                "/rest/v1/sale_offers?id=eq." + oldOffer.id,
                {
                    method: "PATCH",
                    headers: {
                        "apikey": SUPABASE_KEY,
                        "Authorization": "Bearer " + token,
                        "Content-Type": "application/json",
                        "Prefer": "return=representation"
                    },
                    body: JSON.stringify(packageData)
                }
            );

        } else {

            saveResponse = await fetch(
                SUPABASE_URL + "/rest/v1/sale_offers",
                {
                    method: "POST",
                    headers: {
                        "apikey": SUPABASE_KEY,
                        "Authorization": "Bearer " + token,
                        "Content-Type": "application/json",
                        "Prefer": "return=representation"
                    },
                    body: JSON.stringify(packageData)
                }
            );

        }

        if (!saveResponse.ok) {

            const saveError = await saveResponse.text();

            if (adminSessionExpired(saveResponse.status, saveError)) {
                return;
            }

            throw new Error(
                "Package save failed: " + saveError
            );
        }

      const savedData = await saveResponse.clone().text();
      console.log("Combo save response:", savedData);
      
      alert(pkg.title + " saved successfully.");

        await loadSaleOffers();

    } catch (error) {

        console.error("Combo package save error:", error);

        alert(
            "Combo Package Error:\n\n" +
            error.message
        );

    } finally {

        button.disabled = false;

    }

}


/* =====================================
   START
===================================== */

document.addEventListener("DOMContentLoaded", function() {
    loadSaleOffers();
});
