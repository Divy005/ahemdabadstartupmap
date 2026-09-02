/*
 * Startup India harvester — run this in your BROWSER, not in Node.
 *
 * The DPIIT register is the only source with Ahmedabad startups at the
 * thousands scale. It is behind a JavaScript-rendered search page, so the
 * practical way to get it out is from the page itself, where you are already
 * a normal logged-out visitor reading a public register.
 *
 * How to use it:
 *   1. Open https://www.startupindia.gov.in/content/sih/en/search.html
 *      Set filters: Role = Startup, State = Gujarat, City = Ahmedabad.
 *   2. Open DevTools (F12) -> Console.
 *   3. Paste this whole file and press Enter.
 *   4. It pages through the results, then downloads startup-india-ahmedabad.csv.
 *   5. Feed it straight to the importer:
 *        npm run import -- startup-india-ahmedabad.csv --merge \
 *          --geocode --email you@example.com
 *
 * It paces itself at one page every 1.5s. Leave that alone — it keeps the
 * load comparable to a person clicking through, which is the point.
 */
(async () => {
  const PAGE_DELAY_MS = 1500;
  const MAX_PAGES = 400;          // safety stop
  const rows = [];
  const seen = new Set();

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const text = (el, sel) => (el.querySelector(sel)?.textContent || "").trim();

  /* Card markup has shifted over the years, so try a few shapes. */
  function readCards() {
    const cards = document.querySelectorAll(
      '[id*="persona-results"] .col-md-4, .search-results .col-md-4, .events-card, .img-wrap',
    );
    let fresh = 0;
    cards.forEach((card) => {
      const name =
        text(card, ".events-details h3") ||
        text(card, "h3") ||
        text(card, ".title") ||
        (card.getAttribute("title") || "").trim();
      if (!name || seen.has(name)) return;

      const details = (text(card, ".events-details") || card.textContent || "")
        .split("\n").map((s) => s.trim()).filter(Boolean);

      const link = card.querySelector("a")?.href || "";
      // Lines after the name are usually [stage, location] in some order.
      const rest = details.filter((d) => d !== name);
      const location = rest.find((d) => /,|gujarat|ahmedabad/i.test(d)) || "";
      const stage = rest.find((d) => /stage|seed|series|prototype|ideation|scaling|validation/i.test(d)) || "";

      seen.add(name);
      rows.push({
        "Company Name": name,
        Stage: stage,
        "Full Address": location,
        Website: link,
        About: rest.filter((d) => d !== location && d !== stage).join(" ").slice(0, 300),
      });
      fresh++;
    });
    return fresh;
  }

  function goToPage(n) {
    const url = new URL(window.location.href);
    url.searchParams.set("page", String(n));
    // The page re-renders results client-side on hash/search change.
    window.history.pushState({}, "", url.toString());
    window.dispatchEvent(new PopStateEvent("popstate"));
    const next =
      document.querySelector('a[aria-label="Next"], .pagination .next a, [class*="next"] a');
    if (next) next.click();
  }

  console.log("harvesting… leave this tab focused");
  for (let page = 0; page < MAX_PAGES; page++) {
    const fresh = readCards();
    console.log(`page ${page}: +${fresh} (total ${rows.length})`);
    // Two consecutive pages with nothing new means we have reached the end.
    if (fresh === 0 && page > 0) break;
    goToPage(page + 1);
    await sleep(PAGE_DELAY_MS);
  }

  if (rows.length === 0) {
    console.warn(
      "No cards matched. The page markup has probably changed — inspect a result card and update the selectors in readCards().",
    );
    return;
  }

  const headers = Object.keys(rows[0]);
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "startup-india-ahmedabad.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();

  console.log(`done — ${rows.length} startups written to startup-india-ahmedabad.csv`);
})();
