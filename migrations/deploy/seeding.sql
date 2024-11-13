-- Deploy izi:seeding to pg

BEGIN;

/* INSERT INTO "user" (
    "first_name",
    "last_name",
    "email",
    "postal_code",
    "city",
    "password",
    "remember_token",
    "siret",
    "denomination",
    "role",
    "created_at",
    "updated_at"
) VALUES
    ('John', 'Doe', 'john.doe@example.com', '75001', 'Paris', 'hashed_password_1', 'token_1', 12345678901234, 'Company A', 'user', '2023-01-01 12:00:00', '2023-01-01 12:00:00'),
    ('Jane', 'Smith', 'jane.smith@example.com', '91300', 'Massy', 'hashed_password_2', 'token_2', 98765432109876, 'Company B', 'admin', '2023-01-02 14:30:00', '2023-01-02 14:30:00'),
    ('Alice', 'Johnson', 'alice.johnson@example.com', '69001', 'Lyon', 'hashed_password_3', 'token_3', 11112222333344, 'Company C', 'user', '2023-01-03 10:45:00', '2023-01-03 10:45:00'),
    ('Bob', 'Dylan', 'bob.dylan@example.com', '13005', 'Marseille', 'hashed_password_4', 'token_4', 45678901234567, 'Company D', 'user', '2023-02-14 16:34:00', '2023-02-14 16:34:00'),
    ('Éléonore', 'Rousseau', 'eleonore.rousseau@example.com', '33000', 'Bordeaux', 'hashed_password_5', 'token_5', 89012345678901, 'Company E', 'admin', '2023-02-14 16:34:00', '2023-02-14 16:34:00');
 */


INSERT INTO "category" (
    "name"
) VALUES
    ('Services à la personne'),
    ('Bâtiment et construction'),
    ('Réparation et maintenance'),
    ('Coiffure et esthétique'),
    ('Enseignement et tutorat'),
    ('Restauration'),
    ('Santé et bien-être'),
    ('Couture et mode'),
    ('Déménagement et transport'),
    ('Evénementiel'),
    ('Informatique et technologies de l''information'),
    ('Immobilier'),
    ('Animaux'),
    ('Arts et divertissement'),
    ('horticulture et jardinage'),
    ('Nettoyage et entretien');


