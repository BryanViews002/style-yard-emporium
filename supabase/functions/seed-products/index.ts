import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // First, create categories if they don't exist
    const categories = [
      {
        name: 'Clothes',
        slug: 'clothes',
        description: 'Contemporary fashion for every occasion',
        image: null
      },
      {
        name: 'Jewelry',
        slug: 'jewelry',
        description: 'Exquisite pieces crafted with precision',
        image: null
      }
    ];

    const categoryMap: { [key: string]: string } = {};

    for (const category of categories) {
      const { data: existingCategory } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category.slug)
        .single();

      if (!existingCategory) {
        const { data: newCategory, error } = await supabase
          .from('categories')
          .insert(category)
          .select()
          .single();

        if (error) throw error;
        categoryMap[category.slug] = newCategory.id;
      } else {
        categoryMap[category.slug] = existingCategory.id;
      }
    }

    // Sample products data
    const products = [
      {
        id: "1",
        name: "Silk Midi Dress",
        price: 189,
        image: "/src/assets/dress-1.jpg",
        category_id: categoryMap['clothes'],
        description: "Elegant silk midi dress perfect for day to evening wear. Features a flowing silhouette with subtle draping and a flattering neckline.",
        size_options: ["XS", "S", "M", "L", "XL"],
        color_options: ["#F4A6A6", "#E8D5C5", "#A8A8A8"],
        stock_quantity: 25,
        is_featured: true,
        is_active: true,
        slug: "silk-midi-dress",
        sku: "SMD-001",
        brand: "Style Yard",
        weight: 0.5,
        dimensions: { length: 120, width: 50, height: 2 }
      },
      {
        id: "2",
        name: "Gold Layer Necklace Set",
        price: 129,
        image: "/src/assets/jewelry-1.jpg",
        category_id: categoryMap['jewelry'],
        description: "Delicate layered necklace set featuring three complementary chains in 18k gold vermeil. Perfect for everyday elegance or special occasions.",
        color_options: ["#FFD700", "#FFA500"],
        stock_quantity: 15,
        is_featured: true,
        is_active: true,
        slug: "gold-layer-necklace-set",
        sku: "GLN-001",
        brand: "Style Yard",
        weight: 0.1,
        dimensions: { length: 45, width: 2, height: 0.5 }
      },
      {
        id: "3",
        name: "Tailored Blazer",
        price: 245,
        image: "/src/assets/blazer-1.jpg",
        category_id: categoryMap['clothes'],
        description: "Contemporary tailored blazer crafted from premium wool blend. Features structured shoulders and a modern slim fit.",
        size_options: ["XS", "S", "M", "L", "XL"],
        color_options: ["#2C2C2C", "#4A4A4A", "#1A1A1A"],
        stock_quantity: 20,
        is_featured: true,
        is_active: true,
        slug: "tailored-blazer",
        sku: "TB-001",
        brand: "Style Yard",
        weight: 0.8,
        dimensions: { length: 75, width: 60, height: 3 }
      },
      {
        id: "4",
        name: "Crystal Drop Earrings",
        price: 85,
        image: "/src/assets/jewelry-1.jpg",
        category_id: categoryMap['jewelry'],
        description: "Sparkling crystal drop earrings with gold-plated settings.",
        color_options: ["#FFD700"],
        stock_quantity: 30,
        is_featured: false,
        is_active: true,
        slug: "crystal-drop-earrings",
        sku: "CDE-001",
        brand: "Style Yard",
        weight: 0.05,
        dimensions: { length: 3, width: 1, height: 0.5 }
      },
      {
        id: "5",
        name: "Cashmere Wrap Top",
        price: 165,
        image: "/src/assets/dress-1.jpg",
        category_id: categoryMap['clothes'],
        description: "Luxurious cashmere wrap top with three-quarter sleeves.",
        size_options: ["XS", "S", "M", "L"],
        color_options: ["#F5F5DC", "#DDA0DD", "#F0E68C"],
        stock_quantity: 18,
        is_featured: false,
        is_active: true,
        slug: "cashmere-wrap-top",
        sku: "CWT-001",
        brand: "Style Yard",
        weight: 0.3,
        dimensions: { length: 65, width: 45, height: 2 }
      },
      {
        id: "6",
        name: "Statement Ring Set",
        price: 95,
        image: "/src/assets/jewelry-1.jpg",
        category_id: categoryMap['jewelry'],
        description: "Bold statement ring set featuring geometric designs.",
        color_options: ["#FFD700", "#C0C0C0"],
        stock_quantity: 0,
        is_featured: false,
        is_active: false,
        slug: "statement-ring-set",
        sku: "SRS-001",
        brand: "Style Yard",
        weight: 0.08,
        dimensions: { length: 2, width: 2, height: 1 }
      }
    ];

    // Insert products (skip if they already exist)
    for (const product of products) {
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('id', product.id)
        .single();

      if (!existingProduct) {
        const { error } = await supabase
          .from('products')
          .insert(product);

        if (error) {
          console.error(`Error inserting product ${product.name}:`, error);
        } else {
          console.log(`Inserted product: ${product.name}`);
        }
      } else {
        console.log(`Product ${product.name} already exists, skipping`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Products seeded successfully',
        productsCount: products.length,
        categoriesCount: categories.length
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error seeding products:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
