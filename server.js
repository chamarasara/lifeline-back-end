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
app.use('/api/master-data/distributor-master', require('./routes/api/masterdata/distributorMaster'))
app.use('/api/master-data/product-master', require('./routes/api/masterdata/productsMaster'))
app.use('/api/master-data/employee-master', require('./routes/api/masterdata/employeeMaster'))
app.use('/api/sales/purchase-orders-raw', require('./routes/api/sales/purchaseOrdersRaw'))
app.use('/api/sales/purchase-orders-packing', require('./routes/api/sales/purchaseOrdersPacking'))
app.use('/api/sales/invoices', require('./routes/api/sales/invoices'))
app.use('/api/sales/return-invoices', require('./routes/api/sales/returnInvoices'))
app.use('/api/sales/quotations', require('./routes/api/sales/quotations'))
app.use('/api/master-data/bom', require('./routes/api/masterdata/bomMaster'))
app.use('/api/inventory/finish-good', require('./routes/api/inventory/finishGood'))
app.use('/api/hr/salaries', require('./routes/api/hr/salaries'))


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));