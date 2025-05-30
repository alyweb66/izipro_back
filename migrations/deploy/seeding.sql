-- Deploy izi:seeding to pg

BEGIN;

INSERT INTO "category" (
    "name"
) VALUES
('Animaux'),
('Art et création'),
('Assurance et gestion'),
('Conseil et coaching'),
('Construction et rénovation'),
('Education et formation'),
('Evénementiel et animation'),
('Esthétique et soins personnel'),
('Marketing et communication'),
('Nettoyage'),
('Paysagisme et aménagement extérieur'),
('Psychologie et développement personnel'),
('Réseau et télécommunication'),
('Réparation et entretien'),
('Santé et bien-être'),
('Sécurité et surveillance'),
('Services à domicile'),
('Services financier et juridique'),
('Services technique et industriel'),
('Technologie et informatique'),
('Transport et mobilité'),
('Vente et commerce');


INSERT INTO "job" (
    "name",  
    "category_id"

) VALUES
('Comportementaliste animalier', 1),  
('Dresseur·euse', 1),  
('Eleveur·euse', 1),  
('Organisateur·trice d''événements animaliers', 1),  
('Pet-sitter', 1),  
('Photographe animalier', 1),  
('Taxidermiste', 1),  
('Toiletteur·euse', 1),  
('Vétérinaire', 1),
--------------------
('Artificier·ière', 2),  
('Artisan maroquinier·ière', 2),  
('Artiste peintre', 2),  
('Calligraphe', 2),  
('Concepteur·trice d''accessoires personnalisés', 2),  
('Couturier·ère', 2),  
('Créateur·trice de bijoux', 2),  
('Décorateur·trice d''intérieur', 2),  
('Designer textile', 2),  
('Ebéniste', 2),  
('Ferronnier·ière d''art', 2),  
('Fleuriste d''art', 2),  
('Graveur·euse', 2),  
('Illustrateur·trice', 2),  
('Maître verrier·ière', 2),  
('Marqueteur·trice', 2),  
('Metteur·euse en scène', 2),  
('Photographe', 2),  
('Réalisateur·trice audiovisuel·le', 2),  
('Restaurateur·trice d''œuvres d''art', 2),  
('Sculpteur·trice', 2),  
('Souffleur·euse de verre', 2),  
('Styliste', 2),  
('Tapissier·ière', 2),
---------------------
('Agent général d''assurances', 3),  
('Analyste de risques patrimoniaux', 3),  
('Consultant·e en investissements', 3),  
('Conseiller·ère en épargne retraite', 3),  
('Conseiller·ère en gestion de patrimoine', 3),  
('Conseiller·ère en prévoyance', 3),  
('Courtier·ère en assurances', 3),  
('Expert·e en assurance', 3),  
('Généalogiste', 3),  
('Gestionnaire de biens locatifs', 3),  
('Intermédiaire en assurances vie', 3),  
('Planificateur·trice financier·ère', 3),  
('Spécialiste en optimisation fiscale', 3),
----------------------
('Coach en bien-être', 4),  
('Coach en développement personnel', 4),  
('Coach en estime de soi', 4),  
('Coach en gestion des émotions', 4),  
('Coach en gestion du stress', 4),  
('Coach en gestion du temps', 4),  
('Coach en leadership', 4),  
('Coach en nutrition', 4),  
('Coach en parentalité', 4),  
('Coach en pédagogie Montessori', 4),  
('Coach en prise de parole', 4),  
('Coach en rangement', 4),  
('Coach en séduction', 4),  
('Coach sportif', 4),  
('Coach de carrière', 4),  
('Coach de vie', 4),  
('Coach éducatif', 4),  
('Conseiller·ère en image', 4),  
('Conseiller·ère en orientation scolaire', 4),  
('Conseiller·ère matrimonial·e', 4),  
('Conseiller·ère en reconversion professionnelle', 4),  
('Consultant·e en communication interpersonnelle', 4),  
('Personal shopper', 4),
------------------------
('Architecte', 5),  
('Carreleur·euse', 5),  
('Chauffagiste', 5),  
('Charpentier·ière', 5),  
('Constructeur·rice', 5),  
('Constructeur·rice de maisons', 5),  
('Conducteur·rice de travaux', 5),  
('Couvreur·euse', 5),  
('Cuisiniste', 5),  
('Electricien·ne', 5),  
('Façadier·ière', 5),  
('Géomètre·expert', 5),  
('Ingénieur·e en bâtiment', 5),  
('Ingénieur·e en génie civil', 5),  
('Jointeur·euse', 5),  
('Maçon·ne', 5),  
('Menuisier·ière', 5),  
('Peintre en bâtiment', 5),  
('Plâtrier·ère staffeur', 5),  
('Plombier·ière', 5),  
('Rénovateur·rice d''intérieur', 5),  
('Serrurier·ière', 5),  
('Spécialiste en assainissement', 5),  
('Spécialiste en génie climatique', 5),  
('Spécialiste en isolation', 5),  
('Spécialiste en panneaux solaires', 5),  
('Spécialiste en pompes à chaleur', 5),  
('Terrassier·ière', 5),  
('Verrier·ière', 5),
------------------------------
('Aide aux devoirs', 6),  
('Formateur·trice divers', 6),  
('Formateur·trice en informatique', 6),  
('Formateur·trice en premiers secours', 6),  
('Instructeur·trice de conduite', 6),  
('Professeur d''art', 6),  
('Professeur de français', 6),  
('Professeur de langue des signes', 6),  
('Professeur de langues', 6),  
('Professeur de mathématiques', 6),  
('Professeur de musique', 6),  
('Professeur de physique-chimie', 6),  
('Professeur d''économie', 6),  
('Professeur particulier', 6),  
('Préparateur·trice aux examens', 6),
--------------------------------
('Acrobate', 7),  
('Acteur·trice', 7),  
('Animateur·trice événementiel·le', 7),  
('Animateur·trice pour enfants', 7),  
('Barman/Barmaid et mixologue', 7),  
('Cake designer', 7),  
('Cascadeur·euse', 7),  
('Comédien·ne/Performeur', 7),  
('Coordinateur·trice de mariage', 7),  
('Décorateur·trice d''événements', 7),  
('DJ', 7),  
('Exploitant·e de food truck', 7),  
('Hôte·esse événementiel·le', 7),  
('Maître·esse de cérémonie', 7),  
('Musicien·ne', 7),  
('Photographe événementiel', 7),  
('Spécialiste en animations interactives', 7),  
('Stripteaseur·euse', 7),  
('Technicien·ne son et lumière', 7),  
('Traiteur·euse', 7),
------------------------------------ 
('Barbier', 8),  
('Coiffeur·se', 8),  
('Dermatologue esthétique', 8),  
('Esthéticien·ne', 8),  
('Maquilleur·se', 8),  
('Manucure/Pédicure/Prothésiste ongulaire', 8),  
('Masseur·se', 8),  
('Pierceur·se', 8),  
('Spécialiste des soins du visage', 8),  
('Spécialiste des soins du corps', 8),  
('Spécialiste du bronzage', 8),  
('Spécialiste en blanchiment dentaire', 8),  
('Spécialiste en épilation', 8),  
('Technicien·ne en cryolipolyse', 8),  
('Tatoueur·se', 8),
------------------------------------
('Analyste en marketing', 9),  
('Coach en développement de la marque personnelle', 9),  
('Community manager', 9),  
('Consultant·e en e-réputation', 9),  
('Consultant·e en marketing de contenu', 9),  
('Consultant·e en publicité en ligne', 9),  
('Consultant·e en stratégie digitale', 9),  
('Consultant·e en stratégie de communication', 9),  
('Créateur·trice de contenu vidéo', 9),  
('Expert·e en marketing des réseaux sociaux', 9),  
('Graphiste', 9),  
('Illustrateur·trice', 9),  
('Imprimeur·euse', 9),  
('Influenceur·se marketing', 9),  
('Responsable de la stratégie de marque', 9),  
('Rédacteur·trice web', 9),  
('Spécialiste en email marketing', 9),  
('Spécialiste SEO', 9),
-----------------------------------
('Dératiseur·se', 10),  
('Nettoyage de façades/terrasses', 10),  
('Nettoyage de fin de chantier', 10),  
('Nettoyage de locaux commerciaux', 10),  
('Nettoyage de tapis et moquettes', 10),  
('Nettoyage de véhicules/Detailing', 10),  
('Nettoyage textile', 10),  
('Ramonage', 10),  
('Service de nettoyage industriel', 10),  
('Spécialiste en nettoyage de panneaux solaires', 10),  
('Spécialiste en nettoyage de vitres', 10),
-------------------------------------
('Architecte d''extérieur', 11),  
('Designer·euse d''extérieur', 11),  
('Elagueur·euse', 11),  
('Forreur·euse', 11),  
('Jardinier·ière', 11),  
('Paysagiste', 11),  
('Pisciniste', 11),  
('Sourcier·ière', 11),
---------------------------------------
('Accompagnateur·trice en reconversion professionnelle', 12),  
('Conseiller·ère conjugal·e', 12),  
('Conseiller·ère en relations interpersonnelles', 12),  
('Consultant·e en gestion des émotions', 12),  
('Hypnothérapeute', 12),  
('Médiateur·trice familial·e', 12),  
('Praticien·ne en PNL', 12),  
('Psychothérapeute', 12),  
('Psychologue scolaire', 12),  
('Psychologue sportif·ve', 12),  
('Sexologue', 12),  
('Thérapeute comportemental·e', 12),
----------------------------------------
('Consultant·e en télécommunications', 13),  
('Formateur·trice en réseaux et télécommunications', 13),  
('Ingénieur·e réseau', 13),  
('Installateur·trice de fibre optique', 13),  
('Spécialiste en solutions de connectivité', 13),  
('Technicien·ne VoIP', 13),  
('Technicien·ne en téléphonie mobile', 13),  
('Technicien·ne réseau', 13),
-----------------------------------------
('Carrossier·ière', 14),  
('Electronicien·ne', 14),  
('Mécanicien·ne aéronautique', 14),  
('Mécanicien·ne automobile', 14),  
('Mécanicien·ne de véhicules électriques', 14),  
('Mécanicien·ne en machines agricoles', 14),  
('Mécanicien·ne en véhicules de collection', 14),  
('Mécanicien·ne nautiques', 14),  
('Mécanicien·ne poids lourds', 14),  
('Mécanicien·ne petites mécaniques', 14),  
('Mécanicien·ne cycle et scooter', 14),  
('Mécanicien·ne Travaux publics', 14),  
('Réparateur·trice d''électroménager', 14),   
('Mécanicien·ne vélo', 14),
-----------------------------------------
('Acupuncteur·trice', 15),  
('Allergologue', 15),  
('Art-thérapeute', 15),  
('Audioprothésiste', 15),  
('Bioénergéticien·ne', 15),  
('Cardiologue', 15),  
('Chiropracteur·trice', 15),  
('Conseiller·ère en aromathérapie', 15),  
('Conseiller·ère en phytothérapie', 15),  
('Conseiller·ère en sommeil', 15),  
('Diététicien·ne', 15),  
('Educateur·trice sportif·ve spécialisé·e', 15),  
('Ergothérapeute', 15),  
('Hypnothérapeute', 15),  
('Infirmier·ère libéral·e', 15),  
('Kinésithérapeute', 15),  
('Naturopathe', 15),  
('Ostéopathe', 15),  
('Orthophoniste', 15),  
('Orthoptiste', 15),  
('Podologue', 15),  
('Praticien·ne en reiki', 15),  
('Praticien·ne en shiatsu', 15),  
('Professeur·eure de Pilates', 15),  
('Professeur·eure de yoga', 15),  
('Psychomotricien·ne', 15),  
('Réflexologue', 15),  
('Sage-femme', 15),
---------------------------------------
('Agent cynophile (Maître-chien)', 16),  
('Agent de protection rapprochée', 16),  
('Agent de sécurité', 16),  
('Technicien·ne en alarmes et systèmes de sécurité', 16),
--------------------------------------
('Accompagnateur·trice de personnes âgées', 17),  
('Agent de ménage à domicile', 17),  
('Aide à domicile', 17),  
('Assistant·e administratif·ve personnel·le', 17),  
('Coiffeur·se à domicile', 17),  
('Cuisinier·ère à domicile', 17),  
('Esthéticien·ne à domicile', 17),  
('Infirmier·ère à domicile', 17),  
('Livreur·se de courses à domicile', 17),  
('Masseur·se à domicile', 17),
('Mécanicien à domicile', 17),
('Garde d''enfants à domicile', 17),
----------------------------------------
('Actuaire', 18),  
('Analyste financier·ère', 18),  
('Auditeur·trice financier·ère', 18),  
('Avocat·e', 18),  
('Comptable', 18),  
('Conseiller·ère en création d''entreprise', 18),  
('Consultant·e en cybersécurité financière', 18),  
('Consultant·e en finance d''entreprise', 18),  
('Courtier·ère en crédit immobilier', 18),  
('Expert·e-comptable', 18),  
('Fiscaliste', 18),  
('Gestionnaire d''actifs', 18),  
('Gestionnaire de paie', 18),  
('Huissier·ère de justice', 18),  
('Juriste d''entreprise', 18),  
('Médiateur·trice juridique', 18),  
('Notaire', 18),  
('Responsable conformité (Compliance)', 18),
----------------------------------------
('Affûteur·euse', 19),  
('Ajusteur·euse de précision', 19),  
('Automatisme industriel', 19),  
('Bobinage (moteurs électriques)', 19),  
('Chaudronnier·ère', 19),  
('Contrôle non destructif', 19),  
('Découpe laser', 19),  
('Electromécanicien·ne', 19),  
('Ferronnier·ère', 19),  
('Hydrographie', 19),  
('Impression 3D métallique', 19),  
('Impression 3D plastique/résine', 19),  
('Injection plastique', 19),  
('Mécanicien-ne/régleur·euse en machines industrielles', 19),  
('Peintre industriel·le', 19),  
('Plasturgie', 19),  
('Rectifieur·euse', 19),  
('Réparateur·trice d''outils électroportatifs', 19),  
('Soudeur·euse', 19),  
('Traitement de surface du bois', 19),  
('Traitement de surface des métaux', 19),  
('Traitement de surface des plastiques', 19),  
('Traitement thermique des métaux', 19),  
('Usineur·euse', 19),
------------------------------------------
('Administrateur-trice système', 20),  
('Analyste de données', 20),  
('Architecte cloud', 20),  
('Assembleur-euse et configurateur-trice de PC sur mesure', 20),  
('Consultant-e en cybersécurité', 20),  
('Développeur-euse de sites web/application', 20),  
('Ingénieur-e logiciel', 20),  
('Technicien·ne en domotique', 20),  
('Spécialiste en récupération de données', 20),  
('Technicien-ne en impression 3D', 20),
-------------------------------------- 
('Chauffeur-euse privé (VTC)', 21),  
('Chauffeur-euse poids lourd', 21),  
('Conducteur-trice de bus ou navette', 21),  
('Taxi', 21),  
('Transporteur-euse d''engins', 21),  
('Transporteur-euse de marchandises', 21),
--------------------------------------
('Agent immobilier', 22),  
('Fleuriste', 22),  
('Vendeur-euse à domicile', 22); 

COMMIT;
