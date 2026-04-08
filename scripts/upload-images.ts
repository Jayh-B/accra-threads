// upload-images.ts

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

const uploadProductImages = async () => {
    const imagesFolder = path.join(__dirname, 'Product Images');
    const files = fs.readdirSync(imagesFolder);

    for (const file of files) {
        const filePath = path.join(imagesFolder, file);
        const fileBuffer = fs.readFileSync(filePath);

        // Upload the image to Supabase storage
        const { data, error } = await supabase.storage
            .from('your_bucket_name')
            .upload(`product-images/${file}`, fileBuffer);

        if (error) {
            console.error(`Error uploading ${file}:`, error);
        } else {
            console.log(`Uploaded ${file} successfully:`,
                data);
        }
    }
};

uploadProductImages().catch(console.error);