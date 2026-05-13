const fs = require('fs');

const categories = [
    { name: 'Vegetables', icon: '🍅', names: ['Carrot', 'Cucumber', 'Bell Pepper (Red)', 'Bell Pepper (Yellow)', 'Cabbage', 'Broccoli', 'Sweet Potato', 'Beetroot', 'Garlic', 'Ginger', 'Onion', 'Potato', 'Tomato', 'Spinach', 'Cauliflower', 'Green Peas', 'French Beans', 'Radish', 'Okra (Bhindi)', 'Bitter Gourd', 'Ridge Gourd', 'Bottle Gourd', 'Pumpkin', 'Drumstick', 'Capsicum', 'Corn'] },
    { name: 'Fruits', icon: '🍎', names: ['Apple (Kashmiri)', 'Banana (Robusta)', 'Orange (Nagpur)', 'Pomegranate', 'Papaya', 'Guava', 'Custard Apple', 'Watermelon', 'Muskmelon', 'Strawberry', 'Pineapple', 'Kiwi', 'Dragon Fruit', 'Pear', 'Chikoo', 'Grapes', 'Mangoes', 'Sweet Lime', 'Pears', 'Plums'] },
    { name: 'Grains', icon: '🌾', names: ['Brown Rice', 'Black Rice', 'Jowar', 'Bajra', 'Ragi (Nachni)', 'Maize', 'Barley', 'Oats', 'Wheat (Premium)', 'Basmati Rice (Long)', 'Sorghum', 'Foxtail Millet', 'Finger Millet'] },
    { name: 'Pulses', icon: '🫘', names: ['Chickpeas (Chana)', 'Green Gram (Moong)', 'Black Gram (Urad)', 'Kidney Beans (Rajma)', 'Moong Dal', 'Toor Dal', 'Masoor Dal', 'Urad Dal', 'Chana Dal', 'Kabuli Chana', 'Horse Gram', 'Soya Beans'] },
    { name: 'Dairy', icon: '🥛', names: ['Cow Milk', 'Buffalo Milk', 'Fresh Curd', 'Buttermilk', 'Butter', 'Paneer (Fresh)', 'Ghee (Pure)', 'Fresh Cream', 'Khoya', 'Condensed Milk'] },
    { name: 'Nuts', icon: '🥜', names: ['Almonds', 'Cashew', 'Walnut', 'Pistachio', 'Raisins', 'Peanuts', 'Flax Seeds', 'Chia Seeds', 'Pumpkin Seeds'] },
    { name: 'Spices', icon: '🌶️', names: ['Turmeric Powder', 'Red Chilli Powder', 'Black Pepper', 'Cumin Seeds', 'Coriander Powder', 'Saffron (Kesar)', 'Dry Ginger', 'Cardamom', 'Cinnamon', 'Cloves', 'Star Anise'] },
    { name: 'Oils', icon: '🫗', names: ['Groundnut Oil', 'Mustard Oil', 'Sunflower Oil', 'Coconut Oil', 'Sesame Oil', 'Olive Oil', 'Castor Oil'] }
];

const farmers = [
    { id: 'u1', name: 'Ramesh Kumar', region: 'Nashik' },
    { id: 'u3', name: 'Suresh Patel', region: 'Pune' },
    { id: 'u4', name: 'Vijay Bhosale', region: 'Lasalgaon' },
    { id: 'u5', name: 'David Fernandes', region: 'Mahabaleshwar' },
    { id: 'u6', name: 'Sita Devi', region: 'Guntur' },
    { id: 'u7', name: 'Ravi Malhotra', region: 'Indore' },
    { id: 'u8', name: 'Anita Kumari', region: 'Pune' },
    { id: 'u9', name: 'Mohan Desai', region: 'Nashik' },
    { id: 'u10', name: 'Gopi Rathod', region: 'Amravati' },
    { id: 'u11', name: 'Kavya Rao', region: 'Pune' }
];

const products = [];
let idCounter = 17;

