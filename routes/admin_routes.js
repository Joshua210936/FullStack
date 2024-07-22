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
const Customer = require('../models/custUser');
const Schedule = require('../models/schedule');
const Amenity = require('../models/propertyAmenities')

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
                [fn('SUM', col('Property_Price')), 'soldPropertyRevenue']
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
        };

        console.log("soldPropertyCount " + soldPropertyCount);
        console.log("soldPropertyRevenue " + soldPropertyRevenue);

        const propertySoldByMonth = await Listed_Properties.findAll({
            attributes: [
                [fn('DATE_FORMAT', col('Property_ListedDate'), '%Y-%m'), 'month'],
                [fn('SUM', col('Property_Price')), 'monthlyRevenue']
            ],
            where: {
                Property_Status: true,
                Property_ListedDate: {
                    [Op.between]: [startOfMonth, endOfMonth]
                }
            },
            group: [literal('DATE_FORMAT(Property_ListedDate, "%Y-%m")')],
            order: [[literal('DATE_FORMAT(Property_ListedDate, "%Y-%m")'), 'ASC']],
            raw: true
        });

        const monthlyRevenue = propertySoldByMonth.map(ps => ({
            month: ps.month,
            revenue: parseFloat(ps.monthlyRevenue) || 0
        }));

        // Process revenue data for the past 6 months
        const revenueData = [];
        for (let i = 5; i >= 0; i--) {
            const month = moment().subtract(i, 'months').format('YYYY-MM');
            const revenueEntry = monthlyRevenue.find(entry => entry.month === month);
            revenueData.push({
                month: month,
                revenue: revenueEntry ? revenueEntry.revenue : 0
            });
        }

        const averageRatingToday = todayFeedback ? parseFloat(todayFeedback.averageRating).toFixed(2) : "No feedback today";
        console.log('Average Rating for today:', averageRatingToday);

        const dates = propertySoldByMonth.map(fb => fb.date);

        const custUser = await Customer.findOne({
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