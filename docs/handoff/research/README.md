# Archive de recherche catalogue

`work/` est une copie des données de recherche disponibles dans l'espace de travail local au 28 octobre 2026. Elle comprend les sources d'approvisionnement (Alibaba, AW, CJ, fournisseurs spécialisés), les scripts de normalisation et d'audit, les données de variantes, les correspondances d'images et les visuels de preuve. Les chemins de fichiers source ont été conservés sous ce dossier pour aider à suivre les manifests.

Les données de l'archive sont des éléments de travail, pas des validations de conformité ni une preuve que chaque photo appartient exactement à la variante correspondante. Suivre `work/catalog-photo-association-audit.json` et `work/photo-verified-overrides.json`, puis vérifier les visuels avant de les intégrer au catalogue public.

Contenu volontairement non archivé :

- `work/sites/`, car la version éditable du site est déjà à la racine du dépôt;
- cache d'exécution Python, dépendances et sorties de build;
- captures HTML brutes des pages fournisseurs, susceptibles de contenir un état de session ou des données de navigation non nécessaires;
- transcriptions textuelles complètes de vidéos tierces. Les notes d'analyse et références sont conservées lorsqu'elles existent.

Les identifiants d'accès, clés API, mots de passe, cookies et jetons ne doivent jamais être ajoutés ici. Le dépôt GitHub cible est public.