const assetMapping = {
    // Vegetables
    'Carrot': { img: 'carrot.png' },
    'Cucumber': { img: 'cucumber.png' },
    'Broccoli': { img: 'cauliflower.png', filter: 'hue-rotate(50deg) brightness(0.9) saturate(1.2)' },
    'Ginger': { img: 'ginger.png' },
    'Garlic': { img: 'garlic.png' },
    'Green Peas': { img: 'green-peas.png' },
    'Spinach': { img: 'spinach.png' },
    'Cauliflower': { img: 'cauliflower.png' },
    'Tomato': { img: 'tomatoes.png' },
    'Onion': { img: 'onions.png' },
    'Potato': { img: 'potatoes.png' },
    'Okra': { img: 'green-chillies.png', filter: 'hue-rotate(10deg) brightness(1.1)' },
    'Capsicum': { img: 'tomatoes.png', filter: 'hue-rotate(50deg) saturate(1.2)' },
    'Bell Pepper': { img: 'tomatoes.png', filter: 'hue-rotate(50deg) saturate(1.2)' },

    // Fruits
    'Apple': { img: 'apple.png' },
    'Banana': { img: 'green-chillies.png', filter: 'hue-rotate(45deg) saturate(1.5) brightness(1.2)' },
    'Orange': { img: 'orange.png' },
    'Papaya': { img: 'mangoes.png', filter: 'hue-rotate(10deg) saturate(1.3)' },
    'Grapes': { img: 'grapes.png' },
    'Mango': { img: 'mangoes.png' },
    'Pomegranate': { img: 'tomatoes.png', filter: 'contrast(1.2) brightness(0.9)' },
    'Kiwi': { img: 'potatoes.png', filter: 'hue-rotate(-20deg) saturate(0.8)' },
    'Pineapple': { img: 'onions.png', filter: 'hue-rotate(30deg) brightness(1.1)' },

    // Grains & Pulses
    'Basmati': { img: 'basmati-rice.png' },
    'Wheat': { img: 'wheat-flour.png' },
    'Toor Dal': { img: 'toor-dal.png' },
    'Moong Dal': { img: 'moong-dal.png' },
    'Red Lentils': { img: 'red-lentils.png' },
    'Masoor': { img: 'red-lentils.png' },
    'Chickpeas': { img: 'chickpeas.png' },
    'Chana': { img: 'chickpeas.png' },

    // Dairy
    'Milk': { img: 'milk.png' },
    'Paneer': { img: 'paneer.png' },
    'Ghee': { img: 'groundnut-oil.png', filter: 'hue-rotate(20deg)' },

    // Spices
    'Turmeric': { img: 'turmeric.png' },
    'Saffron': { img: 'turmeric.png', filter: 'hue-rotate(-20deg) saturate(2)' },

    // Nuts & Seeds
    'Walnut': { img: 'walnut.png' },
    'Cashew': { img: 'cashew.png' },
    'Almonds': { img: 'cashew.png', filter: 'hue-rotate(-20deg) brightness(0.8)' },

    // Oils
    'Oil': { img: 'groundnut-oil.png' },
};

categories.forEach(cat => {
    cat.names.forEach((name) => {
        const farmer = farmers[Math.floor(Math.random() * farmers.length)];
        const price = Math.floor(Math.random() * (200 - 20 + 1)) + 20;
        const rating = (Math.random() * (5.0 - 4.2) + 4.2).toFixed(1);
        const reviews = Math.floor(Math.random() * 300) + 10;

        let img = '';
        let filter = 'none';

        // Find best match in assetMapping
        const matchKey = Object.keys(assetMapping).find(key => name.toLowerCase().includes(key.toLowerCase()));
        if (matchKey) {
            img = assetMapping[matchKey].img;
            filter = assetMapping[matchKey].filter || 'none';
        } else {
            // Category fallbacks
            switch (cat.name) {
                case 'Vegetables': img = 'tomatoes.png'; break;
                case 'Fruits': img = 'apple.png'; break;
                case 'Grains': img = 'basmati-rice.png'; break;
                case 'Pulses': img = 'toor-dal.png'; break;
                case 'Dairy': img = 'milk.png'; break;
                case 'Nuts': img = 'cashew.png'; break;
                case 'Spices': img = 'turmeric.png'; break;
                case 'Oils': img = 'groundnut-oil.png'; break;
                default: img = 'tomatoes.png';
            }
        }

        products.push({
            id: `p${idCounter++}`,
            img: `images/products/${img}`,
            filter: filter,
            emoji: cat.icon,
            name: `${name}`,
            farmerId: farmer.id,
            farmer: farmer.name,
            region: farmer.region,
            price: price,
            unit: (cat.name === 'Dairy' || cat.name === 'Oils' || cat.name === 'Organic') ? 'litre' : 'kg',
            rating: parseFloat(rating),
            reviews: reviews,
            cat: cat.name,
            desc: `Premium quality ${name} sourced directly from the farms of ${farmer.region}. Fresh, healthy, and natural.`
        });
    });
});

const dbData = {
    users: [],
    products: products,
    orders: []
};

fs.writeFileSync('/home/niraja/Desktop/pro1/kisanbazaar/data/db.json', JSON.stringify(dbData, null, 2));
console.log(`Generated ${products.length} products in correct DB format.`);
