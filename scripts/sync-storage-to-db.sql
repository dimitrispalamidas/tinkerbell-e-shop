-- Script για συγχρονισμό εικόνων από Storage στη βάση
-- Θα χρησιμοποιηθεί με την apply_migration

DO $$
DECLARE
    storage_file RECORD;
    product_sku TEXT;
    image_urls TEXT[];
    current_sku TEXT := '';
BEGIN
    -- Διαγραφή όλων των εικόνων πρώτα
    UPDATE products SET images = ARRAY[]::text[];
    
    RAISE NOTICE 'Cleared all existing images';
    
    -- Loop μέσα από όλα τα αρχεία στο Storage
    FOR storage_file IN 
        SELECT name FROM storage.objects 
        WHERE bucket_id = 'products' 
        ORDER BY name
    LOOP
        -- Πάρε το SKU από το όνομα του αρχείου (πρώτο μέρος πριν το _)
        product_sku := UPPER(SPLIT_PART(storage_file.name, '_', 1));
        
        -- Αν άλλαξε το SKU, ενημέρωσε το προηγούμενο προϊόν
        IF current_sku != '' AND current_sku != product_sku THEN
            UPDATE products 
            SET images = image_urls 
            WHERE sku = current_sku;
            
            RAISE NOTICE 'Updated %: % images', current_sku, array_length(image_urls, 1);
            image_urls := ARRAY[]::text[];
        END IF;
        
        current_sku := product_sku;
        
        -- Πρόσθεσε το URL στο array
        image_urls := array_append(
            image_urls, 
            'https://bkuqjcbyabaanzgisgcz.supabase.co/storage/v1/object/public/products/' || storage_file.name
        );
    END LOOP;
    
    -- Ενημέρωσε το τελευταίο προϊόν
    IF current_sku != '' THEN
        UPDATE products 
        SET images = image_urls 
        WHERE sku = current_sku;
        
        RAISE NOTICE 'Updated %: % images', current_sku, array_length(image_urls, 1);
    END IF;
    
    RAISE NOTICE 'Sync complete!';
END $$;

-- Έλεγχος αποτελέσματος
SELECT 
    sku, 
    name_el,
    array_length(images, 1) as num_images
FROM products
WHERE images != ARRAY[]::text[]
ORDER BY sku;

