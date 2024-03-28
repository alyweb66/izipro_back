-- Deploy izi:function to pg

BEGIN;

CREATE OR REPLACE FUNCTION insert_request_media(data jsonb)
RETURNS JSONB AS $$
DECLARE
    record jsonb;
    inserted_ids JSONB[];
    inserted_id INTEGER;
BEGIN
    -- Parcourir chaque objet dans le tableau JSON
    FOR record IN SELECT * FROM jsonb_array_elements(data)
    LOOP
        -- Insérer les données dans la table request_media et récupérer l'ID inséré
        INSERT INTO request_media (url, name, user_id)
        VALUES (record->>'url', record->>'name', (record->>'user_id')::int)
        RETURNING id INTO inserted_id;
        
        -- Ajouter l'ID inséré au tableau des IDs insérés
        inserted_ids := array_append(inserted_ids, inserted_id);
    END LOOP;
    
    -- Retourner le tableau des IDs insérés
    RETURN inserted_ids;
END;
$$ LANGUAGE plpgsql;

COMMIT;
