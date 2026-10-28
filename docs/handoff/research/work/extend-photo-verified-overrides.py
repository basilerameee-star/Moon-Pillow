import json,pathlib,os
root=pathlib.Path(__file__).parent
path=root/'photo-verified-overrides.json';out=json.loads(path.read_text('utf-8'))
extra=json.loads((root/'gallery-proof-assets/additional-colors-manifest.json').read_text('utf-8'))
src={p['id']:p for p in json.loads((root/'specialist-corrected-2026-10-25.json').read_text('utf-8-sig'))['products']}
for mid in ['pd-25300','pd-25080','pd-25536']:
 model=next(m for m in out['models'] if m['id']==mid)
 for name in dict.fromkeys(r['color'] for r in extra if r['modelId']==mid):
  rows=[r for r in extra if r['modelId']==mid and r['color']==name]
  original=next(c for c in src[mid]['colors'] if c['id']==rows[0]['colorId'])
  accepted={r['url'] for r in rows}
  model['colors']=[c for c in model['colors'] if c['id']!=rows[0]['colorId']]
  model['colors'].append({'id':rows[0]['colorId'],'name':name,'associationVerified':True,'verifiedAt':'2026-10-25','verifiedBy':'visual-inspection-of-source-photos','images':[{k:r[k] for k in ['url','localPath','sha256','supplierSku','sourceUrl','sourceSize','pixelHash']} for r in rows],'distinctVerifiedViews':len(rows),'rejectedImages':[{'url':i['url'],'reason':'Même vue photographique répétée pour une autre taille ; ne pas compter comme vue distincte.'} for i in original['images'] if i['url'] not in accepted],'imageNotes':'Toutes les vues distinctes affichées et inspectées dans la planche complémentaire. Correspondance de teinte et de motif cohérente avec le titre de la référence fournisseur; les accessoires présents restent hors contenu vendu.'})
 model['allDeclaredColorsVisuallyReviewed']=len(model['colors'])==len(src[mid]['colors'])
 model['meetsAllColorsThreeDistinctViews']=model['allDeclaredColorsVisuallyReviewed'] and all(c['distinctVerifiedViews']>=3 for c in model['colors'])
 model['wholeModelQualified']=len(model['colors'])>=2 and model['meetsAllColorsThreeDistinctViews']
 if mid=='pd-25080':model['remainingPhotoGap']='Romarin : deux vues distinctes seulement. Ne pas prétendre que toutes les couleurs atteignent trois photos.'
 if mid=='pd-25300':model['notes']='Housse de couette percale unie. Les 8 couleurs déclarées (Thym, Terre de Sienne, Sable, Neige, Havane, Galet, Céladon, Bleu Nuit) ont chacune 4 vues distinctes inspectées : lit, produit plié, boutons, tissu. Les répétitions de taille ont été exclues. Céladon conservé en UTF-8; URL fournisseur /celadon.jpg. Les taies et objets de décor des mises en scène ne sont pas inclus.'
out['scope']='Les 16 couleurs déclarées de ces trois modèles ont été inspectées. pd-25300: 8 couleurs ×4vues distinctes, modèle entier qualifié. pd-25080:4couleurs inspectées, mais Romarin n’a que2vues; modèle entier non qualifié. pd-25536:4couleurs inspectées,2vues par couleur; modèle entier non qualifié.'
out['additionalProof']='work/gallery-proof-assets/additional-colors-manifest.json'
out['summary']={'verifiedColors':sum(len(m['colors']) for m in out['models']),'verifiedDistinctPhotoPlacements':sum(c['distinctVerifiedViews'] for m in out['models'] for c in m['colors']),'wholeModelsQualified':sum(m.get('wholeModelQualified',False) for m in out['models'])}
temp=path.with_suffix('.tmp');temp.write_text(json.dumps(out,ensure_ascii=False,indent=2),'utf-8');os.replace(temp,path)
print(json.dumps(out['summary']))
