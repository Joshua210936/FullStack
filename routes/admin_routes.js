const express = require('express');
const router = express.Router();
const bodyParser = require("body-parser");
const moment = require("moment");
router.use(bodyParser.urlencoded({ extended: true }));
const methodOverride = require('method-override');
const { Op, fn, col, literal } = require('sequelize');

//Database imports
const Feedback = require('../models/Feedback');
const Listed_Properties = require('../models/Listed_Properties');
const Agent = require('../models/Agent');
const Customer = require('../models/Customer');
const Schedule = require('../models/schedule');
const Amenity = require('../models/propertyAmenities');
const Advertisement = require('../models/propertyAmenities');
const advertisementClicks = require('../models/advertisementClicks');

router.get('/test', (req, res) => {
    console.log('router connected successfully')
    res.redirect('/adminDashboard')
});

router.get('/adminDashboard', async (req, res) => {
    try {
        const startOfDay = moment().startOf('day').toDate();
        const endOfDay = moment().endOf('day').toDate();
        const startOfMonth = moment().startOf('month').toDate();
        const endOfMonth = moment().endOf('month').toDate();

        const todayFeedback = await Feedback.findOne({
            attributes: [[fn('AVG', col('feedback_rating')), 'averageRating']],
            where: {
                feedback_date: {
                    [Op.between]: [startOfDay, endOfDay]
                }
            },
            raw: true
        });

        const propertySold = await Listed_Properties.findAll({
            attributes: [
                [fn('COUNT', col('Property_ID')), 'soldPropertyCount'],
                [fn('SUM', literal('Property_Price * 0.05')), 'soldPropertyRevenue']
            ],
            where: {
                Property_Status: true,
                Property_ListedDate: {
                    [Op.between]: [startOfMonth, endOfMonth]
                }
            },
            raw: true
        });

        const soldPropertyCount = propertySold.map(fb => fb.soldPropertyCount);
        let soldPropertyRevenue = propertySold.map(fb => parseFloat(fb.soldPropertyRevenue));

        if (isNaN(soldPropertyRevenue)) {
            console.log("No properties sold");
            soldPropertyRevenue = "No properties sold";
        }

        console.log("soldPropertyCount " + soldPropertyCount);
        console.log("soldPropertyRevenue " + soldPropertyRevenue);

        const propertySoldByMonth = await Listed_Properties.findAll({
            attributes: [
                [fn('DATE_FORMAT', col('Property_ListedDate'), '%Y-%m'), 'month'],
                [fn('SUM', literal('Property_Price * 0.05')), 'monthlyBrokerageRevenue']
            ],
            where: {
                Property_Status: true,
                Property_ListedDate: {
                    [Op.between]: [startOfMonth, endOfMonth]
                }
            },
            group: [fn('DATE_FORMAT', col('Property_ListedDate'), '%Y-%m')],
            order: [[fn('DATE_FORMAT', col('Property_ListedDate'), '%Y-%m'), 'ASC']],
            raw: true
        });

        const monthlyBrokerageRevenue = propertySoldByMonth.map(ps => ({
            month: ps.month,
            brokerageRevenue: parseFloat(ps.monthlyBrokerageRevenue) || 0
        }));

        console.log("Monthly Brokerage Revenue:", JSON.stringify(monthlyBrokerageRevenue, null, 2));

        const monthlyAdRevenue = await advertisementClicks.findAll({
            attributes: [
                [fn('DATE_FORMAT', col('monthPeriod'), '%Y-%m'), 'month'],
                [fn('SUM', literal('clicks * pricePerClick')), 'monthlyAdRevenue']
            ],
            group: [fn('DATE_FORMAT', col('monthPeriod'), '%Y-%m')],
            order: [[fn('DATE_FORMAT', col('monthPeriod'), '%Y-%m'), 'ASC']],
            raw: true
        });

        const monthlyAdvertisementRevenue = monthlyAdRevenue.map(ps => ({
            month: ps.month,
            adRevenue: parseFloat(ps.monthlyAdRevenue) || 0
        }));

        console.log("Monthly Advertisement Revenue:", JSON.stringify(monthlyAdvertisementRevenue, null, 2));

        // Combine monthlyBrokerageRevenue and monthlyAdvertisementRevenue
        const combinedRevenue = [];
        const months = new Set([
            ...monthlyBrokerageRevenue.map(r => r.month),
            ...monthlyAdvertisementRevenue.map(r => r.month)
        ]);

        months.forEach(month => {
            const brokerageEntry = monthlyBrokerageRevenue.find(r => r.month === month) || { brokerageRevenue: 0 };
            const adEntry = monthlyAdvertisementRevenue.find(r => r.month === month) || { adRevenue: 0 };

            combinedRevenue.push({
                month: month,
                brokerageRevenue: brokerageEntry.brokerageRevenue,
                adRevenue: adEntry.adRevenue,
                totalRevenue: brokerageEntry.brokerageRevenue + adEntry.adRevenue
            });
        });

        console.log("Combined Revenue:", JSON.stringify(combinedRevenue, null, 2));

        // Process revenue data for the past 6 months
        const revenueData = [];
        for (let i = 5; i >= 0; i--) {
            const month = moment().subtract(i, 'months').format('YYYY-MM');
            const revenueEntry = combinedRevenue.find(entry => entry.month === month);
            revenueData.push({
                month: month,
                revenue: revenueEntry ? revenueEntry.totalRevenue : 0
            });
        }

        console.log("Revenue Data for the Past 6 Months:", JSON.stringify(revenueData, null, 2));


        const averageRatingToday = todayFeedback ? parseFloat(todayFeedback.averageRating).toFixed(2) : "No feedback today";
        console.log('Average Rating for today:', averageRatingToday);

        const dates = propertySoldByMonth.map(fb => fb.month);

        const custUser = await Customer.findOne({
            attributes: [[fn('COUNT', col('Customer_id')), 'custCount']],
            raw: true
        });

        const advertisementRevenue = await Customer.findOne({
            attributes: [[fn('COUNT', col('Customer_id')), 'custCount']],
            raw: true
        });

        const custCount = parseInt(custUser.custCount);
        console.log("custCount " + custCount);

        const agent = await Agent.findOne({
            attributes: [[fn('COUNT', col('agent_id')), 'agentCount']],
            where: {
                status: true
            },
            raw: true
        });

        const agentCount = parseInt(agent.agentCount);
        console.log("agentCount " + agentCount);

        // Render the adminDashboard with the data
        res.render('Dashboard/adminDashboard', {
            layout: "adminMain",
            dates: JSON.stringify(dates),
            averageRatingToday: averageRatingToday,
            custCount: custCount,
            agentCount: agentCount,
            soldPropertyCount: soldPropertyCount,
            soldPropertyRevenue: soldPropertyRevenue,
            revenueData: JSON.stringify(revenueData)
        });
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;