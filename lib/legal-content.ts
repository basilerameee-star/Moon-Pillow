export type LegalContent = {
  title: string;
  sections: { heading: string; text: string }[];
  missing?: string[];
  sources?: { title: string; url: string }[];
};

const commerceSource = { title: 'Service Public — vente en ligne', url: 'https://entreprendre.service-public.gouv.fr/vosdroits/F23455' };
const identitySource = { title: 'Service Public — mentions obligatoires', url: 'https://entreprendre.service-public.gouv.fr/vosdroits/F37351' };
const withdrawalSource = { title: 'Ministère de l’Économie — rétractation', url: 'https://www.economie.gouv.fr/particuliers/mes-droits-conso/bien-consommer/vente-distance-tout-savoir-sur-votre-droit-de-retractation' };
const emailSource = { title: 'CNIL — messages aux prospects et clients', url: 'https://www.cnil.fr/fr/communication-electronique-quelles-regles' };

/** Preparation copy only. Missing business facts cannot be replaced by a
 * guessed address, registration number, delivery promise or supplier policy. */
export const legalContent: Record<string, LegalContent> = {
  'mentions-legales': {
    title: 'Mentions légales',
    sections: [
      { heading: 'Une version de préparation', text: 'Cet aperçu est privé. Les commandes et les paiements sont fermés. Ces informations sont un brouillon à compléter avant l’ouverture ; leur présence ne certifie pas la conformité juridique de la boutique.' },
      { heading: 'Éditeur', text: 'Les éléments fournis désignent Basile Ramé, entrepreneur individuel, comme porteur de Moon & Pillow, sous réserve de confirmation des coordonnées et du statut à publier. Contact indiqué : contact@raime.fr. Le fondateur a confirmé disposer d’un SIRET ; son numéro n’a pas été communiqué dans la préparation du site.' },
      { heading: 'Informations d’identification à compléter', text: 'L’identité et la domiciliation professionnelles, le téléphone, l’immatriculation applicable, la situation TVA et le directeur de publication doivent être confirmés. Aucune adresse ni aucun numéro supposé n’est affiché.' },
      { heading: 'Hébergement', text: 'Cet aperçu utilise Sites avec une infrastructure Cloudflare. L’identité juridique complète de l’hébergeur, son adresse et son téléphone restent à confirmer pour les mentions définitives. L’aperçu ne modifie pas le site d’origine moon-and-pillow.pages.dev.' },
      { heading: 'Photographies', text: 'Les vues proviennent de la sélection initiale et des galeries fournisseurs recensées. Les droits de réutilisation commerciale restent à obtenir et à documenter ; une photographie accessible en ligne ne constitue pas une autorisation de reproduction.' },
    ],
    missing: ['Coordonnées professionnelles et statut confirmés', 'Immatriculation et situation TVA', 'Directeur de publication', 'Coordonnées complètes de l’hébergeur', 'Droits photographiques'],
    sources: [identitySource],
  },
  cgv: {
    title: 'Conditions de vente',
    sections: [
      { heading: 'Avant l’ouverture', text: 'La collection permet de découvrir des modèles et de préparer un panier sans achat. Les prix sont proposés, non approuvés. Aucune commande ferme ne peut être passée dans cet aperçu.' },
      { heading: 'Produits et prix', text: 'Avant toute vente seront confirmés le contenu exact de chaque article, ses variantes réellement commandables, son prix définitif, les taxes applicables ainsi que les frais et délais de livraison. Le décor photographié n’est pas inclus sauf indication expresse du contenu.' },
      { heading: 'Commande et paiement', text: 'Le futur parcours devra permettre la vérification et la correction du panier, une confirmation explicite de l’obligation de payer et un accusé de réception. Stripe et les moyens de paiement supplémentaires ne sont pas raccordés à cet aperçu. Aucun numéro de carte n’est demandé ici.' },
      { heading: 'Rétractation, garanties et litiges', text: 'Les conditions définitives préciseront le droit de rétractation, les garanties légales de conformité et des vices cachés, les réclamations et la médiation de la consommation. Ces droits ne sont pas remplacés par une garantie commerciale éventuelle ni par une limite interne d’automatisation.' },
      { heading: 'Informations restant à valider', text: 'Les coordonnées du vendeur, la livraison, les retours et le médiateur compétent doivent être complétés avant ouverture. Aucun organisme de médiation ni délai fournisseur n’est supposé. Le projet ne revendique pas de validation juridique globale de ces brouillons.' },
    ],
    missing: ['Identité complète du vendeur', 'Prix, variantes, frais et délais définitifs', 'Procédure de garanties et de réclamation', 'Médiateur effectivement retenu et coordonnées'],
    sources: [commerceSource],
  },
  retours: {
    title: 'Livraison & retours',
    sections: [
      { heading: 'Une collection encore en préparation', text: 'Les zones, frais, délais de livraison et modalités de retour ne sont pas encore approuvés. Aucune livraison offerte ni aucun retour gratuit sous 30 jours n’est promis. Il n’y a pas de commande réelle à retourner sur cet aperçu.' },
      { heading: 'Changer d’avis après un achat à distance', text: 'Pour un bien, le délai légal de rétractation est en principe de 14 jours après réception. La décision n’a pas à être motivée. Le bien doit ensuite être renvoyé dans les 14 jours suivant la notification. Les frais de retour doivent être annoncés avant la commande.' },
      { heading: 'Signaler une rétractation', text: 'Le parcours en ligne est préparé à l’adresse /retractation ; il n’enregistre actuellement aucune demande réelle. Avant l’ouverture, il devra identifier la commande, permettre la confirmation et délivrer un accusé durable horodaté. Un modèle de déclaration est disponible ci-dessous.' },
      { heading: 'Modèle de déclaration à copier', text: 'À l’attention de Moon & Pillow — coordonnées du vendeur à compléter. Je vous informe de ma décision de me rétracter de l’achat suivant : [article et numéro de commande]. Commandé le [date], reçu le [date]. Nom : [nom]. Adresse : [adresse]. Date : [date]. Signature pour une déclaration sur papier : [signature].' },
      { heading: 'Remboursement et problème sur un article', text: 'Le remboursement doit respecter les règles légales et utiliser le moyen de paiement initial sauf accord différent sans frais. Une limite technique d’automatisation ne réduit pas les sommes dues au client. La procédure relative à un article défectueux ou non conforme sera distinguée du simple changement d’avis.' },
      { heading: 'Contenu et adresse de retour', text: 'Les housses et les plaids initiaux se choisissent séparément. La possibilité d’expédier chaque référence à l’unité, l’adresse de retour et les instructions d’expédition restent à confirmer. Ne renvoyez pas un article à une adresse fournisseur supposée. Contact de préparation : contact@raime.fr.' },
    ],
    missing: ['Zones, frais et délais de livraison', 'Adresse et procédure de retour', 'Frais de rétractation et procédure de non-conformité', 'Parcours de rétractation relié aux commandes et accusé durable'],
    sources: [withdrawalSource, commerceSource],
  },
  confidentialite: {
    title: 'Confidentialité',
    sections: [
      { heading: 'Le panier sur cet appareil', text: 'Le panier de préparation est conservé dans le stockage local du navigateur. Vous pouvez retirer ses articles ou effacer les données du site dans votre navigateur. Aucun abonnement à une newsletter commerciale n’est ouvert sur cet aperçu.' },
      { heading: 'E-mails commerciaux', text: 'Aucun service d’envoi n’est raccordé. Les scénarios préparés exigeront un accord marketing explicite et une désinscription effective. L’acceptation des CGV ou la création d’un compte sans achat ne vaudra pas inscription à la newsletter.' },
      { heading: 'Publicité', text: 'Aucun pixel Meta ni outil Google de publicité ou de mesure d’audience n’est activé. Leur éventuelle utilisation sera précédée d’une information et d’un dispositif de choix adapté aux traitements réellement retenus.' },
      { heading: 'Informations à compléter avant collecte', text: 'La notice définitive identifiera le responsable des traitements, leurs finalités et bases, les données requises ou facultatives, leurs destinataires, leur conservation et les droits des personnes. Les prestataires, éventuels transferts et moyens d’exercice des droits restent à documenter avant activation.' },
      { heading: 'Hébergement et contact', text: 'L’hébergement peut traiter les données techniques nécessaires à l’affichage et à la protection du site. Stripe est désactivé. Pour une question sur cet aperçu : contact@raime.fr. Les coordonnées complètes du responsable seront confirmées avant ouverture.' },
    ],
    missing: ['Responsable et coordonnées complètes', 'Prestataires et traitements effectivement retenus', 'Durées de conservation', 'Gestion des droits et de la désinscription'],
    sources: [emailSource, commerceSource],
  },
};
