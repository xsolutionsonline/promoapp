const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

// Crawlers that fetch a link's HTML WITHOUT executing JavaScript. Angular's
// dynamically-set <title>/meta tags (see product-detail.page.ts) never reach
// these — they need real tags in the raw HTML response, which is exactly
// what this function serves them. Real users/browsers (and JS-capable
// crawlers like Googlebot) fall through to the normal Angular SPA below.
const BOT_UA_PATTERN = /facebookexternalhit|Facebot|WhatsApp|Twitterbot|LinkedInBot|Slackbot|TelegramBot|Discordbot|Pinterest|Googlebot|bingbot|Applebot|SkypeUriPreview|redditbot|vkShare|W3C_Validator|Embedly|Quora Link Preview|Iframely/i;

// In-memory per-instance cache of the built index.html, keyed by origin
// (host), so warm function instances don't re-fetch it on every human
// request. Short TTL so a new deploy's hashed bundle filenames propagate
// quickly without needing to redeploy this function.
const indexHtmlCache = new Map(); // origin -> { html, fetchedAt }
const INDEX_CACHE_TTL_MS = 5 * 60 * 1000;

function getOrigin(req) {
  const proto = req.get('x-forwarded-proto') || req.protocol || 'https';
  return `${proto}://${req.get('host')}`;
}

async function getSpaIndexHtml(origin) {
  const cached = indexHtmlCache.get(origin);
  const now = Date.now();
  if (cached && (now - cached.fetchedAt) < INDEX_CACHE_TTL_MS) {
    return cached.html;
  }
  const response = await fetch(`${origin}/index.html`);
  const html = await response.text();
  indexHtmlCache.set(origin, { html, fetchedAt: now });
  return html;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripHtml(html) {
  return String(html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function truncate(text, max) {
  const clean = (text || '').trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trim()}…` : clean;
}

function buildProductHtml(product, productId, origin) {
  const title = truncate(product.seo?.metaTitle || product.title || 'Producto', 70);
  const description = truncate(
    stripHtml(product.seo?.metaDescription || product.text || product.description || ''),
    160
  );
  const image = product.seo?.ogImage || product.showcaseImageUrl || product.img || '';
  const url = `${origin}/product-detail/${productId}`;

  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.title || '',
    description: stripHtml(product.description || '') || description,
    image: image ? [image] : undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'COP',
      price: product.price ? String(product.price) : undefined,
      availability: 'https://schema.org/InStock',
      url
    }
  };
  if (product.ratingValue && product.reviewsCount) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(product.ratingValue),
      reviewCount: String(product.reviewsCount)
    };
  }

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${escapeHtml(url)}">
<meta property="og:type" content="product">
<meta property="og:site_name" content="Eurocity">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="${escapeHtml(image)}">
<meta property="og:url" content="${escapeHtml(url)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${escapeHtml(image)}">
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>
<h1>${escapeHtml(title)}</h1>
<p>${escapeHtml(description)}</p>
<p><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p>
</body>
</html>`;
}

exports.productSocialPreview = functions.https.onRequest(async (req, res) => {
  const origin = getOrigin(req);
  const userAgent = req.get('user-agent') || '';
  const isBot = BOT_UA_PATTERN.test(userAgent);

  const match = (req.path || '').match(/\/product-detail\/([^/]+)/);
  const productId = match ? decodeURIComponent(match[1]) : null;

  // Real users (and JS-executing crawlers) get the normal Angular app —
  // Angular's own Title/Meta service takes it from there once it boots.
  if (!isBot || !productId) {
    try {
      res.set('Cache-Control', 'public, max-age=60');
      res.status(200).set('Content-Type', 'text/html; charset=utf-8').send(await getSpaIndexHtml(origin));
    } catch (error) {
      console.error('productSocialPreview: failed to proxy SPA index.html', error);
      res.redirect(302, `${origin}/index.html`);
    }
    return;
  }

  try {
    const snap = await db.collection('products').doc(productId).get();
    if (!snap.exists) {
      res.status(200).set('Content-Type', 'text/html; charset=utf-8').send(await getSpaIndexHtml(origin));
      return;
    }
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    res.status(200).set('Content-Type', 'text/html; charset=utf-8').send(buildProductHtml(snap.data(), productId, origin));
  } catch (error) {
    console.error('productSocialPreview: error rendering product', productId, error);
    try {
      res.status(200).set('Content-Type', 'text/html; charset=utf-8').send(await getSpaIndexHtml(origin));
    } catch (fallbackError) {
      res.status(500).send('Error');
    }
  }
});
