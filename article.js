/* =========================
   SINGLE BLOG ARTICLE
========================= */

const SUPABASE_URL =
    "https://emworxswydgeebwjshoj.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_PGZcWNslHusFmxHSGI-eLg_jqGKar3h";


/* =========================
   SAFE TEXT HELPER
========================= */

function escapeHTML(text) {

    return String(text ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

}


/* =========================
   RELATED ARTICLES
========================= */

async function loadRelatedArticles(currentBlog) {

    try {

        let articleContainer =
            document.getElementById(
                "articleContainer"
            );

        if (!articleContainer) {
            return;
        }


        let response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/blog?category=eq." +
                encodeURIComponent(currentBlog.category) +
                "&status=eq.published&select=id,title,slug,image_url,category&id=neq." +
                currentBlog.id +
                "&order=created_at.desc&limit=3",
                {
                    method: "GET",

                    headers: {
                        "apikey":
                            SUPABASE_KEY
                    }
                }
            );


        if (!response.ok) {
            return;
        }


        let relatedBlogs =
            await response.json();


        if (
            !relatedBlogs ||
            relatedBlogs.length === 0
        ) {
            return;
        }


        let relatedSection =
            document.createElement("section");

        relatedSection.className =
            "related-articles";


        relatedSection.innerHTML = `
            <h2>Related Articles</h2>

            <div class="related-articles-grid"></div>
        `;


        let grid =
            relatedSection.querySelector(
                ".related-articles-grid"
            );


        relatedBlogs.forEach(function(blog) {

            let card =
                document.createElement("article");

            card.className =
                "related-article-card";


            let articleLink =
                "article.html?slug=" +
                encodeURIComponent(
                    blog.slug
                );


            card.innerHTML = `

                ${
                    blog.image_url
                        ? `
                            <img
                                src="${escapeHTML(blog.image_url)}"
                                alt="${escapeHTML(blog.title)}"
                            >
                          `
                        : ""
                }

                <div class="related-article-content">

                    <div class="related-article-category">
                        ${escapeHTML(blog.category || "FRAGRANCE")}
                    </div>

                    <h3>
                        <a
                            href="${escapeHTML(articleLink)}"
                            style="color: inherit; text-decoration: none;"
                        >${escapeHTML(blog.title)}</a>
                    </h3>

                    <button
                        type="button"
                        class="related-article-button"
                    >
                        READ ARTICLE
                    </button>

                </div>
            `;


            let button =
                card.querySelector(
                    ".related-article-button"
                );


            button.addEventListener(
                "click",
                function() {

                    window.location.href =
                        articleLink;

                }
            );


            grid.appendChild(card);

        });


        articleContainer.appendChild(
            relatedSection
        );

    } catch (error) {

        console.log(
            "Related articles error:",
            error
        );

    }

}


/* =========================
   PREVIOUS / NEXT ARTICLE
========================= */

