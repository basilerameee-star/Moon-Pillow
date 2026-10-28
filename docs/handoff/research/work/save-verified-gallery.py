import json,pathlib,hashlib
from PIL import Image,ImageChops,ImageStat
root=pathlib.Path(__file__).parent
rows=json.loads((root/'gallery-proof-assets/manifest.json').read_text('utf-8'))
models=[]
notes={
 'pd-25300':'Percale unie : Sable beige/écru, Terre de Sienne terracotta, Neige blanc. Quatre vues réellement distinctes : lit mis en scène, produit plié, détail boutons, détail tissu. Les objets de décor/taies présents sur la photo ne sont pas vendus avec la housse. Photographies répétées pour les différentes tailles, non comptées comme vues nouvelles.',
 'pd-25080':'Gaze de coton Vickie réversible à petits carreaux : Naturel beige/écru et Terracotta. Quatre vues réellement distinctes du même coloris : lit trois-quarts côté motif/uni selon couleur, produit plié, face du lit, arrangement alternatif. Naturel est une gamme beige à motif Vichy, pas une housse unie. Décor et taies non inclus. Répétitions entre tailles non comptées.',
 'pd-25536':'Lin métis : Naturel beige, Aqua turquoise clair, Caramel orangé. Seulement deux vues distinctes : drap sur coin de lit et drap roulé. Les six URLs par couleur répètent ces deux mêmes images sur trois tailles. Ce modèle ne remplit pas l’exigence de trois photos distinctes par coloris.'}
for mid in ['pd-25300','pd-25080','pd-25536']:
 subset=[r for r in rows if r['modelId']==mid and not r.get('error')]
 colors=[]
 for name in dict.fromkeys(r['color'] for r in subset):
  group=[r for r in subset if r['color']==name]
  n=2 if mid=='pd-25536' else 4
  accepted=group[:n]
  colors.append({'id':group[0]['colorId'],'name':name,'associationVerified':True,'verifiedAt':'2026-10-25','verifiedBy':'visual-inspection-of-source-photos','images':[{k:r[k] for k in ['url','localPath','sha256','supplierSku','sourceUrl','sourceSize']} for r in accepted],'distinctVerifiedViews':n,'rejectedImages':[{'url':r['url'],'reason':'Même vue photographique répétée pour une autre taille ; ne pas compter comme vue distincte.'} for r in group[n:]],'imageNotes':notes[mid]})
 models.append({'id':mid,'colors':colors,'reviewedAllSelectedColorUrls':True,'meetsTwoColorsThreeDistinctViews':mid!='pd-25536','notes':notes[mid]})
out={'checkedAt':'2026-10-25','method':'Source supplier SKU/title association plus direct visual inspection via view_image of all downloaded selected-color photographs in labelled contact sheets; additionally inspected full-size pd-25080 Naturel #4 and pd-25300 Sable #3. No generated/recolored/cropped images substituted. Supplier photos are original and may show styled accessories not included.','scope':'Only the explicitly listed color IDs are verified; other colors remain unverified.','manifest':'work/gallery-proof-assets/manifest.json','models':models}
(root/'photo-verified-overrides.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),'utf-8')
print(json.dumps({'models':len(models),'verifiedColors':sum(len(m['colors']) for m in models),'acceptedDistinctPhotos':sum(c['distinctVerifiedViews'] for m in models for c in m['colors']),'completeTwoColorThreePhotosModels':sum(m['meetsTwoColorsThreeDistinctViews'] for m in models)}))
