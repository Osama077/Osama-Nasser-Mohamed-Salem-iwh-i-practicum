// index.js - الكود الكامل والنهائي (جاهز للـ Submit 100%)

import express from 'express';
import axios from 'axios';
import 'dotenv/config';

const app = express();
const PORT = 3000;

// تأكد إن الـ .env موجود في الـ root (محلي فقط)
const ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const CUSTOM_OBJECT_ID = '2-194230553'; // Schools Object ID
const HUBSPOT_API = 'https://api.hubapi.com';

app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Homepage: عرض كل المدارس
app.get('/', async (req, res) => {
  try {
    const response = await axios.post(
      `${HUBSPOT_API}/crm/v3/objects/${CUSTOM_OBJECT_ID}/search`,
      {
        properties: ['name', 'address', 'graduationdate'],
        limit: 100
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const records = response.data.results;
    res.render('homepage', {
      title: 'Schools List | Integrating With HubSpot I Practicum',
      records
    });
  } catch (error) {
    console.error('Error fetching schools:', error.response?.data || error.message);
    res.status(500).send('Failed to load schools');
  }
});

// صفحة الفورم
app.get('/update-cobj', (req, res) => {
  res.render('updates', {
    title: 'Update Custom Object Form | Integrating With HubSpot I Practicum'
  });
});

// إنشاء مدرسة جديدة (مع validation للـ name)
app.post('/update-cobj', async (req, res) => {
  const { name, address, graduationdate } = req.body;

  // التحقق من أن الـ name موجود ومش فاضي
  if (!name || name.trim() === '') {
    return res.status(400).send('Error: School name is required!');
  }

  try {
    await axios.post(
      `${HUBSPOT_API}/crm/v3/objects/${CUSTOM_OBJECT_ID}`,
      {
        properties: {
          name: name.trim(),
          address: address || '',
          graduationdate: graduationdate || ''
        }
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.redirect('/');
  } catch (error) {
    console.error('Create Error:', error.response?.data);
    const errMsg = error.response?.data?.message || 'Unknown error';
    res.status(500).send(`Failed to create school: ${errMsg}`);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});