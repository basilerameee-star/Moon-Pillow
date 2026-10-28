import json
from pathlib import Path
def span(a,b):return set(range(a,b+1))
def write(source,destination,scenes,macros,special):
    rows=json.loads(Path(source).read_text(encoding='utf-8'))
    assert len(rows)==180
    result=[]
    for row in rows:
        n=row['extraId']
        kind='scene' if n in scenes else 'macro' if n in macros else 'reject'
        reason=special.get(n, 'Article visible en situation sur un lit, un siège ou dans un décor réel, dans le coloris documenté ; autres éléments du décor non inclus.' if kind=='scene' else 'Matière, tissage ou finition du coloris exact visible en gros plan, sans détourage sur fond blanc.' if kind=='macro' else 'Détourage, présentation isolée sur fond blanc ou vue insuffisante pour identifier avec certitude l’article et le coloris vendus.')
        result.append({**row,'classification':kind,'reason':reason,'reviewMethod':'Inspection visuelle de la planche complète par l’agent principal, 26 octobre 2026.'})
    Path(destination).write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    return {k:sum(r['classification']==k for r in result) for k in ['scene','macro','reject']}
first_scenes=span(1,7)|span(17,50)|{80}|span(82,118)|span(120,153)|span(170,180)
first_macros=span(8,16)|{52,61,76}
second_scenes={1,6,8,13,17,19,20,21,22,23,24,26,27,30,32,33,35,36,37,38,39,40,41,50,51,52,53,54,55,56,64,65,66,68,73,93,96,97,98,99,100,101,102,103,104,107,108,110,113,114,115,116,122,123,124,125,129,130,134,151,152,153,154,157,158,159,160,161,162,165,167,170,171,172,174,175,180}
second_macros={2,3,4,11,12,14,15,16,25,28,29,31,34,42,43,44,48,49,61,67,70,71,74,75,76,85,86,94,95,105,106,109,111,112,117,118,121,126,127,128,131,138,140,141,147,148,150,155,156,163,164,166,168,169,173,176,178,179}
special={18:'Le nom Natural Greens ne permet pas de confirmer cette palette surtout orange/rose ; pas de scène attribuée à ce coloris sans preuve supplémentaire.',45:'Coloris seulement Uni, modèle photographié dans plusieurs teintes ; pas d’association précise démontrée.',59:'La couette jaune masque le drap-housse vendu ; vue d’ambiance exclue comme photographie de cet article.',135:'Coloris seulement Uni et teinte différente des autres vues ; association exacte non démontrée.'}
for n in [46,47,119,120,177]:special[n]='Le lit est recouvert d’une pièce présentant l’épaisseur d’une couette. Le drap plat vendu n’est pas assez identifiable pour faire de cette vue une photographie exacte.'
print(write('work/lifestyle-extra-colours-candidates.json','work/lifestyle-extra-colours.json',first_scenes,first_macros,{}))
print(write('work/lifestyle-extra-colours-second-candidates.json','work/lifestyle-extra-colours-second.json',second_scenes,second_macros,special))
