const FinishGoodInventory = require("../../models/inventory/FinishGoodInventory");
const FinishgoodsMasters = require('../../models/master/FinishGoodsMaster')
const mongoose = require('mongoose');

exports.fifo = (req, res, next) => {
    const productList = []
    for (let i = 0; i < req.body.products.length; i++) {
        productList.push(mongoose.Types.ObjectId(req.body.products[i].id));

    }
    console.log("req.body.products ", req.body.products);
    console.log("productList ****** ", productList);

    FinishgoodsMasters.find({
        'id': {
            $in: productList
        },
    }, function (err, docs) {
        this.productList = docs;

        var reorderedResults = naturalOrderResults(docs, productList);
        function naturalOrderResults(resultsFromMongoDB, queryIds) {
            //Let's build the hashmap
            var hashOfResults = resultsFromMongoDB.reduce(function (prev, curr) {
                prev[curr.id] = curr;
                return prev;
            }, {});

            return queryIds.map(function (id) { return hashOfResults[id] });
        }
        console.log("reorderedResults", reorderedResults)

        for (let i = 0; i < req.body.products.length; i++) {
            req.body.products[i].sellingPrice = reorderedResults[i].sellingPrice;
        }
        console.log("Product List Three", req.body.products)
    });
}