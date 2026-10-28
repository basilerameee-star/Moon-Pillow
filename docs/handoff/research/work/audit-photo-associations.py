import collections
import hashlib
import json
import pathlib
import re
import unicodedata

ROOT = pathlib.Path(__file__).resolve().parent


def norm(value):
    return re.sub(r"\s+", " ", "".join(c for c in unicodedata.normalize("NFKD", str(value)) if not unicodedata.combining(c)).lower()).strip()


def all_images(product):
    return [im for color in product.get("colors", []) for im in color.get("images", [])] + product.get("gallery", [])


files = ["specialist-expanded-2026-10-25.json", "cj-expanded-2026-10-25.json"]
products = [p for filename in files for p in json.loads((ROOT / filename).read_text(encoding="utf-8"))["products"]]
by_id = {p["id"]: p for p in products}

report = {
    "checkedAt": "2026-10-25",
    "scope": files,
    "method": "Read-only audit of normalized source data and their normalizers; exact URL overlap, label identity, grouping keys and existing local file hashes. No visual verification is implied by image counts.",
    "summary": {
        "candidateGroups": len(products),
        "sourceCounts": dict(collections.Counter(p["source"] for p in products)),
        "confirmedVisuallyDistinctModels": None,
        "confirmedCompleteTwoColorsThreeExactPhotosEach": 0,
        "colorLabels": sum(len(p["colors"]) for p in products),
        "exactColorAssociationsMarkedVerified": sum(c.get("associationVerified") is True for p in products for c in p["colors"]),
        "missingAssociationVerifiedFieldColors": sum("associationVerified" not in c for p in products for c in p["colors"]),
        "rawColorImagePlacements": sum(len(c["images"]) for p in products for c in p["colors"]),
        "generalGalleryImagePlacements": sum(len(p["gallery"]) for p in products),
        "twoLabelAndThreeUrlsPerLabelUnverifiedGroups": sum(len(p["colors"]) >= 2 and all(len(c["images"]) >= 3 for c in p["colors"]) for p in products),
    },
    "exactIdentityDuplicates": {},
    "duplicateColorIdentityGroups": [],
    "sameUrlAcrossDifferentColors": [],
    "sameUrlAcrossModels": [],
    "identicalFullImageSetAcrossModels": [],
    "sameNameDifferentGroupChecks": [],
    "localHashAudit": {},
    "beigePriorityForVisualReview": [],
    "rules": [
        "A supplier SKU gallery is not proof that every image depicts the exact SKU color, nor that three URLs give three distinct useful views.",
        "Every specialist color currently has associationVerified=false. CJ colors omit the flag and have empty images: treat missing as false, never as verified.",
        "Do not promote raw two-color/three-URL counts into fulfilled user requirements without visual review and supplier matching.",
        "CJ general galleries must stay separate from color galleries until images have been matched to the exact labels.",
        "A beige-like term in a model title or in a multicolored motif does not establish a plain beige product photograph.",
        "Different sizes and colors must not be counted as different models; conversely different fabric/density/pack composition must not be silently merged.",
        "Model groups are source-derived candidates, not a certified count of commercially distinct, stocked, approved sellable products.",
    ],
}

for field in ["id", "sourceUrl", "supplierProductId"]:
    groups = collections.defaultdict(list)
    for p in products:
        groups[str(p.get(field))].append(p["id"])
    report["exactIdentityDuplicates"][field] = [{"value": k, "models": v} for k, v in groups.items() if len(v) > 1]

url_products = collections.defaultdict(set)
photo_set_models = collections.defaultdict(list)
for p in products:
    color_ids = collections.defaultdict(list)
    color_labels = collections.defaultdict(list)
    url_colors = collections.defaultdict(list)
    for color in p["colors"]:
        color_ids[color.get("id")].append(color["name"])
        color_labels[norm(color["name"])].append(color["name"])
        for im in color["images"]:
            url_colors[im["url"]].append(color["name"])
    duplicate_ids = {key: vals for key, vals in color_ids.items() if len(vals) > 1}
    duplicate_labels = {key: vals for key, vals in color_labels.items() if len(vals) > 1}
    if duplicate_ids or duplicate_labels:
        report["duplicateColorIdentityGroups"].append({"id": p["id"], "duplicateIds": duplicate_ids, "duplicateNormalizedNames": duplicate_labels})
    for url, colors in url_colors.items():
        if len(set(colors)) > 1:
            report["sameUrlAcrossDifferentColors"].append({"modelId": p["id"], "url": url, "colors": colors, "action": "Do not map this image as an exact color photo for each label. Keep only as a general gallery image unless visual proof identifies one exact color."})
    urls = set(im["url"] for im in all_images(p))
    for url in urls:
        url_products[url].add(p["id"])
    if urls:
        photo_set_models[tuple(sorted(urls))].append(p["id"])

