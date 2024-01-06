const Shop = require("../models/App/shop");
const ShopRecords = require("../models/App/shopRecords");
const VendorRecords = require("../models/App/vendorRecords");

exports.revenueCalculator = async (shopId) => {
    let totalRevenue = 0;
    let totalSent = 0;
    const record = await ShopRecords.findOne({shopId});
    record.records ?
    record.records.map(item => {
        totalRevenue += item.youGot ? item.youGot : 0;
        totalSent += item.youGave ? item.youGave : 0;
    })
    : null;
    const balance = totalRevenue - totalSent;

    record.totalRevenue = totalRevenue;
    record.totalSent = totalSent;
    record.balance = balance;
    await record.save();
    const shop = await Shop.findById(shopId);
    shop.revenue = totalRevenue;
    await shop.save();
    return record;
}

exports.vendorRevenueCalculator = async (vendorId) => {
    let totalOrders = 0;
    let totalSent = 0;
    const record = await VendorRecords.findById(vendorId);
    record.records.map(item => {
        totalOrders += item.youGot ? item.youGot : 0;
        totalSent += item.youGave ? item.youGave : 0;
    })
    const balance = totalOrders - totalSent;
    record.totalOrders = totalOrders;
    record.totalSent = totalSent;
    record.balance = balance;
    await record.save();
    return record;

}