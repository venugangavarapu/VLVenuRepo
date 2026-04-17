// Common Indian & International foods database
// Each entry: [name, calories per 100g, protein(g), carbs(g), fat(g), serving size label, serving grams]
const FOOD_DB = [
  // Grains & Rice
  ["White Rice (cooked)", 130, 2.7, 28, 0.3, "1 cup", 186],
  ["Brown Rice (cooked)", 123, 2.6, 26, 1, "1 cup", 195],
  ["Roti / Chapati", 297, 9, 56, 3.7, "1 piece", 40],
  ["Paratha (plain)", 326, 7, 47, 13, "1 piece", 80],
  ["Bread (white)", 265, 9, 49, 3.2, "1 slice", 30],
  ["Bread (whole wheat)", 247, 13, 41, 4.2, "1 slice", 30],
  ["Poha (cooked)", 110, 2.5, 23, 1, "1 cup", 180],
  ["Upma (cooked)", 145, 4, 26, 3.5, "1 cup", 170],
  ["Idli", 58, 2, 12, 0.4, "1 piece", 50],
  ["Dosa (plain)", 168, 4, 25, 5.7, "1 piece", 80],
  ["Sambar", 49, 2.8, 7, 1.2, "1 cup", 240],
  ["Dal (cooked)", 116, 7.6, 20, 0.7, "1 cup", 240],
  ["Rajma (cooked)", 127, 8.7, 22.8, 0.5, "1 cup", 256],
  ["Chole (cooked)", 164, 9, 27, 2.6, "1 cup", 240],
  ["Oats (cooked)", 71, 2.5, 12, 1.5, "1 cup", 234],

  // Vegetables
  ["Potato (boiled)", 87, 1.9, 20, 0.1, "1 medium", 150],
  ["Sweet Potato (boiled)", 86, 1.6, 20, 0.1, "1 medium", 150],
  ["Broccoli", 34, 2.8, 6.6, 0.4, "1 cup", 91],
  ["Spinach", 23, 2.9, 3.6, 0.4, "1 cup", 30],
  ["Tomato", 18, 0.9, 3.9, 0.2, "1 medium", 123],
  ["Onion", 40, 1.1, 9.3, 0.1, "1 medium", 110],
  ["Carrot", 41, 0.9, 9.6, 0.2, "1 medium", 61],
  ["Cucumber", 15, 0.65, 3.6, 0.1, "1 cup", 119],
  ["Cauliflower", 25, 1.9, 5, 0.3, "1 cup", 107],
  ["Peas (cooked)", 84, 5.4, 15.6, 0.2, "1 cup", 160],
  ["Beans (green)", 31, 1.8, 7, 0.2, "1 cup", 100],

  // Fruits
  ["Banana", 89, 1.1, 23, 0.3, "1 medium", 118],
  ["Apple", 52, 0.3, 14, 0.2, "1 medium", 182],
  ["Orange", 47, 0.9, 12, 0.1, "1 medium", 131],
  ["Mango", 60, 0.8, 15, 0.4, "1 cup", 165],
  ["Grapes", 69, 0.7, 18, 0.2, "1 cup", 151],
  ["Watermelon", 30, 0.6, 7.6, 0.2, "1 cup", 152],
  ["Papaya", 43, 0.5, 11, 0.3, "1 cup", 140],
  ["Guava", 68, 2.6, 14, 1, "1 medium", 90],
  ["Pomegranate", 83, 1.7, 19, 1.2, "1/2 cup", 87],

  // Dairy & Eggs
  ["Milk (full fat)", 61, 3.2, 4.8, 3.3, "1 cup", 244],
  ["Milk (low fat)", 42, 3.4, 5, 1, "1 cup", 244],
  ["Curd / Yogurt", 61, 3.5, 4.7, 3.3, "1 cup", 245],
  ["Paneer", 265, 18, 3.7, 20, "100g", 100],
  ["Egg (whole)", 155, 13, 1.1, 11, "1 large", 50],
  ["Egg White", 52, 11, 0.7, 0.2, "1 large", 33],
  ["Butter", 717, 0.9, 0.1, 81, "1 tbsp", 14],
  ["Ghee", 900, 0, 0, 99.5, "1 tbsp", 14],
  ["Cheese (cheddar)", 402, 25, 1.3, 33, "1 slice", 28],

  // Proteins - Meat & Fish
  ["Chicken Breast (cooked)", 165, 31, 0, 3.6, "100g", 100],
  ["Chicken Curry", 150, 16, 6, 7, "1 cup", 240],
  ["Mutton / Lamb (cooked)", 258, 25.6, 0, 16.7, "100g", 100],
  ["Fish (rohu, cooked)", 120, 22, 0, 3.5, "100g", 100],
  ["Tuna (canned)", 116, 25.5, 0, 1, "100g", 100],
  ["Salmon (cooked)", 206, 28.2, 0, 9.9, "100g", 100],
  ["Prawns (cooked)", 99, 24, 0.2, 0.3, "100g", 100],

  // Snacks & Fast Food
  ["Samosa", 262, 4.3, 30, 14, "1 piece", 100],
  ["Pakora", 325, 9, 32, 18, "5 pieces", 100],
  ["Bhel Puri", 180, 5, 30, 5, "1 plate", 150],
  ["Vada Pav", 290, 6.5, 42, 10, "1 piece", 140],
  ["Pizza (cheese)", 266, 11, 33, 10, "1 slice", 107],
  ["Burger", 295, 17, 24, 14, "1 burger", 150],
  ["French Fries", 312, 3.4, 41, 15, "medium serving", 117],
  ["Biryani (chicken)", 200, 10, 28, 5.5, "1 cup", 250],
  ["Biryani (veg)", 150, 4, 28, 3.5, "1 cup", 250],

  // Nuts & Seeds
  ["Almonds", 579, 21, 22, 50, "10 pieces", 28],
  ["Walnuts", 654, 15, 14, 65, "10 halves", 28],
  ["Cashews", 553, 18, 30, 44, "10 pieces", 28],
  ["Peanuts", 567, 26, 16, 49, "1/4 cup", 36],
  ["Pumpkin Seeds", 559, 30, 11, 49, "1/4 cup", 34],
  ["Chia Seeds", 486, 17, 42, 31, "1 tbsp", 12],
  ["Flax Seeds", 534, 18, 29, 42, "1 tbsp", 10],

  // Beverages
  ["Chai (with milk & sugar)", 65, 1.8, 10, 2, "1 cup", 240],
  ["Coffee (with milk)", 40, 1.5, 6, 1.5, "1 cup", 240],
  ["Black Coffee", 2, 0.3, 0, 0, "1 cup", 240],
  ["Fruit Juice (orange)", 112, 1.7, 26, 0.5, "1 cup", 248],
  ["Coconut Water", 46, 1.7, 8.9, 0.5, "1 cup", 240],
  ["Buttermilk (chaas)", 40, 3.3, 4.9, 0.9, "1 cup", 240],
  ["Lassi (sweet)", 150, 5, 22, 4, "1 glass", 300],

  // Sweets & Desserts
  ["Gulab Jamun", 387, 5.5, 56, 16, "2 pieces", 100],
  ["Rasgulla", 186, 5, 31, 5, "2 pieces", 100],
  ["Kheer", 192, 5, 30, 6, "1 cup", 200],
  ["Ice Cream (vanilla)", 207, 3.5, 24, 11, "1 scoop", 100],
  ["Dark Chocolate", 546, 5, 60, 31, "1 square", 30],

  // Indian Breads & Dishes
  ["Puri", 340, 7, 46, 15, "2 pieces", 60],
  ["Naan", 310, 9, 51, 8, "1 piece", 90],
  ["Bhatura", 370, 8, 48, 17, "1 piece", 100],
  ["Palak Paneer", 185, 9, 8, 13, "1 cup", 240],
  ["Butter Chicken", 175, 16, 7, 9, "1 cup", 240],
  ["Aloo Gobi", 120, 3.5, 18, 4.5, "1 cup", 200],
  ["Pav Bhaji", 220, 6, 32, 8, "1 serving", 200],

  // Legumes & Pulses
  ["Moong Dal (cooked)", 105, 7.4, 19, 0.4, "1 cup", 202],
  ["Masoor Dal (cooked)", 116, 9, 20, 0.4, "1 cup", 198],
  ["Black Chana (cooked)", 164, 8.9, 27.4, 2.6, "1 cup", 240],
  ["Soya Chunks (cooked)", 153, 17, 11, 5, "1 cup", 100],

  // Healthy & International
  ["Quinoa (cooked)", 120, 4.4, 21.3, 1.9, "1 cup", 185],
  ["Greek Yogurt", 59, 10, 3.6, 0.4, "1 cup", 245],
  ["Avocado", 160, 2, 9, 15, "1/2 medium", 100],
  ["Peanut Butter", 588, 25, 20, 50, "2 tbsp", 32],
  ["Tofu (firm)", 76, 8, 1.9, 4.8, "100g", 100],
];

function searchFoods(query) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return FOOD_DB.filter(f => f[0].toLowerCase().includes(q)).slice(0, 12);
}
