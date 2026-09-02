# Company logos

Drop a logo file here (PNG or SVG, square, ideally 128×128 or larger) and point
the company's `logo` field in `data/startups.json` at it:

```json
"logo": "/logos/petpooja.png"
```

Entries without a `logo` render a sector-tinted letter avatar instead, which is
what every entry currently uses — no third-party logo files are bundled with
this repo.