INSERT INTO "job" (
    "name", 
    "description", 
    "category_id"

) VALUES
    ('Baby-sitter/garde d''enfants', 'Garde occasionnelle ou régulière d''enfants, souvent réalisée à domicile des parents.', 1),
    ('Aide à domicile/auxiliaire de vie', 'Assistance aux personnes âgées, handicapées ou dépendantes pour les actes de la vie quotidienne.', 1),
    ('Assistant maternel/garde d''enfants à domicile', 'Accueil et garde d''enfants à domicile dans un cadre familial.', 1),
    ('Aide ménager/ménagère', 'Entretien et nettoyage du domicile, du linge et des espaces de vie.', 1),
    ('Accompagnateur/trice pour personnes âgées ou handicapées', 'Assistance et accompagnement dans les déplacements, les sorties et les activités quotidiennes.', 1),
    ('Garde d''animaux domestiques (petsitter)', 'Garde et soins des animaux de compagnie pendant l''absence des propriétaires.', 1),
    ('Cours particuliers à domicile (soutien scolaire)', 'Enseignement et soutien pédagogique individualisé dans différentes matières.', 1),
    ('Assistant personnel (aide administrative, courses, etc.)', 'Assistance dans les tâches administratives, les courses et les démarches quotidiennes.', 1),
    ('Cuisinier/cuisinière à domicile', 'Préparation de repas à domicile selon les préférences et les besoins spécifiques des clients.', 1),
    ('Soins esthétiques à domicile (esthéticien(ne))', 'Soins de beauté et de bien-être à domicile, tels que les massages, les soins du visage, etc.', 1),
    ('Préparateur de repas à domicile', 'Préparation et livraison de repas cuisinés à domicile.', 1),
    ('Entretien de jardin et de plantes d''intérieur', 'Entretien des espaces verts, des jardins et des plantes d''intérieur.', 1),
    ('Coiffeur/coiffeuse à domicile', 'Services de coiffure réalisés à domicile, tels que la coupe, la coloration, etc.', 1),
    ('Services de massage thérapeutique à domicile', 'Massages thérapeutiques et de relaxation effectués à domicile.', 1),
    ('Plombier', 'Installation, réparation et entretien des systèmes de plomberie.', 2),
    ('Électricien', 'Installation, réparation et maintenance des systèmes électriques et des appareils électriques.', 2),
    ('Architecte paysagiste', 'Conception de plans et de dessins pour la création ou la rénovation de jardins et d''espaces paysagers.', 2),
    ('Menuisier/charpentier/ébéniste', 'Travail du bois pour la construction, la rénovation et l''aménagement intérieur.', 2),
    ('Maçon', 'Construction, réparation et restauration des structures en maçonnerie (murs, fondations, etc.).', 2),
    ('Plâtrier/peintre', 'Application de revêtements muraux, plâtrage et peinture des surfaces intérieures et extérieures.', 2),
    ('Carreleur', 'Pose de carrelage sur les sols et les murs.', 2),
    ('Couvreur', 'Installation, réparation et entretien des toitures.', 2),
    ('Chauffagiste', 'Installation, réparation et entretien des systèmes de chauffage et de ventilation.', 2),
    ('Serrurier/métallier', 'Fabrication, installation et réparation des structures métalliques et des systèmes de serrurerie.', 2),
    ('Terrassier', 'Préparation des terrains et des fondations pour la construction.', 2),
    ('Grutier', 'Utilisation et manipulation de grues sur les chantiers de construction.', 2),
    ('Ingénieur en génie civil', 'Conception, supervision et gestion de projets de construction civile.', 2),
    ('Architecte', 'Conception et planification des projets architecturaux.', 2),
    ('Technicien en bâtiment', 'Inspection, évaluation et suivi des travaux de construction.', 2),
    ('Peintre en bâtiment', 'Application de peinture sur les surfaces intérieures et extérieures des bâtiments.', 2),
    ('Réparateur d''électroménager', 'Réparation et entretien des appareils électroménagers tels que les lave-linge, les réfrigérateurs, etc.', 3),
    ('Réparateur de téléphones/mobiles/tablettes', 'Réparation et entretien des téléphones portables, des smartphones et des tablettes.', 3),
    ('Mécanicien automobile', 'Réparation, entretien et diagnostic des véhicules automobiles.', 3),
    ('Soudeur/soudeuse', 'Assemblage de pièces métalliques en utilisant divers procédés de soudage.', 3),
    ('Tourneur/fraiseur', 'Usinage de pièces métalliques en rotation pour obtenir des formes et des dimensions spécifiques.', 3),
    ('Technicien informatique', 'Réparation, dépannage et maintenance des ordinateurs et des systèmes informatiques.', 3),
    ('Technicien en électronique', 'Réparation et maintenance des équipements électroniques et des appareils électroniques.', 3),
    ('Technicien en HVAC (Chauffage, Ventilation, Climatisation)', 'Installation, maintenance et réparation des systèmes de chauffage, de ventilation et de climatisation.', 3),
    ('Coiffeur/coiffeuse', 'Services de coupe, de coloration, de coiffage et de traitement capillaire.', 4),
    ('Esthéticien(ne)', 'Services de soins esthétiques tels que les soins du visage, les épilations, les manucures, etc.', 4),
    ('Maquilleur/maquilleuse', 'Services de maquillage professionnel pour les occasions spéciales et les événements.', 4),
    ('Prothésiste ongulaire', 'Pose et entretien des faux ongles et des extensions d''ongles.', 4),
    ('Spécialiste des extensions capillaires', 'Pose et entretien des extensions de cheveux.', 4),
    ('Barbier', 'Services de coupe, de rasage et d''entretien de la barbe pour hommes.', 4),
    ('Styliste ongulaire', 'Conception et réalisation de décorations artistiques sur les ongles.', 4),
    ('Technicien(ne) en extension de cils', 'Pose et entretien des extensions de cils pour un regard plus fourni et plus intense.', 4),
    ('Coloriste capillaire', 'Expert en coloration capillaire, y compris les techniques de balayage, d''ombré, etc.', 4),
    ('Spécialiste des sourcils', 'Conception, épilation et teinture des sourcils pour améliorer leur apparence.', 4),
    ('Professeur particulier', 'Enseignement et soutien pédagogique individualisé dans différentes matières.', 5),
    ('Tuteur/tutrice', 'Soutien académique et suivi personnalisé des élèves dans leurs études.', 5),
    ('Enseignant de langue étrangère', 'Enseignement des langues étrangères (anglais, espagnol, français, etc.) à des élèves de tous niveaux.', 5),
    ('Coach éducatif', 'Accompagnement et conseils pour améliorer les compétences académiques et les performances scolaires.', 5),
    ('Précepteur/préceptrice', 'Enseignement et apprentissage individuel dans un domaine spécifique.', 5),
    ('Animateur/trice scolaire', 'Encadrement et animation d''activités parascolaires et éducatives.', 5),
    ('Éducateur/trice spécialisé(e)', 'Soutien éducatif et pédagogique aux enfants et aux adolescents en difficulté.', 5),
    ('Enseignant de musique', 'Cours particuliers et enseignement musical pour divers instruments et disciplines.', 5),
    ('Professeur de soutien scolaire en ligne', 'Enseignement et support pédagogique via des plateformes d''apprentissage en ligne.', 5),
    ('Formateur/formatrice professionnel(le)', 'Enseignement et formation professionnelle dans un domaine spécifique.', 5),
    ('Cuisinier/cuisinière à domicile', 'Préparation de repas à domicile selon les préférences et les besoins spécifiques des clients.', 6),
    ('Chef privé', 'Service de restauration personnalisé à domicile pour des événements ou des occasions spéciales.', 6),
    ('Traiteur', 'Préparation et livraison de repas pour des événements et des occasions spéciales.', 6),
    ('Pâtissier/pâtissière à domicile', 'Préparation de pâtisseries et de desserts artisanaux à domicile.', 6),
    ('Sommelier/sommelière à domicile', 'Conseils en sélection et en service de vins et de boissons pour des repas à domicile.', 6),
    ('Serveur/serveuse à domicile', 'Service de table et d''assistance lors de dîners et d''événements à domicile.', 6),
    ('Consultant en restauration', 'Conseils et expertise en gestion et en développement de restaurants et d''établissements de restauration.', 6),
    ('Gérant(e) de restaurant', 'Responsable de la gestion opérationnelle et du bon fonctionnement d''un établissement de restauration.', 6),
    ('Boulanger/boulangère à domicile', 'Préparation de pains et de produits de boulangerie artisanaux à domicile.', 6),
    ('Chef à domicile', 'Service de chef personnel pour la préparation de repas haut de gamme à domicile.', 6),
    ('Massothérapeute', 'Pratique de différents types de massage pour la relaxation et le soulagement des tensions musculaires.', 7),
    ('Coach sportif personnel', 'Encadrement individuel dans la pratique d''activités physiques et sportives.', 7),
    ('Nutritionniste/diététicien(ne)', 'Conseils en nutrition et élaboration de programmes alimentaires personnalisés.', 7),
    ('Infirmier/infirmière à domicile', 'Soins infirmiers et suivi médical à domicile pour les patients nécessitant une assistance.', 7),
    ('Coach de bien-être personnel', 'Encadrement individuel pour améliorer le bien-être physique, mental et émotionnel.', 7),
    ('Spécialiste en médecine alternative', 'Pratique de thérapies alternatives telles que l''acupuncture, la naturopathie, etc.', 7),
    ('Yogathérapeute', 'Utilisation du yoga comme moyen de guérison et de soulagement des troubles physiques et mentaux.', 7),
    ('Praticien(ne) en Reiki', 'Pratique de la thérapie énergétique Reiki pour la relaxation et la guérison.', 7),
    ('Psychologue/psychothérapeute', 'Thérapie et soutien psychologique pour les troubles émotionnels et mentaux.', 7),
    ('Ostéopathe/chiropracteur', 'Pratique de techniques manuelles pour soulager les douleurs musculo-squelettiques et améliorer la santé globale.', 7),
    ('Couturier/couturière', 'Conception, création et ajustement de vêtements sur mesure.', 8),
    ('Styliste de mode', 'Création de designs de vêtements et de collections pour les marques de mode.', 8),
    ('Modéliste', 'Création de modèles de vêtements à partir de croquis ou de concepts.', 8),
    ('Tailleur/tailleuse', 'Conception et fabrication de vêtements sur mesure, notamment des costumes et des tailleurs.', 8),
    ('Retoucheur/retoucheuse', 'Ajustement et modification de vêtements pour un ajustement parfait.', 8),
    ('Designer textile', 'Conception de motifs et de dessins pour les tissus et les textiles.', 8),
    ('Costumier/costumière', 'Conception et fabrication de costumes pour le théâtre, le cinéma, la télévision, etc.', 8),
    ('Accessoiriste', 'Conception et fabrication d''accessoires de mode tels que des sacs à main, des bijoux, etc.', 8),
    ('Brodeur/brodeuse', 'Broderie décorative sur des vêtements, des accessoires ou des textiles.', 8),
    ('Modéliste de chaussures', 'Conception et création de modèles de chaussures pour les marques de chaussures.', 8),
    ('Déménageur', 'Aide au chargement, au transport et au déchargement des biens lors d''un déménagement.', 9),
    ('Chauffeur de déménagement', 'Conduite du véhicule de déménagement et transport sécurisé des biens.', 9),
    ('Emballage et déballage', 'Emballage professionnel des biens avant le déménagement et déballage à la destination finale.', 9),
    ('Garde-meubles', 'Stockage temporaire des biens dans un entrepôt sécurisé avant, pendant ou après le déménagement.', 9),
    ('Livraison de meubles', 'Livraison et installation de meubles à domicile pour les particuliers et les entreprises.', 9),
    ('Transporteur de marchandises', 'Transport de marchandises ou de biens d''un lieu à un autre.', 9),
    ('Livreur de colis', 'Livraison de colis et de marchandises à domicile ou sur le lieu de travail des destinataires.', 9),
    ('Transporteur de personnes', 'Transport de passagers d''un lieu à un autre, souvent par taxi, VTC ou service de navette.', 9),
    ('Service de navette aéroportuaire', 'Transport de passagers entre l''aéroport et leur lieu de destination (hôtel, domicile, etc.).', 9),
    ('Organisateur d''événements', 'Planification, coordination et gestion d''événements tels que les mariages, les conférences, etc.', 10),
    ('Coordinateur logistique d''événements', 'Gestion des aspects logistiques d''un événement, y compris la coordination des fournisseurs, la gestion des ressources, etc.', 10),
    ('Décorateur d''événements', 'Conception et aménagement de la décoration pour les événements, y compris la mise en place des décors, des fleurs, etc.', 10),
    ('Traiteur d''événements', 'Fourniture de services de restauration pour les événements, y compris la planification de menus, la préparation des repas, etc.', 10),
    ('Animateur d''événements', 'Animation et divertissement lors des événements pour divertir les invités.', 10),
    ('Maître de cérémonie', 'Animation et coordination des événements, y compris l''animation des discours et des présentations.', 10),
    ('Photographe événementiel', 'Photographie professionnelle lors d''événements tels que les mariages, les anniversaires, etc.', 10),
    ('Vidéaste événementiel', 'Captation vidéo professionnelle lors d''événements spéciaux pour en garder des souvenirs.', 10),
    ('DJ/animateur musical', 'Fourniture de services musicaux et d''animation pour les événements, y compris la sélection et la diffusion de musique.', 10),
    ('Technicien son et lumière', 'Installation et exploitation de l''équipement sonore et d''éclairage pour les événements.', 10),
    ('Sécurité événementielle', 'Assurer la sécurité des participants et du lieu lors d''événements.', 10),
    ('Service de transport d''événements', 'Fourniture de services de transport pour les participants et les équipements lors d''événements.', 10),
    ('Développeur web', 'Conception, développement et maintenance de sites web.', 11),
    ('Développeur d''applications mobiles', 'Conception, développement et maintenance d''applications mobiles pour iOS et Android.', 11),
    ('Administrateur système', 'Gestion et maintenance des systèmes informatiques et des réseaux.', 11),
    ('Ingénieur en sécurité informatique', 'Protection des systèmes informatiques contre les cybermenaces et les attaques.', 11),
    ('Analyste de données', 'Collecte, analyse et interprétation des données pour prendre des décisions éclairées.', 11),
    ('Architecte cloud', 'Conception et gestion de l''infrastructure cloud pour les entreprises.', 11),
    ('Spécialiste en intelligence artificielle', 'Développement et déploiement de solutions basées sur l''intelligence artificielle.', 11),
    ('Expert en blockchain', 'Développement et mise en œuvre de solutions basées sur la technologie de la blockchain.', 11),
    ('Spécialiste en apprentissage automatique (machine learning)', 'Développement de modèles d''apprentissage automatique pour l''analyse de données et la prédiction.', 11),
    ('Administrateur de bases de données', 'Gestion et maintenance des bases de données pour assurer la disponibilité et la sécurité des données.', 11),
    ('Ingénieur réseau', 'Conception, mise en œuvre et maintenance des infrastructures réseau.', 11),
    ('Analyste en sécurité des systèmes d''information', 'Identification et prévention des risques liés à la sécurité des systèmes d''information.', 11),
    ('Développeur de jeux vidéo', 'Conception, développement et programmation de jeux vidéo.', 11),
    ('Consultant en technologie de l''information', 'Fourniture de conseils et d''expertise en matière de technologies de l''information.', 11),
    ('Testeur de logiciels', 'Évaluation et validation de la qualité et de la fonctionnalité des logiciels.', 11),
    ('Formateur en informatique', 'Transmission de connaissances et de compétences en informatique par le biais de formations.', 11),
    ('Monteur/réparateur informatique', 'Montage, réparation et entretien du matériel informatique et des périphériques.', 11),
    ('Agent immobilier', 'Médiateur entre les acheteurs et les vendeurs pour l''achat, la vente ou la location de biens immobiliers.', 12),
    ('Courtier immobilier', 'Intermédiaire financier spécialisé dans les transactions immobilières, fournissant des conseils et des services de courtage.', 12),
    ('Gestionnaire de biens immobiliers', 'Administration et gestion de biens immobiliers pour le compte des propriétaires.', 12),
    ('Expert en évaluation immobilière', 'Estimation de la valeur marchande des biens immobiliers pour diverses transactions.', 12),
    ('Promoteur immobilier', 'Développement et gestion de projets immobiliers, y compris la construction de nouveaux bâtiments.', 12),
    ('Architecte', 'Conception et planification de projets de construction et de rénovation.', 12),
    ('Urbaniste', 'Planification et aménagement du territoire urbain en tenant compte des aspects sociaux, économiques et environnementaux.', 12),
    ('Notaire immobilier', 'Préparation et certification des actes juridiques liés aux transactions immobilières.', 12),
    ('Agent de location immobilière', 'Recherche de locataires et gestion des baux pour les propriétaires de biens immobiliers.', 12),
    ('Expert en développement immobilier', 'Analyse et évaluation des opportunités d''investissement immobilier.', 12),
    ('Conseiller en investissement immobilier', 'Fourniture de conseils en matière d''investissement dans l''immobilier.', 12),
    ('Technicien en bâtiment', 'Inspection et évaluation des biens immobiliers pour identifier les problèmes structurels et les besoins de réparation.', 12),
    ('Déménageur professionnel', 'Service de déménagement professionnel pour les particuliers et les entreprises.', 12),
    ('Courtier en prêts immobiliers', 'Intermédiaire financier spécialisé dans l''obtention de prêts immobiliers pour les acheteurs de biens immobiliers.', 12),
    ('Expert en financement immobilier', 'Analyse des options de financement pour les projets immobiliers et la recherche de sources de financement.', 12),
    ('Vétérinaire', 'Pratique médicale pour les animaux, fournissant des soins de santé, des traitements et des interventions chirurgicales.', 13),
    ('Toiletteur/toiletteuse pour animaux', 'Entretien et toilettage des animaux de compagnie pour maintenir leur hygiène et leur apparence.', 13),
    ('Comportementaliste animalier', 'Évaluation et modification du comportement des animaux pour résoudre les problèmes de comportement.', 13),
    ('Dresseur/dresseuse d''animaux', 'Entraînement et dressage des animaux pour développer des compétences et des comportements souhaitables.', 13),
    ('Garde d''animaux', 'Service de garde d''animaux à domicile ou dans des établissements spécialisés pendant l''absence des propriétaires.', 13),
    ('Éducateur/éducatrice canin', 'Formation des chiens et de leurs propriétaires pour favoriser une relation harmonieuse et obéissante.', 13),
    ('Éleveur/éleveuse d''animaux de compagnie', 'Élevage et reproduction de races spécifiques d''animaux de compagnie.', 13),
    ('Thérapeute pour animaux', 'Fourniture de thérapie et de soins spécialisés pour les animaux souffrant de traumatismes ou de problèmes de santé mentale.', 13),
    ('Consultant en nutrition animale', 'Fourniture de conseils en matière de nutrition et de régime alimentaire pour les animaux de compagnie et d''élevage.', 13),
    ('Photographe animalier', 'Photographie professionnelle d''animaux pour les propriétaires d''animaux de compagnie, les zoos, etc.', 13),
    ('Expert en bien-être animal', 'Évaluation et promotion du bien-être des animaux dans divers environnements et contextes.', 13),
    ('Artiste de spectacle', 'Interprétation artistique dans des spectacles tels que le théâtre, la danse, la musique, etc.', 14),
    ('Musicien/musicienne', 'Interprétation musicale en solo, en groupe ou dans un orchestre.', 14),
    ('Acteur/actrice', 'Interprétation de rôles dans des productions théâtrales, cinématographiques ou télévisuelles.', 14),
    ('Réalisateur/réalisatrice', 'Direction artistique et créative de productions audiovisuelles telles que des films, des publicités, etc.', 14),
    ('Scénariste', 'Écriture de scénarios pour des productions cinématographiques, télévisuelles ou théâtrales.', 14),
    ('Peintre', 'Création d''œuvres d''art picturales utilisant diverses techniques et supports.', 14),
    ('Sculpteur/sculptrice', 'Création d''œuvres d''art en trois dimensions à partir de matériaux tels que la pierre, le bois, le métal, etc.', 14),
    ('Illustrateur/illustratrice', 'Création d''illustrations pour des livres, des magazines, des affiches, etc.', 14),
    ('Danseur/danseuse', 'Interprétation chorégraphique dans divers styles de danse.', 14),
    ('Chanteur/chanteuse', 'Interprétation vocale en solo, en groupe ou dans un chœur.', 14),
    ('Animateur/animatrice', 'Animation d''événements, de spectacles ou de programmes télévisés ou radiophoniques.', 14),
    ('Designer graphique', 'Création d''éléments visuels tels que des logos, des affiches, des emballages, etc.', 14),
    ('Maquilleur/maquilleuse', 'Application de maquillage pour des productions artistiques, des événements ou des séances photo.', 14),
    ('Costumier/costumière', 'Conception et création de costumes pour des productions théâtrales, cinématographiques ou télévisuelles.', 14),
    ('Jardinier paysagiste', 'Conception, aménagement et entretien des jardins et espaces verts pour des particuliers ou des entreprises.', 15),
    ('Maraîcher', 'Culture de légumes, fruits et autres plantes comestibles en plein champ ou sous serre, souvent destinés à la vente directe ou aux marchés locaux.', 15),
    ('Pépiniériste', 'Production, culture et vente de jeunes plants d''arbres, d''arbustes et de plantes diverses.', 15),
    ('Fleuriste', 'Création et vente de compositions florales, entretien et vente de fleurs et plantes décoratives.', 15),
    ('Nettoyeur de véhicules', 'Nettoyage intérieur et extérieur de voitures, motos, engins de chantier ou bateaux, incluant le lavage, le polissage et l''entretien des surfaces et des matériaux.', 16),
    ('Agent d''entretien', 'Nettoyage et entretien des locaux, bureaux, et espaces publics ou privés.', 16),
    ('Exterminateur de nuisibles', 'Éradication et contrôle des infestations de nuisibles comme les rats, souris, cafards, punaises de lit et autres parasites, en utilisant des méthodes chimiques, mécaniques ou biologiques.', 16);


