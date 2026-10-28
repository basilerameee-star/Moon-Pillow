import collections
import json
import pathlib
import re
import unicodedata

ROOT = pathlib.Path(__file__).resolve().parent


def norm(value):
    return re.sub(r"\s+", " ", "".join(c for c in unicodedata.normalize("NFKD", str(value)) if not unicodedata.combining(c)).lower()).strip()


source = (ROOT / "normalize-specialist-products.py").read_text(encoding="utf-8")
old = """        if sku.startswith('CICC-'):
            n=int(sku.split('-')[1]);key=f'CICC-{n-20 if n>20 else n:02}'"""
new = """        if sku.startswith('CICC-'):
            # Product number is not a stable family code. The public motif name
            # is the identity; 21..30 are lumbar versions of 11..20.
            family=re.sub(r'^Classic Cushion Cover\\s*-\\s*','',r['name'],flags=re.I)
            family=re.sub(r'\\s*-?\\s*\\d+\\s*x\\s*\\d+\\s*cm.*$','',family,flags=re.I).strip(' -')
            family_skus=[x['sku'].upper() for x in rows if x['sku'].upper().startswith('CICC-') and plain(re.sub(r'\\s*-?\\s*\\d+\\s*x\\s*\\d+\\s*cm.*$','',re.sub(r'^Classic Cushion Cover\\s*-\\s*','',x['name'],flags=re.I),flags=re.I).strip(' -'))==plain(family)]
            key=min(family_skus,key=lambda s:int(s.split('-')[1]))"""
if old not in source:
    raise RuntimeError("Expected CICC grouping block is absent; stop rather than modify unrelated code.")
source = source.replace(old, new)
old = "palette=sorted(unique(palette),key=len,reverse=True)"
new = "palette += ['Gris Magnet','Gris Craie','Mais','Paon','Kiwi','Nougat','Poire','Beurre','Mineral','Bronze','Cobalt']\n    palette=sorted(unique(palette),key=len,reverse=True)"
source = source.replace(old, new)
old = """        for c in palette:
            if plain(normal).endswith(' '+plain(c)):
                title_color=normal[len(normal)-len(c):];normal=normal[:-len(c)].strip();break"""
new = """        # Strip one exact color suffix and repetitions of THAT suffix
        # only: 'Lila Naturel' must retain the model name Lila.
        for c in palette:
            if plain(normal).endswith(' '+plain(c)):
                title_color=normal[len(normal)-len(c):]
                normal=normal[:-len(c)].strip()
                while plain(normal).endswith(' '+plain(c)):
                    normal=normal[:-len(c)].strip()
                break
        normal=re.sub(r'\\b(?:S/M|L/XL)\\b','',normal,flags=re.I)
        normal=re.sub(r'\\b\\d+/\\d+\\s*ans\\b','',normal,flags=re.I)"""
if old not in source:
    raise RuntimeError("Expected PD title color block absent.")
source = source.replace(old, new)
source = source.replace("density=r['features'].get('Grammage (g/m²)','')", "density=r['features'].get('Grammage') or r['features'].get('Grammage (g/m²)','')")
namespace = {"__file__": str(ROOT / "normalize-specialist-products.py"), "__name__": "specialist_audit_derivative"}
exec(compile(source, "<reviewed-normalizer-derivative>", "exec"), namespace)
products = namespace["aw_models"]() + namespace["pd_models"]()
original = json.loads((ROOT / "specialist-expanded-2026-10-25.json").read_text(encoding="utf-8"))

url_models = collections.defaultdict(set)
url_colors = collections.defaultdict(set)
for p in products:
    for c in p["colors"]:
        for im in c["images"]:
            url_models[im["url"]].add(p["id"])
            url_colors[(p["id"], im["url"])].add(c["id"])

moved = []
for p in products:
    general_seen = set()
    for c in p["colors"]:
        kept = []
        for im in c["images"]:
            reason = None
            if len(url_models[im["url"]]) > 1:
                reason = "Same source image occurs in multiple commercially named models; exact model/color association not established."
            elif len(url_colors[(p["id"], im["url"])]) > 1:
                reason = "Same source image occurs in multiple color galleries; exact color association not established."
            if reason:
                moved.append({"modelId": p["id"], "color": c["name"], "url": im["url"], "reason": reason})
                if im["url"] not in general_seen:
                    p["gallery"].append({**im, "kind": "general", "associationVerified": False, "exclusionFromColorReason": reason})
                    general_seen.add(im["url"])
            else:
                kept.append(im)
        c["images"] = kept
        c["associationVerified"] = False
    # Detect conflicting declared thread counts without selecting the preferred number.
    for v in p.get("variants", []):
        features = v.get("features", {})
        composition = features.get("Matériaux détail", "")
        declared_thread = features.get("Nombre de fils", "")
        left = re.search(r"(\d+)\s*fils", composition, re.I)
        right = re.search(r"(\d+)\s*fils", declared_thread, re.I)
        if left and right and left[1] != right[1]:
            note = f"Composition et nombre de fils contradictoires sur {v['sku']}: {left[1]} fils dans la composition, {right[1]} fils dans la caractéristique. Aucune valeur résolue sans confirmation."
            if note not in p["uncertainties"]:
                p["uncertainties"].append(note)
    if any(len(c["images"]) < 3 for c in p["colors"]):
        note = "Après retrait des images partagées ambiguës, moins de trois photos sources propres pour au moins un coloris."
        if note not in p["uncertainties"]:
            p["uncertainties"].append(note)
    p["qualifiesRequestedMedia"] = False
    p["draftOnly"] = True

old_cicc = [p for p in original["products"] if p["source"] == "AW Dropship Europe" and p["supplierProductId"].startswith("CICC")]
new_cicc = [p for p in products if p["source"] == "AW Dropship Europe" and p["supplierProductId"].startswith("CICC")]
old_sku_to_group = {v["sku"].upper(): p["id"] for p in old_cicc for v in p["variants"]}
new_sku_to_group = {v["sku"].upper(): p["id"] for p in new_cicc for v in p["variants"]}
fixes = [{"sku": sku, "oldModelId": old_sku_to_group[sku], "newModelId": new_group} for sku, new_group in new_sku_to_group.items() if old_sku_to_group.get(sku) != new_group]

payload = {**original, "auditCorrections": {"status": "Candidate data only; no visual validation or sale approval", "ciccFamilyMoves": fixes, "ambiguousPhotoPlacementsRemovedFromColors": moved, "pdAdjustments": ["Read real Grammage field rather than absent Grammage (g/m²).", "Group robe S/M and L/XL variants and child poncho age sizes without counting them as separate models.", "Canonicalize additional exact title color suffixes and repeated source color suffixes; preserve actual different composition/density/thread count.", "Keep contradictory source thread counts in uncertainty notes, never silently resolve."]}, "products": products}
target = ROOT / "specialist-corrected-2026-10-25.json"
target.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps({"file": str(target), "models": len(products), "sources": dict(collections.Counter(p['source'] for p in products)), "ciccSkuMoves": fixes, "ambiguousPlacementsMoved": len(moved), "colors": sum(len(p['colors']) for p in products), "unreviewedMediaThresholdModels": sum(len(p['colors']) >= 2 and all(len(c['images']) >= 3 for c in p['colors']) for p in products)}, ensure_ascii=True, indent=2))
