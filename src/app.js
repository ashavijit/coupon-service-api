const express = require('express');
const { connectDB } = require('./config/db');
const couponRoutes = require('./routes/couponRoutes');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();

app.use(express.json());
connectDB();

app.get('/', (req, res) => {
    res.send('Welcome to the Coupon API!');
});


app.use('/api', couponRoutes);

app.use('*', (req, res, next) => {
    res.json({
        success: false,
        message: 'Route not found',
    });
});
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app; 