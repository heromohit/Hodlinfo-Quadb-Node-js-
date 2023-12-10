const express = require('express');
const path = require('path');
const axios = require('axios');
const cors=require("cors");
require('./db/config');
const Doc=require('./db/doc');
const app = express();
const port = 3000;
app.set('view engine', 'ejs');
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));
app.get('/', async (req, res) => {
  try {
    await Doc.deleteMany({});
    const response = await axios.get('https://api.wazirx.com/api/v2/tickers');
    const tickers = response.data;

    const topTenTickers = Object.entries(tickers)
      .slice(0, 10)
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});
      const tickerArray = Object.keys(topTenTickers).map(key => {
        return { name: key, ...topTenTickers[key] };
      });
    for (const ticker of tickerArray) {
      const { name, last, buy, sell, volume, base_unit } = ticker;
      const doc = new Doc({ name, last, buy, sell, volume, base_unit });
      await doc.save();
    }
    const allData = await Doc.find({});
    res.render('front', { ticker: allData });
  } catch (error) {
    console.error('Error fetching data from WazirX API:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
