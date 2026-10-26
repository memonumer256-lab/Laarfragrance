// generate-blog.js
// Chalane ka tareeqa (website ke root folder main): node generate-blog.js
// Node 18 ya naya chahiye (built-in fetch ke liye).

const fs = require("fs");
const path = require("path");

const SUPABASE_URL = "https://emworxswydgeebwjshoj.supabase.co";
const SUPABASE_KEY = "sb_publishable_PGZcWNslHusFmxHSGI-eLg_jqGKar3h";
const SITE = "https://laarfragrance.com";
const OUT_DIR = "blog";

const STATIC_PAGES = [
  "/",
  "/collection.html",
  "/combos.html",
  "/about.html",
  "/contact.html",
  "/blog.html",
];

function esc(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Text escape karo, phir [text](https://...) ko link bana do
function inline(text) {
  return esc(text).replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );
}

function renderContent(content) {
  return String(content || "")
    .split(/\n\s*\n/)
    .map((raw) => raw.trim())
    .filter(Boolean)
    .map((p) => {
      // Agar admin ka content pehle se HTML hai (<p>, <h2> wagera), to jaisa hai waisa rakho
      if (p.startsWith("<")) return p;
      if (p.startsWith("### ")) return `<h3>${inline(p.slice(4))}</h3>`;
      if (p.startsWith("## ")) return `<h2>${inline(p.slice(3))}</h2>`;
      return `<p>${inline(p)}</p>`;
    })
    .join("\n");
}

function renderPrevNext(prev, next) {
  if (!prev && !next) return "";

  const linkStyle = "display:block; flex:1 1 220px; text-decoration:none; color:#17130f;";
  const labelStyle =
    "display:block; font-size:11px; letter-spacing:2px; font-weight:bold; color:#8b6f47; margin-bottom:8px;";
  const titleStyle = "display:block; font-size:16px; font-weight:600; line-height:1.4;";

  let html =
    '<div class="article-prev-next" role="navigation" aria-label="More articles" ' +
    'style="display:flex; flex-wrap:wrap; gap:25px; margin-top:50px; padding-top:25px; border-top:1px solid #ddd4c8;">';

  if (prev) {
    html +=
      `<a href="/${OUT_DIR}/${prev.slug}.html" style="${linkStyle}">` +
      `<span style="${labelStyle}">← PREVIOUS ARTICLE</span>` +
      `<span style="${titleStyle}">${esc(prev.title)}</span></a>`;
  }
  if (next) {
    html +=
      `<a href="/${OUT_DIR}/${next.slug}.html" style="${linkStyle} text-align:right; margin-left:auto;">` +
      `<span style="${labelStyle}">NEXT ARTICLE →</span>` +
      `<span style="${titleStyle}">${esc(next.title)}</span></a>`;
  }
  return html + "</div>";
}

function renderRelated(related) {
  if (!related || related.length === 0) return "";

  const cards = related
    .map((b) => {
      const link = `/${OUT_DIR}/${b.slug}.html`;
      return (
        '<article class="related-article-card">' +
        (b.image_url ? `<img src="${esc(b.image_url)}" alt="${esc(b.title)}">` : "") +
        '<div class="related-article-content">' +
        `<div class="related-article-category">${esc(b.category || "FRAGRANCE")}</div>` +
        `<h3><a href="${link}" style="color: inherit; text-decoration: none;">${esc(b.title)}</a></h3>` +
        `<a class="related-article-button" href="${link}" style="display:inline-block; text-decoration:none;">READ ARTICLE</a>` +
        "</div></article>"
      );
    })
    .join("");

  return (
    '<section class="related-articles"><h2>Related Articles</h2>' +
    `<div class="related-articles-grid">${cards}</div></section>`
  );
}

function renderPage(blog, prev, next, related) {
  const url = `${SITE}/${OUT_DIR}/${blog.slug}.html`;
  const title = blog.seo_title || blog.title || "Laar Fragrance Blog";
  const desc = blog.seo_description || blog.excerpt || "";
  const image = blog.image_url || `${SITE}/Images/Laar.png`;

  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.title,
    description: desc,
    image: blog.image_url ? [blog.image_url] : [],
    author: { "@type": "Organization", name: "Laar Fragrance" },
    publisher: {
      "@type": "Organization",
      name: "Laar Fragrance",
      logo: { "@type": "ImageObject", url: `${SITE}/Images/Laar.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: blog.created_at,
  }).replace(/</g, "\\u003c");

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(desc)}">
    <link rel="canonical" href="${url}">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(desc)}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${esc(image)}">
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="/blog-style.css">
    <link rel="icon" type="image/png" href="/Images/Laar.png">
    <script type="application/ld+json">${schema}</script>
</head>
<body>
    <header>
        <img src="/Images/Laar.png" alt="Laar Fragrance Logo" class="logo">
        <nav>
            <a href="/index.html">Home</a>
            <a href="/combos.html">Combos</a>
            <a href="/collection.html">Collection</a>
            <a href="/about.html">About</a>
            <a href="/contact.html">Contact</a>
            <a href="/blog.html">Blog</a>
        </nav>
    </header>

    <main class="article-page">
        <article id="articleContainer">
            ${blog.image_url ? `<img src="${esc(blog.image_url)}" alt="${esc(blog.title)}" class="article-image">` : ""}
            <div class="article-category">${esc(blog.category || "FRAGRANCE")}</div>
            <h1>${esc(blog.title)}</h1>
            <p class="article-excerpt">${esc(blog.excerpt || "")}</p>
            <div class="article-content">
${renderContent(blog.content)}
            </div>
            ${renderPrevNext(prev, next)}
            ${renderRelated(related)}
        </article>
    </main>

    <footer>
        <img src="/Images/Laar.png" alt="Laar Fragrance Logo" class="logo">
        <p>Premium fragrances from Pakistan.</p>
        <a href="/blog.html" class="footer-blog-link">Blog</a><br>
        <a href="/about.html" class="footer-about-link">About Us</a><br>
        <a href="/contact.html" class="footer-contact-button">CONTACT US</a>
        <div class="social-links">
            <a href="https://www.facebook.com/Laarfragrance" target="_blank" rel="noopener">Facebook</a>
            <a href="https://www.instagram.com/Laarfragrance" target="_blank" rel="noopener">Instagram</a>
            <a href="https://wa.me/923322522468" target="_blank" rel="noopener">WhatsApp</a>
        </div>
        <p>© 2026 Laar Fragrance. All rights reserved.</p>
    </footer>

    <button type="button" class="back-button" onclick="window.history.back()">← Back</button>
</body>
</html>
`;
}

function renderSitemap(blogs) {
  const urls = [];
  for (const p of STATIC_PAGES) {
    urls.push(`    <url>\n        <loc>${SITE}${p}</loc>\n    </url>`);
  }
  for (const b of blogs) {
    const lastmod = b.created_at ? String(b.created_at).slice(0, 10) : "";
    urls.push(
      `    <url>\n        <loc>${SITE}/${OUT_DIR}/${b.slug}.html</loc>` +
        (lastmod ? `\n        <lastmod>${lastmod}</lastmod>` : "") +
        `\n    </url>`
    );
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

async function main() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/blog?status=eq.published&select=*&order=created_at.desc`,
    { headers: { apikey: SUPABASE_KEY } }
  );
  if (!res.ok) {
    throw new Error("Supabase error: " + res.status + " " + (await res.text()));
  }

  const blogs = (await res.json()).filter((b) => /^[a-z0-9-]+$/i.test(b.slug || ""));
  if (blogs.length === 0) {
    throw new Error("Koi published article nahi mila, kuch nahi badla gaya.");
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // blogs naye se purane order main hain (created_at desc)
  blogs.forEach((blog, i) => {
    const next = i > 0 ? blogs[i - 1] : null; // zyada naya article
    const prev = i < blogs.length - 1 ? blogs[i + 1] : null; // zyada purana article
    const related = blogs
      .filter((b) => b.slug !== blog.slug && b.category && b.category === blog.category)
      .slice(0, 3);

    fs.writeFileSync(
      path.join(OUT_DIR, blog.slug + ".html"),
      renderPage(blog, prev, next, related)
    );
    console.log("Bana:", `${OUT_DIR}/${blog.slug}.html`);
  });

  // Jo article admin se delete/unpublish ho gaye, unki static files bhi hata do
  const keep = new Set(blogs.map((b) => b.slug + ".html"));
  for (const file of fs.readdirSync(OUT_DIR)) {
    if (file.endsWith(".html") && !keep.has(file)) {
      fs.unlinkSync(path.join(OUT_DIR, file));
      console.log("Hata diya:", `${OUT_DIR}/${file}`);
    }
  }

  fs.writeFileSync("sitemap.xml", renderSitemap(blogs));
  console.log("sitemap.xml update ho gaya (" + blogs.length + " articles)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