/* INSERT INTO "request"(
    "urgent",
    "title",
    "message",

    "range",
    "user_id",
    "job_id"
) VALUES
    (true, 'Baby-sitter pour ce soir', 'Nous cherchons une personne de confiance pour garder nos enfants ce soir.', '75001', 10, 1, 1),
    (false, 'Aide à domicile pour personne âgée', 'Nous recherchons une personne pour aider ma mère dans les tâches quotidiennes.', '91300', 10, 2, 2),
    (true, 'Cours particuliers de mathématiques', 'Je cherche un professeur pour aider mon fils à améliorer ses résultats en mathématiques.', '69001', 10, 3, 3),
    (false, 'Réparation de fuite d''eau', 'Nous avons une fuite d''eau dans la salle de bain et nous cherchons un plombier pour la réparer.', '13005', 10, 4, 11),
    (true, 'Cours de guitare pour débutant', 'Je souhaite apprendre à jouer de la guitare et je cherche un professeur pour des cours particuliers.', '33000', 10, 5, 8);
 */


/* INSERT INTO "conversation" (
    "title", 
    "participant_1", 
    "participant_2", 
    "request_id"
) VALUES 
    ('Conversation 1', 1, 2, 1),
    ('Conversation 2', 2, 3, 2),
    ('Conversation 3', 3, 4, 3),
    ('Conversation 4', 4, 5, 4),
    ('Conversation 5', 5, 1, 5);
 */


