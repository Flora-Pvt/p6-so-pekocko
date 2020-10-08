const express = require('express');

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use('/api/sauces', (req, res, next) => {
  const sauces = [
    {
      _id: 'oeihfzeoi',
      title: 'Picante del muerte',
      description: 'Toujours la plus piquante',
      imageUrl: 'https://pixabay.com/photos/sauce-pepper-spicy-food-bottle-1778459/',
      price: 4900,
      userId: 'qsomihvqios',
    },
    {
      _id: 'oeihfzeomoihi',
      title: 'Picant comme jamais',
      description: 'Un piquant frenchy',
      imageUrl: 'https://pixabay.com/photos/display-table-food-food-stall-3748817/',
      price: 2900,
      userId: 'qsomihvqios',
    },
  ];
  res.status(200).json(sauces);
});

module.exports = app;