report["sameUrlAcrossModels"] = [{"url": u, "models": sorted(ids)} for u, ids in url_products.items() if len(ids) > 1]
report["identicalFullImageSetAcrossModels"] = [{"models": ids, "urls": list(urls)} for urls, ids in photo_set_models.items() if len(ids) > 1]

by_name = collections.defaultdict(list)
for p in products:
    by_name[norm(p["nameFR"])].append(p)
for name, group in by_name.items():
    if len(group) < 2:
        continue
    checks = []
    for p in group:
        checks.append({"id": p["id"], "materials": p.get("materials", []), "sizes": p["sizes"], "sourceUrl": p["sourceUrl"], "colors": [c["name"] for c in p["colors"]], "threadFeatures": sorted(set(v.get("features", {}).get("Nombre de fils", "") for v in p.get("variants", []))), "densityFeatures": sorted(set(v.get("features", {}).get("Grammage (g/m²)", "") for v in p.get("variants", [])))})
    report["sameNameDifferentGroupChecks"].append({"normalizedName": name, "groups": checks, "action": "Potential regrouping review, not an automatic duplicate deletion. Compare exact composition/thread count/pack; source contradictions require confirmation."})

local_files = []
for p in products:
    for im in all_images(p):
        path = pathlib.Path(im["localpath"]) if im.get("localpath") else None
        if path and path.exists():
            local_files.append((p["id"], im["url"], path))
hashes = collections.defaultdict(list)
for model_id, url, path in local_files:
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    hashes[digest].append({"modelId": model_id, "url": url, "path": str(path)})
report["localHashAudit"] = {"localFilesFound": len(local_files), "uniqueHashes": len(hashes), "duplicateContentGroups": [{"sha256": digest, "images": rows} for digest, rows in hashes.items() if len(set(r["url"] for r in rows)) > 1], "limitation": "No image can be declared visually distinct from a URL/hash alone. Absent local assets cannot be content-hashed."}

priority_ids = ["pd-25868", "pd-25300", "pd-25080", "pd-25860", "pd-25600", "pd-26025", "pd-24850", "pd-20931", "pd-25536", "aw-cicc-18"]
for model_id in priority_ids:
    p = by_id.get(model_id)
    if not p:
        continue
    beige = [c for c in p["colors"] if re.search(r"beige|sable|ecru|naturel|cream|ficelle|lin$", norm(c["name"]))]
    if not beige:
        continue
    report["beigePriorityForVisualReview"].append({"modelId": p["id"], "name": p["nameFR"], "sourceUrl": p["sourceUrl"], "colorCount": len(p["colors"]), "totalModelUrls": len(set(i["url"] for i in all_images(p))), "beigeChoices": [{"name": c["name"], "declaredAssociationVerified": c.get("associationVerified", False), "urls": list(dict.fromkeys(im["url"] for im in c["images"])), "sourcePages": list(dict.fromkeys(im.get("sourceUrl", "") for im in c["images"]))} for c in beige], "reviewStatus": "Not visually verified. Review at least three truly different photos of the exact beige SKU and at least one other exact color; do not count size duplicates or generic details as exact color shots."})

target = ROOT / "catalog-photo-association-audit.json"
target.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps({"report": str(target), "summary": report["summary"], "duplicateColorGroups": len(report["duplicateColorIdentityGroups"]), "sameUrlAcrossColors": len(report["sameUrlAcrossDifferentColors"]), "sameUrlAcrossModels": len(report["sameUrlAcrossModels"]), "sameImageSetModels": len(report["identicalFullImageSetAcrossModels"]), "sameNameGroups": len(report["sameNameDifferentGroupChecks"]), "beigePriorities": len(report["beigePriorityForVisualReview"]), "hashAudit": {k:v for k,v in report["localHashAudit"].items() if k != "duplicateContentGroups"}}, ensure_ascii=True, indent=2))