/* INSERT INTO "message" (
    "content",
    "sender",
    "receiver",
    "conversation_id",
    "created_at",
    "updated_at"
) VALUES
    ('Hello, how are you?', 1, 2, 1, '2023-01-01 15:00:00', '2023-01-01 15:00:00'),
    ('I am doing well, thank you!', 2, 1, 2, '2023-01-01 15:30:00', '2023-01-01 15:30:00'),
    ('Any plans for the weekend?', 3, 1, 3, '2023-01-02 10:00:00', '2023-01-02 10:00:00'),
    ('Not yet, maybe some relaxation.', 1, 3, 4, '2023-01-02 11:00:00', '2023-01-02 11:00:00'),
    ('Meeting at 2 PM today.', 2, 3, 5, '2023-01-03 13:45:00', '2023-01-03 13:45:00');
 */

/* 
INSERT INTO "chat_media" (
    "url", 
    "sender", 
    "receiver", 
    "updated_at"
) VALUES
    ('http://exemple.com/image1.jpg', 1, 2, '2024-02-14T12:00:00Z'),
    ('http://exemple.com/image2.jpg', 2, 3, '2024-02-13T15:30:00Z'),
    ('http://exemple.com/image3.jpg', 3, 4, '2024-02-15T10:45:00Z'),
    ('http://exemple.com/image4.jpg', 4, 5, '2024-02-16T08:20:00Z'),
    ('http://exemple.com/image5.jpg', 5, 1, '2024-02-17T14:10:00Z');



INSERT INTO "message_has_chat_media" (
    "chat_media_id", 
    "message_id", 
    "updated_at"
) VALUES
    (1, 1, '2024-02-14T12:00:00Z'),
    (2, 2, '2024-02-13T15:30:00Z'),
    (3, 3, '2024-02-15T10:45:00Z'),
    (4, 4, '2024-02-16T08:20:00Z'),
    (5, 5, '2024-02-17T14:10:00Z');
 */


COMMIT;
