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
      { heading: 'Éditeur', text: 'Moon & Pillow est édité par Basile Ramé, entrepreneur individuel (EI). Adresse : 2 rue des Voirons, bâtiment B, 74100 Ville-la-Grand, France. Contact : contact@raime.fr. Directeur de la publication : Basile Ramé. SIRET : 911 138 626 00021. TVA non applicable, article 293 B du CGI.' },
      { heading: 'Informations d’identification à compléter', text: 'Le téléphone professionnel sera ajouté avant l’ouverture des commandes. Aucun numéro supposé n’est affiché.' },
      { heading: 'Hébergement', text: 'Le site est hébergé par Cloudflare, Inc., 101 Townsend Street, San Francisco, CA 94107, États-Unis — cloudflare.com.' },
      { heading: 'Photographies', text: 'Les vues proviennent de la sélection initiale et des galeries fournisseurs recensées. Les droits de réutilisation commerciale restent à obtenir et à documenter ; une photographie accessible en ligne ne constitue pas une autorisation de reproduction.' },
    ],
    missing: ['Téléphone professionnel', 'Droits photographiques'],
    sources: [identitySource],
  },
  cgv: {
    title: 'Conditions de vente',
    sections: [
      { heading: 'Avant l’ouverture', text: 'La collection permet de découvrir des modèles et de préparer un panier sans achat. Les prix sont proposés, non approuvés. Aucune commande ferme ne peut être passée dans cet aperçu.' },
      { heading: 'Produits et prix', text: 'Avant toute vente seront confirmés le contenu exact de chaque article, ses variantes réellement commandables, son prix définitif, les taxes applicables ainsi que les frais et délais de livraison. Le décor photographié n’est pas inclus sauf indication expresse du contenu.' },
      { heading: 'Commande et paiement', text: 'Le futur parcours devra permettre la vérification et la correction du panier, une confirmation explicite de l’obligation de payer et un accusé de réception. Stripe et les moyens de paiement supplémentaires ne sont pas raccordés à cet aperçu. Aucun numéro de carte n’est demandé ici.' },
      { heading: 'Livraison et retours', text: 'La livraison est offerte en France dès 100 € d’achat ; en dessous, ses frais sont affichés avant le paiement. Vous disposez de 14 jours après réception pour retourner un article sans avoir à vous justifier. Les frais de retour sont à la charge de Moon & Pillow.' },
      { heading: 'Rétractation, garanties et litiges', text: 'Les conditions définitives préciseront les garanties légales de conformité et des vices cachés, les réclamations et la médiation de la consommation. Ces droits ne sont pas remplacés par une garantie commerciale éventuelle ni par une limite interne d’automatisation.' },
      { heading: 'Informations restant à valider', text: 'Les délais de livraison et le médiateur de la consommation doivent être complétés avant ouverture. Aucun organisme de médiation ni délai fournisseur n’est supposé. Le projet ne revendique pas de validation juridique globale de ces brouillons.' },
    ],
    missing: ['Prix, variantes et délais de livraison définitifs', 'Procédure de garanties et de réclamation', 'Médiateur effectivement retenu et coordonnées'],
    sources: [commerceSource],
  },
  retours: {
    title: 'Livraison & retours',
    sections: [
      { heading: 'Livraison offerte dès 100 €', text: 'La livraison est offerte en France dès 100 € d’achat. En dessous, ses frais sont affichés dans le panier et sur la page de paiement, avant tout règlement. Les délais de livraison seront précisés à l’ouverture des commandes.' },
      { heading: 'Retours gratuits sous 14 jours', text: 'Un article ne vous convient pas ? Vous avez 14 jours après réception pour nous le retourner, sans avoir à vous justifier. Les frais de retour sont à notre charge : écrivez-nous à contact@raime.fr avec votre numéro de commande, nous vous indiquons comment le renvoyer sans frais.' },
      { heading: 'Vos droits légaux', text: 'Le délai légal de rétractation pour un achat à distance est de 14 jours après réception. La décision n’a pas à être motivée. Le bien doit ensuite être renvoyé dans les 14 jours suivant votre demande.' },
      { heading: 'Signaler une rétractation', text: 'Le parcours en ligne est préparé à l’adresse /retractation ; il n’enregistre actuellement aucune demande réelle. Avant l’ouverture, il devra identifier la commande, permettre la confirmation et délivrer un accusé durable horodaté. Un modèle de déclaration est disponible ci-dessous.' },
      { heading: 'Modèle de déclaration à copier', text: 'À l’attention de Moon & Pillow, Basile Ramé, 2 rue des Voirons, bâtiment B, 74100 Ville-la-Grand, France, contact@raime.fr. Je vous informe de ma décision de me rétracter de l’achat suivant : [article et numéro de commande]. Commandé le [date], reçu le [date]. Nom : [nom]. Adresse : [adresse]. Date : [date]. Signature pour une déclaration sur papier : [signature].' },
      { heading: 'Remboursement et problème sur un article', text: 'Le remboursement doit respecter les règles légales et utiliser le moyen de paiement initial sauf accord différent sans frais. Une limite technique d’automatisation ne réduit pas les sommes dues au client. La procédure relative à un article défectueux ou non conforme sera distinguée du simple changement d’avis.' },
      { heading: 'Adresse de retour', text: 'Moon & Pillow — Basile Ramé, 2 rue des Voirons, bâtiment B, 74100 Ville-la-Grand, France. Écrivez-nous avant tout envoi à contact@raime.fr : nous vous confirmons la marche à suivre. Ne renvoyez jamais un article à l’adresse d’un fournisseur.' },
    ],
    missing: ['Délais de livraison', 'Procédure en cas d’article défectueux ou non conforme', 'Parcours de rétractation relié aux commandes et accusé durable'],
    sources: [withdrawalSource, commerceSource],
  },
  confidentialite: {
    title: 'Confidentialité',
    sections: [
      { heading: 'Le panier sur cet appareil', text: 'Le panier de préparation est conservé dans le stockage local du navigateur. Vous pouvez retirer ses articles ou effacer les données du site dans votre navigateur. Aucun abonnement à une newsletter commerciale n’est ouvert sur cet aperçu.' },
      { heading: 'E-mails commerciaux', text: 'Aucun service d’envoi n’est raccordé. Les scénarios préparés exigeront un accord marketing explicite et une désinscription effective. L’acceptation des CGV ou la création d’un compte sans achat ne vaudra pas inscription à la newsletter.' },
      { heading: 'Publicité', text: 'Aucun pixel Meta ni outil Google de publicité ou de mesure d’audience n’est activé. Leur éventuelle utilisation sera précédée d’une information et d’un dispositif de choix adapté aux traitements réellement retenus.' },
      { heading: 'Informations à compléter avant collecte', text: 'La notice définitive identifiera le responsable des traitements, leurs finalités et bases, les données requises ou facultatives, leurs destinataires, leur conservation et les droits des personnes. Les prestataires, éventuels transferts et moyens d’exercice des droits restent à documenter avant activation.' },
      { heading: 'Hébergement et contact', text: 'L’hébergement peut traiter les données techniques nécessaires à l’affichage et à la protection du site. Stripe est désactivé. Responsable : Basile Ramé, entrepreneur individuel (SIRET 911 138 626 00021), 2 rue des Voirons, bâtiment B, 74100 Ville-la-Grand, France. Pour toute question : contact@raime.fr.' },
    ],
    missing: ['Responsable et coordonnées complètes', 'Prestataires et traitements effectivement retenus', 'Durées de conservation', 'Gestion des droits et de la désinscription'],
    sources: [emailSource, commerceSource],
  },
};
