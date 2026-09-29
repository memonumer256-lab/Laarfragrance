document.querySelectorAll(".collection-size-option").forEach(function(button) {

    button.addEventListener("click", function() {

        let parent = button.parentElement;

        parent.querySelectorAll(".collection-size-option").forEach(function(item) {
            item.classList.remove("active");
        });

        button.classList.add("active");

    });

});


document.querySelectorAll(".collection-shop-button").forEach(function(button) {

    button.addEventListener("click", function() {

        let product = button.closest(".collection-product");

        let name = product.querySelector("h2").textContent.trim();

        let selectedSize =
            product.querySelector(".collection-size-option.active");

        let size =
            selectedSize.dataset.size;

        let price =
            Number(selectedSize.dataset.price);

        let image =
    product.querySelector(".collection-image img").getAttribute("src");

if (size === "5ml") {

    if (name === "Breeze") {
        image = "Images/Breezet.jpg";
    } else if (name === "Ruby Oud") {
        image = "Images/Rubyt.jpg";
    } else if (name === "Blue Savage") {
        image = "Images/Bluet.jpg";
    } else if (name === "Secrete Night") {
        image = "Images/Nightt.jpg";
    }

}
else if (size === "10ml") {

    if (name === "Breeze") {
        image = "Images/Breezet.jpg";
    } else if (name === "Ruby Oud") {
        image = "Images/Rubyt.jpg";
    } else if (name === "Blue Savage") {
        image = "Images/Bluet.jpg";
    } else if (name === "Secrete Night") {
        image = "Images/Nightt.jpg";
    }

};

        let productName =
            name + " - " + size;

        addToCart(
            productName,
            price,
            image
        );

    });

});