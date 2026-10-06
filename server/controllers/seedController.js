// server/controllers/seedController.js
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const Coupon = require('../models/Coupon');
const Review = require('../models/Review');
const DeliveryPartner = require('../models/DeliveryPartner');

exports.seedDatabase = async (req, res) => {
  try {
    // Clear existing data
    await Promise.all([
      User.deleteMany(),
      Restaurant.deleteMany(),
      Food.deleteMany(),
      Coupon.deleteMany(),
      Review.deleteMany(),
      DeliveryPartner.deleteMany(),
    ]);

    // 1. Create Demo Users
    const customerUser = await User.create({
      name: 'Aarav Sharma',
      email: 'customer@food.com',
      password: 'password123',
      role: 'customer',
      phone: '+91 98765 11111',
      addresses: [
        {
          title: 'Home',
          street: 'Flat 402, Lotus Boulevard, Sector 100',
          city: 'Noida',
          state: 'UP',
          zip: '201304',
          isDefault: true,
        },
        {
          title: 'Office',
          street: 'Cyber City, Tower B, 6th Floor',
          city: 'Gurugram',
          state: 'Haryana',
          zip: '122002',
          isDefault: false,
        },
      ],
    });

    const ownerUser = await User.create({
      name: 'Chef Marco Rossi',
      email: 'owner@food.com',
      password: 'password123',
      role: 'owner',
      phone: '+91 98765 22222',
    });

    const deliveryUser = await User.create({
      name: 'Vikram Singh',
      email: 'delivery@food.com',
      password: 'password123',
      role: 'delivery',
      phone: '+91 98765 33333',
    });

    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@food.com',
      password: 'password123',
      role: 'admin',
      phone: '+91 98765 44444',
    });

    // 2. Create Delivery Partner record
    await DeliveryPartner.create({
      user: deliveryUser._id,
      isVerified: true,
      isOnline: true,
      vehicleInfo: 'Honda Activa 6G - DL 4S 8921',
      earnings: 2450,
      rating: 4.8,
      ratingCount: 54,
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.6139],
      },
    });

    // 3. Create Coupons
    await Coupon.create([
      {
        code: 'WELCOME50',
        type: 'percentage',
        value: 50,
        maxDiscount: 100,
        minOrderValue: 199,
        isActive: true,
      },
      {
        code: 'FLAT20',
        type: 'fixed',
        value: 20,
        minOrderValue: 99,
        isActive: true,
      },
      {
        code: 'FEAST100',
        type: 'fixed',
        value: 100,
        minOrderValue: 499,
        isActive: true,
      },
    ]);

    // 4. Create Restaurants & Foods
    const restaurantsData = [
      {
        name: 'The Burger Barn',
        description: 'Juicy handcrafted smash burgers, crispy seasoned fries, and thick artisanal shakes.',
        address: 'Shop 14, Galleria Market, DLF Phase IV',
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=1200&auto=format&fit=crop&q=80',
        cuisine: ['Burgers', 'American', 'Fast Food'],
        rating: 4.7,
        ratingCount: 340,
        deliveryTime: '20-30 mins',
        deliveryFee: 30,
        minOrder: 150,
        offer: '50% OFF up to ₹100',
        isVegOnly: false,
        foods: [
          {
            name: 'Classic Smash Cheeseburger',
            description: 'Double smashed tender patty with cheddar, caramelized onions, house relish on brioche.',
            price: 249,
            category: 'Burgers',
            image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
            isVeg: false,
            preparationTime: 15,
            variants: [
              { name: 'Single Patty', price: 249 },
              { name: 'Double Patty', price: 299 },
              { name: 'Triple Monster Patty', price: 359 },
            ],
            addons: [
              { name: 'Extra Cheddar Cheese Slice', price: 30 },
              { name: 'Crispy Bacon Strips', price: 60 },
              { name: 'Truffle Mayo Dip', price: 40 },
            ],
          },
          {
            name: 'Crispy Truffle Veggie Burger',
            description: 'Crispy spiced potato & corn patty with melted provolone and truffle aioli.',
            price: 199,
            category: 'Burgers',
            image: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=600&auto=format&fit=crop&q=80',
            isVeg: true,
            preparationTime: 15,
            variants: [
              { name: 'Regular Brioche', price: 199 },
              { name: 'Whole Wheat Bun', price: 219 },
              { name: 'Gluten-Free Bun', price: 239 },
            ],
            addons: [
              { name: 'Jalapeno Poppers', price: 40 },
              { name: 'Extra Provolone Melt', price: 45 },
            ],
          },
          {
            name: 'Peri-Peri Loaded Fries',
            description: 'Golden skin-on fries dusted with African peri-peri and drizzled with cheese sauce.',
            price: 149,
            category: 'Sides',
            image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80',
            isVeg: true,
            preparationTime: 10,
            variants: [
              { name: 'Regular Box', price: 149 },
              { name: 'Jumbo Share Box', price: 219 },
            ],
            addons: [
              { name: 'Extra Cheese Sauce', price: 35 },
              { name: 'Smoked Chipotle Dip', price: 30 },
            ],
          },
          {
            name: 'Salted Caramel Thickshake',
            description: 'Rich vanilla bean ice cream blended with homemade salted caramel and pretzel crumb.',
            price: 169,
            category: 'Beverages',
            image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80',
            isVeg: true,
            preparationTime: 5,
            variants: [
              { name: 'Standard (350ml)', price: 169 },
              { name: 'Large (500ml)', price: 229 },
            ],
          },
        ],
      },
      {
        name: 'Bella Italia Pizzeria',
        description: 'Wood-fired Neapolitan sourdough pizzas crafted with San Marzano tomatoes and fior di latte.',
        address: '52 Olive Lane, Khan Market',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=1200&auto=format&fit=crop&q=80',
        cuisine: ['Pizza', 'Italian', 'Pasta'],
        rating: 4.8,
        ratingCount: 512,
        deliveryTime: '25-35 mins',
        deliveryFee: 40,
        minOrder: 250,
        offer: 'Flat ₹100 OFF above ₹499',
        isVegOnly: false,
        foods: [
          {
            name: 'Margherita D.O.P.',
            description: 'San Marzano tomato sauce, fresh mozzarella di bufala, organic sweet basil, extra virgin olive oil.',
            price: 389,
            category: 'Pizza',
            image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&auto=format&fit=crop&q=80',
            isVeg: true,
            preparationTime: 20,
            variants: [
              { name: 'Regular (8")', price: 389 },
              { name: 'Medium (10")', price: 499 },
              { name: 'Large (12")', price: 629 },
            ],
            addons: [
              { name: 'Extra Bufala Mozzarella', price: 70 },
              { name: 'Fresh Basil Pesto', price: 40 },
              { name: 'Garlic Herb Crust', price: 35 },
            ],
          },
          {
            name: 'Spicy Pepperoni & Hot Honey',
            description: 'Smoked mozzarella, spicy pork pepperoni, hot calabrian chili honey drizzle.',
            price: 499,
            category: 'Pizza',
            image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80',
            isVeg: false,
            preparationTime: 20,
            variants: [
              { name: 'Regular (8")', price: 499 },
              { name: 'Medium (10")', price: 629 },
              { name: 'Large (12")', price: 779 },
            ],
            addons: [
              { name: 'Extra Pepperoni Slices', price: 90 },
              { name: 'Hot Honey Drizzle Dip', price: 40 },
            ],
          },
          {
            name: 'Truffle Mushroom Fettuccine',
            description: 'Handmade fettuccine tossed in white wine garlic butter, cremini mushrooms, and black truffle oil.',
            price: 429,
            category: 'Pasta',
            image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?w=600&auto=format&fit=crop&q=80',
            isVeg: true,
            preparationTime: 18,
          },
          {
            name: 'Classic Italian Tiramisu',
            description: 'Espresso-soaked savoiardi layered with mascarpone cream and dusted with Valrhona cocoa.',
            price: 249,
            category: 'Desserts',
            image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80',
            isVeg: true,
            preparationTime: 5,
          },
        ],
      },
      {
        name: 'Tokyo Express Sushi',
        description: 'Fresh sashimi-grade rolls, steaming ramen bowls, and crispy gyoza made by Japanese master chefs.',
        address: '10 Sakura Arcade, Aerocity Worldmark',
        image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=1200&auto=format&fit=crop&q=80',
        cuisine: ['Asian', 'Sushi', 'Japanese'],
        rating: 4.9,
        ratingCount: 289,
        deliveryTime: '30-40 mins',
        deliveryFee: 50,
        minOrder: 300,
        offer: '20% OFF on all rolls',
        isVegOnly: false,
        foods: [
          {
            name: 'Dragon Roll (8 pcs)',
            description: 'Tempura prawn, creamy avocado, topped with torched salmon and eel glaze.',
            price: 549,
            category: 'Sushi',
            image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=600&auto=format&fit=crop&q=80',
            isVeg: false,
            preparationTime: 20,
            addons: [{ name: 'Wasabi Mayo', price: 30 }, { name: 'Pickled Ginger Extra', price: 20 }],
          },
          {
            name: 'Avocado Cream Crunch Roll (8 pcs)',
            description: 'Hass avocado, cucumber, cream cheese, rolled in tempura crispies and spicy mayo.',
            price: 429,
            category: 'Sushi',
            image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&auto=format&fit=crop&q=80',
            isVeg: true,
            preparationTime: 18,
          },
          {
            name: 'Tonkotsu Ramen Bowl',
            description: 'Slow-simmered rich broth, chashu pork, seasoned nitamago egg, menma, and spring scallions.',
            price: 489,
            category: 'Ramen',
            image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80',
            isVeg: false,
            preparationTime: 20,
          },
          {
            name: 'Pan-Fried Chicken Gyoza (6 pcs)',
            description: 'Crispy bottom Japanese dumplings with minced chicken, cabbage, and soy vinegar dipping sauce.',
            price: 279,
            category: 'Appetizers',
            image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&auto=format&fit=crop&q=80',
            isVeg: false,
            preparationTime: 15,
          },
        ],
      },
      {
        name: 'Royal Tandoor House',
        description: 'Authentic Nawabi dum biryanis, velvety butter chicken, and piping hot garlic naans.',
        address: 'Plot 7, Heritage Street, Connaught Place',
        image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1200&auto=format&fit=crop&q=80',
        cuisine: ['Indian', 'Biryani', 'Mughlai'],
        rating: 4.6,
        ratingCount: 680,
        deliveryTime: '25-35 mins',
        deliveryFee: 35,
        minOrder: 200,
        offer: 'Free Gulab Jamun on orders above ₹399',
        isVegOnly: false,
        foods: [
          {
            name: 'Dum Pukht Chicken Biryani',
            description: 'Fragrant long-grain aged basmati rice layered with spiced marinated chicken, saffron, and fried onions.',
            price: 349,
            category: 'Biryani',
            image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
            isVeg: false,
            preparationTime: 25,
            variants: [
              { name: 'Half (Serves 1)', price: 249 },
              { name: 'Full (Serves 2)', price: 349 },
              { name: 'Handi Matka Feast (Serves 4)', price: 649 },
            ],
            addons: [
              { name: 'Mirchi Ka Salan', price: 40 },
              { name: 'Boondi Raita', price: 30 },
              { name: 'Extra Boiled Egg', price: 25 },
            ],
          },
          {
            name: 'Paneer Butter Masala',
            description: 'Fresh cottage cheese cubes simmered in a luscious, mildly sweet makhani gravy with fenugreek.',
            price: 299,
            category: 'Curries',
            image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80',
            isVeg: true,
            preparationTime: 20,
          },
          {
            name: 'Butter Garlic Naan',
            description: 'Clay-oven baked leavened flatbread brushed with garlic butter and fresh coriander.',
            price: 65,
            category: 'Breads',
            image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
            isVeg: true,
            preparationTime: 8,
          },
          {
            name: 'Dal Makhani (Slow Cooked 24h)',
            description: 'Black lentils and kidney beans slow simmered with butter and fresh cream on charcoal.',
            price: 259,
            category: 'Curries',
            image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
            isVeg: true,
            preparationTime: 15,
          },
        ],
      },
      {
        name: 'Green Leaf Bowls & Salads',
        description: 'Vibrant organic harvest bowls, cold-pressed green elixirs, and plant-based protein platters.',
        address: 'B-24, Green Park Main Market',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&auto=format&fit=crop&q=80',
        cuisine: ['Healthy', 'Salads', 'Vegan'],
        rating: 4.8,
        ratingCount: 195,
        deliveryTime: '15-25 mins',
        deliveryFee: 25,
        minOrder: 150,
        offer: '15% OFF for healthy eating',
        isVegOnly: true,
        foods: [
          {
            name: 'Mediterranean Quinoa Power Bowl',
            description: 'Fluffy rainbow quinoa, roasted chickpeas, cucumber, cherry tomatoes, kalamata olives, tahini lemon dressing.',
            price: 299,
            category: 'Bowls',
            image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
            isVeg: true,
            preparationTime: 12,
            addons: [{ name: 'Grilled Herb Tofu', price: 50 }, { name: 'Extra Avocado Scoop', price: 60 }],
          },
          {
            name: 'Avocado Toast with Seeds',
            description: 'Crushed ripe avocados on artisanal sourdough, dusted with toasted chia, sesame, and chili flakes.',
            price: 229,
            category: 'Bites',
            image: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=600&auto=format&fit=crop&q=80',
            isVeg: true,
            preparationTime: 10,
          },
          {
            name: 'Cold-Pressed Detox Green Cleanse',
            description: 'Fresh pressed green apple, celery, baby spinach, cucumber, mint, and cold ginger.',
            price: 159,
            category: 'Beverages',
            image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80',
            isVeg: true,
            preparationTime: 5,
          },
        ],
      },
      {
        name: 'Sugar Rush Delights',
        description: 'Decadent Belgian waffles, gourmet artisanal cupcakes, molten chocolate jars, and gelato.',
        address: '4th Floor, Mall of India, Food Court',
        image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=1200&auto=format&fit=crop&q=80',
        cuisine: ['Desserts', 'Bakery', 'Beverages'],
        rating: 4.7,
        ratingCount: 420,
        deliveryTime: '20-30 mins',
        deliveryFee: 30,
        minOrder: 120,
        offer: 'Buy 2 Get 1 Free on Cupcakes',
        isVegOnly: true,
        foods: [
          {
            name: 'Nutella Stuffed Belgian Waffle',
            description: 'Golden crispy waffle loaded with warm Nutella, crushed hazelnuts, and Belgian chocolate curls.',
            price: 219,
            category: 'Waffles',
            image: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600&auto=format&fit=crop&q=80',
            isVeg: true,
            preparationTime: 15,
            addons: [{ name: 'Vanilla Ice Cream Scoop', price: 40 }],
          },
          {
            name: 'Molten Chocolate Lava Cake',
            description: 'Warm dark chocolate sponge cake with an oozing warm ganache center.',
            price: 189,
            category: 'Cakes',
            image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
            isVeg: true,
            preparationTime: 10,
          },
          {
            name: 'Red Velvet Gourmet Cupcake',
            description: 'Moist cocoa-buttermilk sponge topped with cream cheese frosting and red velvet crumble.',
            price: 99,
            category: 'Cupcakes',
            image: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=600&auto=format&fit=crop&q=80',
            isVeg: true,
            preparationTime: 5,
          },
        ],
      },
      {
        name: "Purr' Coffee",
        description: "Entice inne coffee with small and home make cappuccino.",
        address: "123 Coffee Lane, Brew District",
        image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80",
        banner: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=1200&auto=format&fit=crop&q=80",
        cuisine: ["Coffee", "Non Coffee", "Food", "Snack", "Dessert"],
        rating: 4.9,
        ratingCount: 150,
        deliveryTime: "15-25 mins",
        deliveryFee: 20,
        minOrder: 100,
        offer: "Free Croissant with every Coffee",
        isVegOnly: false,
        foods: [
          {
            name: "Cappuccino",
            description: "Entice inne coffee with small and home make cappuccino.",
            price: 20,
            category: "Coffee",
            image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&auto=format&fit=crop&q=80",
            isVeg: true,
            preparationTime: 5,
          },
          {
            name: "Coffee Latte",
            description: "Enticonce coffee with sassor catmes, botten coffee Latte.",
            price: 20,
            category: "Coffee",
            image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80",
            isVeg: true,
            preparationTime: 5,
          },
          {
            name: "Americano",
            description: "Fast ouisusnt recent and etion wed coffee ran americano.",
            price: 20,
            category: "Coffee",
            image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80",
            isVeg: true,
            preparationTime: 5,
          },
          {
            name: "V60",
            description: "High cond coffee with convector annost coffee wwnm.",
            price: 50,
            category: "Coffee",
            image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80",
            isVeg: true,
            preparationTime: 10,
          },
          {
            name: "Uji Matcha Latte",
            description: "Ceremonial grade Japanese Uji matcha stone-ground and whisked with creamy oat milk.",
            price: 18,
            category: "Non Coffee",
            image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80",
            isVeg: true,
            preparationTime: 5,
          },
          {
            name: "Butter Croissant",
            description: "Flaky, honeycomb-layered Parisian all-butter golden croissant baked fresh every morning.",
            price: 12,
            category: "Food",
            image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80",
            isVeg: true,
            preparationTime: 2,
          },
          {
            name: "Choco Chunk Cookie",
            description: "Gooey center with 70% dark Belgian chocolate chunks and a sprinkle of Maldon sea salt.",
            price: 8,
            category: "Snack",
            image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop&q=80",
            isVeg: true,
            preparationTime: 2,
          },
          {
            name: "Classic Tiramisu",
            description: "Espresso-soaked Italian savoiardi layered with whipped mascarpone and Valrhona cocoa.",
            price: 22,
            category: "Dessert",
            image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80",
            isVeg: true,
            preparationTime: 5,
          }
        ],
      },
    ];

    let totalCreatedFoods = 0;
    for (const restData of restaurantsData) {
      const { foods, ...restDetails } = restData;
      const restaurant = await Restaurant.create({
        ...restDetails,
        owner: ownerUser._id,
      });

      for (const foodItem of foods) {
        await Food.create({
          ...foodItem,
          restaurant: restaurant._id,
        });
        totalCreatedFoods++;
      }

      // Add realistic sample reviews
      await Review.create([
        {
          restaurant: restaurant._id,
          customer: customerUser._id,
          rating: 5,
          comment: 'Absolutely outstanding! Food arrived hot and fresh. Loved the packaging and taste!',
        },
        {
          restaurant: restaurant._id,
          customer: customerUser._id,
          rating: 4,
          comment: 'Very tasty and prompt delivery. Will definitely reorder soon.',
        },
      ]);
    }

    res.json({
      message: 'Database successfully seeded with gourmet restaurants, menus, coupons, and test users!',
      stats: {
        users: 4,
        restaurants: restaurantsData.length,
        foods: totalCreatedFoods,
        coupons: 3,
      },
      accounts: {
        customer: { email: 'customer@food.com', password: 'password123', role: 'customer' },
        owner: { email: 'owner@food.com', password: 'password123', role: 'owner' },
        delivery: { email: 'delivery@food.com', password: 'password123', role: 'delivery' },
        admin: { email: 'admin@food.com', password: 'password123', role: 'admin' },
      },
    });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ message: 'Server error during seeding', error: err.message });
  }
};