async function loadPrevNextArticles(currentBlog) {

    try {

        let articleContainer =
            document.getElementById(
                "articleContainer"
            );

        if (
            !articleContainer ||
            !currentBlog.created_at
        ) {
            return;
        }


        let time =
            encodeURIComponent(
                currentBlog.created_at
            );


        let base =
            SUPABASE_URL +
            "/rest/v1/blog?status=eq.published" +
            "&select=title,slug&limit=1";


        let options = {

            method: "GET",

            headers: {
                "apikey":
                    SUPABASE_KEY
            }

        };


        let results =
            await Promise.all([

                fetch(
                    base +
                    "&created_at=lt." + time +
                    "&order=created_at.desc",
                    options
                ),

                fetch(
                    base +
                    "&created_at=gt." + time +
                    "&order=created_at.asc",
                    options
                )

            ]);


        let previousBlog = null;

        let nextBlog = null;


        if (results[0].ok) {

            let list =
                await results[0].json();

            if (list.length > 0) {
                previousBlog = list[0];
            }

        }


        if (results[1].ok) {

            let list =
                await results[1].json();

            if (list.length > 0) {
                nextBlog = list[0];
            }

        }


        if (!previousBlog && !nextBlog) {
            return;
        }


        let linkStyle =
            "display:block; flex:1 1 220px; " +
            "text-decoration:none; color:#17130f;";


        let labelStyle =
            "display:block; font-size:11px; " +
            "letter-spacing:2px; font-weight:bold; " +
            "color:#8b6f47; margin-bottom:8px;";


        let titleStyle =
            "display:block; font-size:16px; " +
            "font-weight:600; line-height:1.4;";


        let nav =
            document.createElement("div");

        nav.className =
            "article-prev-next";

        nav.setAttribute(
            "role",
            "navigation"
        );

        nav.setAttribute(
            "aria-label",
            "More articles"
        );

        nav.style.cssText =
            "display:flex; flex-wrap:wrap; gap:25px; " +
            "margin-top:50px; padding-top:25px; " +
            "border-top:1px solid #ddd4c8;";


        let html = "";


        if (previousBlog) {

            html += `
                <a
                    href="article.html?slug=${escapeHTML(encodeURIComponent(previousBlog.slug))}"
                    style="${linkStyle}"
                >
                    <span style="${labelStyle}">
                        ← PREVIOUS ARTICLE
                    </span>
                    <span style="${titleStyle}">
                        ${escapeHTML(previousBlog.title)}
                    </span>
                </a>
            `;

        }


        if (nextBlog) {

            html += `
                <a
                    href="article.html?slug=${escapeHTML(encodeURIComponent(nextBlog.slug))}"
                    style="${linkStyle} text-align:right; margin-left:auto;"
                >
                    <span style="${labelStyle}">
                        NEXT ARTICLE →
                    </span>
                    <span style="${titleStyle}">
                        ${escapeHTML(nextBlog.title)}
                    </span>
                </a>
            `;

        }


        nav.innerHTML = html;


        articleContainer.appendChild(
            nav
        );

    } catch (error) {

        console.log(
            "Previous / next articles error:",
            error
        );

    }

}


/* =========================
   SINGLE ARTICLE
========================= */

