const express = require('express')
const connectDB = require('./config/db')
const cors = require('cors')

const app = express();

//connect DB
connectDB();

//init middleware
app.use(express.json({ extended: false }));
app.use(cors())

//define routes
app.use('/api/users', require('./routes/api/users'))
app.use('/api/user-roles', require('./routes/api/userRoles'))
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/master-data/raw-material', require('./routes/api/masterdata/rawMaterialMaster'))
app.use('/api/master-data/packing-material', require('./routes/api/masterdata/packingMaterialMaster'))
app.use('/api/master-data/finish-good', require('./routes/api/masterdata/finishGoodMaster'))
app.use('/api/master-data/semi-finish-good', require('./routes/api/masterdata/semiFinishGoodMaster'))
app.use('/api/master-data/supplier-master', require('./routes/api/masterdata/supplierMaster'))
app.use('/api/master-data/customer-master', require('./routes/api/masterdata/customerMaster'))
app.use('/api/master-data/product-master', require('./routes/api/masterdata/productsMaster'))
app.use('/api/sales/purchase-orders', require('./routes/api/sales/purchaseOrders'))
app.use('/api/sales/invoices', require('./routes/api/sales/invoices'))


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));