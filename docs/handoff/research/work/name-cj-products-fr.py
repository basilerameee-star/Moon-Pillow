import collections
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent
products = json.loads((ROOT / "cj-corrected-2026-10-25.json").read_text(encoding="utf-8"))["products"]

# Short factual labels: avoid carrying unverified composition, performance,
# seasonal safety or supplier marketing adjectives into the customer name.
rows = [
    ("2406130514081620000", "Taie d’oreiller unie", "taies", False),
    ("a9bf8c90-4082-4131-a83c-2aa072723560", "Housse de coussin effet suédine", "housses", False),
    ("2508220355361610500", "Taie d’oreiller double face", "taies", False),
    ("2411140800561622400", "Housse de coussin effet peluche", "housses", False),
    ("2507260800491628400", "Taie d’oreiller zippée", "taies", False),
    ("2503020244061618700", "Parure de lit unie effet lavé", "parures", True),
    ("2510010712421623400", "Housse de couette unie", "housses-couette", False),
    ("1393125541086892032", "Couette unie", "couettes", False),
    ("1585238757278756864", "Plaid à bordure crochetée", "plaids", False),
    ("2509100704071614400", "Plaid gaufré", "plaids", False),
    ("1760929687901048832", "Couette légère unie", "couettes", False),
    ("2505020611461629500", "Couette d’été unie", "couettes", False),
    ("2508130157551621100", "Parure de lit à fleurs", "parures", True),
    ("2406110759131620200", "Housse de coussin motif chat", "housses", False),
    ("2412060434001617000", "Ensemble couvre-lit brodé", "couvre-lits", True),
    ("1594162272279212032", "Housse de coussin décorative", "housses", False),
    ("1437360848325709824", "Housse de coussin à motifs dorés", "housses", False),
    ("2507290244131629600", "Parure de lit trois pièces", "parures", True),
    ("1441992219224576000", "Parure de lit motif bohème", "parures", True),
    ("2506100545071604700", "Parure de lit jacquard", "parures", True),
    ("2505240354531617900", "Parure de lit jacquard tissé", "parures", True),
    ("2508180123221627900", "Parure de lit pied-de-poule", "parures", True),
    ("2507160551571624400", "Parure de lit effet lavé", "parures", True),
    ("2510010731251628800", "Parure de lit jacquard froissé", "parures", True),
    ("2501270947581604800", "Serviette de bain unie", "serviettes", False),
    ("1452829463002877952", "Chiffon de cuisine en microfibre", "serviettes", False),
    ("2412110801271608100", "Plaid polaire double face", "plaids", False),
    ("2411300645591615100", "Plaid de canapé uni", "plaids", False),
    ("2412040749281608900", "Plaid tricoté", "plaids", False),
    ("2411130918551616200", "Ensemble draps et taies", "parures", True),
    ("1702566885981687808", "Serviette de bain", "serviettes", False),
    ("2406300252491604000", "Serviette de bain imprimée", "serviettes", False),
    ("2501221336081602300", "Serviette de bain effet polaire", "serviettes", False),
    ("1889850942357028865", "Coussin décoratif brodé", "coussins", False),
    ("f25df9b2-5e6b-42c9-85fd-b34d55e39822", "Taie d’oreiller effet satiné", "taies", False),
    ("1780911060157992960", "Housse de couette effet brossé", "housses-couette", False),
    ("0f2b2061-e1d2-4f95-af1c-157da04a2b8e", "Drap de bain grand format", "serviettes", False),
    ("0f71f755-035c-49ce-9e54-8103862c06ae", "Drap de bain uni", "serviettes", False),
    ("2506080418241625500", "Linge de bain uni", "serviettes", False),
    ("2504170512571608400", "Serviette de bain grand format", "serviettes", False),
    ("1737748230328299520", "Plaid effet flanelle", "plaids", False),
    ("1400392295097962496", "Serviette carrée blanche", "serviettes", False),
    ("ed69c553-b796-4777-b538-bd75737a7a13", "Serviette de toilette", "serviettes", False),
    ("a1cde1ba-8380-4606-8d74-353616c822e8", "Plaid uni effet flanelle", "plaids", False),
    ("2412040956341610800", "Drap-housse imprimé", "draps-housses", False),
    ("2501210747581623500", "Parure avec drap plat ou drap-housse", "parures", True),
    ("2508140715201614900", "Parure de lit motif pierre", "parures", True),
    ("2412040824121618500", "Drap-housse effet brossé", "draps-housses", False),
    ("2503210221401604900", "Protection de matelas matelassée", "protections", False),
    ("2412031152171627300", "Petite serviette carrée", "serviettes", False),
    ("2412030755331624800", "Plaid à franges", "plaids", False),
    ("2412240323031626200", "Plaid polaire uni", "plaids", False),
    ("2412230656071609300", "Plaid décoratif", "plaids", False),
    ("2406110909121605500", "Plaid tissé à franges", "plaids", False),
    ("1380498548117868544", "Housse de coussin unie effet velours", "housses", False),
    ("1723169213197594624", "Housse de coussin côtelée", "housses", False),
    ("2411100651541612500", "Plaid tricoté uni à franges", "plaids", False),
    ("2406250724301611900", "Plaid tricoté à franges", "plaids", False),
    ("1566741036771323904", "Plaid tricoté géométrique noir et blanc", "plaids", False),
    ("2406100547151615200", "Plaid à texture gaufrée", "plaids", False),
]

by_id = {p["id"]: p for p in products}
output = []
for suffix, name, category, requires_bundle in rows:
    product_id = "cj-" + suffix
    if product_id not in by_id:
        raise RuntimeError(f"Unrecognized product ID {product_id}")
    item = {"id": product_id, "nameFR": name, "category": category, "requiresSupplierBundle": requires_bundle}
    if requires_bundle:
        item["excludeReason"] = "Lot fournisseur comprenant plusieurs pièces. À conserver en recherche seulement tant qu’une variante unitaire distincte n’est pas isolée et confirmée; ne pas vendre les pièces du lot séparément."
    if suffix in {"2508130157551621100", "2411130918551616200"}:
        item["excludeReason"] = "Fiche mêlant ensembles et options de pièces individuelles; l’association SKU, contenu et prix unitaire reste à isoler. À conserver en recherche seulement en attendant."
    output.append(item)

if len(output) != len(products) or {x["id"] for x in output} != set(by_id):
    raise RuntimeError("The map must cover every one of the 60 source IDs exactly once.")
target = ROOT / "cj-names-fr-2026-10-25.json"
target.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps({"file": str(target), "models": len(output), "supplierBundlesForResearchOnly": sum(x["requiresSupplierBundle"] for x in output), "categories": dict(collections.Counter(x["category"] for x in output)), "categoryCorrections": [{"id": x["id"], "old": by_id[x["id"]]["category"], "new": x["category"]} for x in output if by_id[x["id"]]["category"] != x["category"]]}, ensure_ascii=True, indent=2))