async function loadSingleBlogArticle() {

    let articleContainer =
        document.getElementById(
            "articleContainer"
        );

    if (!articleContainer) {
        return;
    }


    let params =
        new URLSearchParams(
            window.location.search
        );

    let slug =
        params.get("slug");


    if (!slug) {

        articleContainer.innerHTML =
            "<p>Article not found.</p>";

        return;
    }


    try {

        let response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/blog?slug=eq." +
                encodeURIComponent(slug) +
                "&status=eq.published&select=*",
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

            articleContainer.innerHTML =
                "<p>Article load nahi ho saka.</p>";

            return;
        }


        let blogs =
            await response.json();


        if (blogs.length === 0) {

            articleContainer.innerHTML =
                "<p>Article not found.</p>";

            return;
        }


        let blog =
            blogs[0];


        /* SEO TITLE */

        document.title =
            blog.seo_title ||
            blog.title ||
            "Laar Fragrance Blog";


        /* META DESCRIPTION */

        let metaDescription =
            document.querySelector(
                'meta[name="description"]'
            );


        if (metaDescription) {

            metaDescription.setAttribute(
                "content",
                blog.seo_description ||
                blog.excerpt ||
                ""
            );

        }


        /* ARTICLE SCHEMA */

        let oldSchema =
            document.getElementById(
                "articleSchema"
            );


        if (oldSchema) {
            oldSchema.remove();
        }


        let schema =
            document.createElement("script");


        schema.type =
            "application/ld+json";


        schema.id =
            "articleSchema";


        schema.textContent =
            JSON.stringify({

                "@context":
                    "https://schema.org",

                "@type":
                    "Article",

                "headline":
                    blog.title,

                "description":
                    blog.seo_description ||
                    blog.excerpt ||
                    "",

                "image":
                    blog.image_url
                        ? [blog.image_url]
                        : [],

                "author": {

                    "@type":
                        "Organization",

                    "name":
                        "Laar Fragrance"

                },

                "publisher": {

                    "@type":
                        "Organization",

                    "name":
                        "Laar Fragrance",

                    "logo": {

                        "@type":
                            "ImageObject",

                        "url":
                            "https://laarfragrance.com/Images/Laar.png"

                    }

                },

                "mainEntityOfPage": {

                    "@type":
                        "WebPage",

                    "@id":
                        window.location.href

                },

                "datePublished":
                    blog.created_at

            });


        document.head.appendChild(
            schema
        );


        /* ARTICLE CANONICAL */

let canonical =
    document.querySelector(
        'link[rel="canonical"]'
    );

if (!canonical) {

    canonical =
        document.createElement("link");

    canonical.rel = "canonical";

    document.head.appendChild(canonical);

}

canonical.href =
    "https://laarfragrance.com/blog/" +
    encodeURIComponent(blog.slug) + ".html";


        /* ARTICLE OPEN GRAPH */

        function setOgMeta(
            property,
            content
        ) {

            let meta =
                document.querySelector(
                    'meta[property="' +
                    property +
                    '"]'
                );


            if (!meta) {

                meta =
                    document.createElement("meta");

                meta.setAttribute(
                    "property",
                    property
                );

                document.head.appendChild(
                    meta
                );

            }


            meta.setAttribute(
                "content",
                content || ""
            );

        }


        setOgMeta(
            "og:title",
            blog.seo_title ||
            blog.title ||
            "Laar Fragrance Blog"
        );


        setOgMeta(
            "og:description",
            blog.seo_description ||
            blog.excerpt ||
            ""
        );


        setOgMeta(
            "og:type",
            "article"
        );


        setOgMeta(
            "og:url",
            window.location.href
        );


        setOgMeta(
            "og:image",
            blog.image_url ||
            "https://laarfragrance.com/Images/Laar.png"
        );


        /* ARTICLE CONTENT */

        articleContainer.innerHTML = `

            ${
                blog.image_url
                    ? `
                        <img
                            src="${escapeHTML(blog.image_url)}"
                            alt="${escapeHTML(blog.title)}"
                            class="article-image"
                        >
                      `
                    : ""
            }


            <div class="article-category">
                ${escapeHTML(blog.category || "FRAGRANCE")}
            </div>


            <h1>
                ${escapeHTML(blog.title)}
            </h1>


            <p class="article-excerpt">
                ${escapeHTML(blog.excerpt || "")}
            </p>


            <div class="article-content">

                ${
                    String(blog.content || "")
                        .split(/\n\s*\n/)
                        .map(function(paragraph) {

                            if (!paragraph.trim()) {
                                return "";
                            }


                            let linkedText =
                                paragraph.trim()
                                    .replace(
                                        /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
                                        function(
                                            match,
                                            text,
                                            url
                                        ) {

                                            return `
                                                <a
                                                    href="${url}"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >${text}</a>
                                            `;

                                        }
                                    );


                            if (
    linkedText.startsWith(
        "### "
    )
) {

    let headingText =
        linkedText.substring(4);

    let headingLinkMatch =
        headingText.match(
            /^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/
        );

    if (headingLinkMatch) {

        return `
            <h3>
                <a
                    href="${headingLinkMatch[2]}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    ${headingLinkMatch[1]}
                </a>
            </h3>
        `;

    }

    return `
        <h3>
            ${headingText}
        </h3>
    `;

}


if (
    linkedText.startsWith(
        "## "
    )
) {

    let headingText =
        linkedText.substring(3);

    let headingLinkMatch =
        headingText.match(
            /^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/
        );

    if (headingLinkMatch) {

        return `
            <h2>
                <a
                    href="${headingLinkMatch[2]}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    ${headingLinkMatch[1]}
                </a>
            </h2>
        `;

    }

    return `
        <h2>
            ${headingText}
        </h2>
    `;

}


                            return `
                                <p>
                                    ${linkedText}
                                </p>
                            `;

                        })
                        .join("")
                }

            </div>

        `;


        /* PREVIOUS / NEXT ARTICLE */

        await loadPrevNextArticles(blog);


        /* LOAD RELATED ARTICLES */

        loadRelatedArticles(blog);

    } catch (error) {

        console.log(error);

        articleContainer.innerHTML =
            "<p>Internet connection problem.</p>";

    }

}


/* =========================
   LOAD ARTICLE
========================= */

loadSingleBlogArticle();
