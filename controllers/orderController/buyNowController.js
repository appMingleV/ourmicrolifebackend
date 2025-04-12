
import pool from "../../config/db.js"
import {getProfileCoins,teamDistrubutionPayOut} from '../../service/refferralSystem/refferral.js'
import {OrderNotification} from '../../socket/socket.js';

export const buyOrders = async (req, res) => {
    try {
        const { coin, color, products, size, product_configuration_id, old_price, price, quantity, product_name, user_id, image_url, vendor_id } = req.body
        if (!req?.file && !coin && !product_configuration_id && !color && !products && !product_name && !old_price && !price && !user_id && !image_url && !vendor_id) {
            return res.status(400).json({
                status: "error",
                message: "Missing required fields"
            })
        }

        const queryBuyOrder = `INSERT INTO buyorder (user_id,coin,color,products,size,product_configuration_id,old_price,price,quantity,product_name,image_url,vendor_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
        const values = [user_id, coin, color, products, size, product_configuration_id, old_price, price, quantity, product_name, image_url, vendor_id]

        const dataBuyOrder = await queryPromis(queryBuyOrder, values);
        if (!dataBuyOrder) return res.status(400).json({
            status: "error",
            message: "Failed to add buy order"
        })

        return res.status(200).json({
            status: "success",
            message: "Fetched buy orders successfully",
            data: dataBuyOrder
        })

    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Something went wrong while trying to fetch buy orders",
            error: err.message
        })
    }
}



export const getBuyOrder = async (req, res) => {
    try {
        const { buyId } = req.params;
        if (!buyId) {
            return res.status(400).json({
                status: "error",
                message: "id cannot be null"
            })
        }
        const queryGetBuyOrder = `SELECT * FROM buyorder WHERE id=?`;
        const value = [buyId];
        const dataBuyOrder = await queryPromis(queryGetBuyOrder, value);
        if (!dataBuyOrder) return res.status(404).json({
            status: "error",
            message: "Buy order not found"
        })
        return res.status(200).json({
            status: "success",
            message: "Fetched buy order successfully",
            data: dataBuyOrder
        })
    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Something went wrong while trying to fetch buy order",
            error: err.message
        })
    }
}


export const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        if (!orderId) {
            return res.status(200).json({
                status: "error",
                message: "Missing required fields"
            })
        }
        const queryCancelOrder = `UPDATE order_items  SET status='canceled' WHERE id=?`;
        const value = [orderId];
        const cancelOrder = await queryPromis(queryCancelOrder, value);
        if (!cancelOrder) {
            return res.status(404).json({
                status: "error",
                message: "No order found"
            })
        }
        return res.status(200).json({
            status: "success",
            message: "Order is canceled successfully",
            data: cancelOrder
        })
    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Operation failed",
            error: err.message
        })
    }
}
// coin
// : 
// 4
// color
// : 
// "gray"
// id
// : 
// 388
// image
// : 
// null
// old_price
// : 
// "78999.00"
// price
// : 
// "59899.00"
// product_configuration_id
// : 
// 67
// product_name
// : 
// "OPPO Find X8 5G ( 256 GB Storage, 12 GB RAM )"
// products
// : 
// 144
// quantity
// : 
// 1
// size
// : 
// "12+256GB"
// user_id
// : 
// 210
// vendor_id
// : 
// 94

// orderController.js
export const orderItems = async (req, res) => {
    try {
        const {
            total_items,
            payment_type,
            total_amount,
            net_amount,
            user_id,
            shipping_charges,
            shipping_address_id,
            order_items,
            total_coins
        } = req.body;

        // Validation
        if (!total_items || !payment_type || !total_amount || 
            !net_amount || !user_id || !shipping_charges || 
            !shipping_address_id || !order_items || total_coins === undefined) {
            return res.status(400).json({
                status: "error",
                message: "Missing required fields"
            });
        }

        // Check user exists
        const qeuryUser = `SELECT * FROM tbl_users WHERE id=?`;
        const userData = await queryPromis(qeuryUser, [user_id]);
        if (userData.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "User not found"
            });
        }

        const userLevel = userData[0]?.level;
        const vendorIds = []; // Array to collect vendor IDs

        // Create order
        const queryAddCoins = `INSERT INTO orders_cart 
            (total_items, payment_type, total_amount, net_amount, user_id, shipping_charges, shipping_address_id, total_coins) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const addCoinsDone = await queryPromis(queryAddCoins, [
            total_items, payment_type, total_amount, net_amount, 
            user_id, shipping_charges, shipping_address_id, total_coins
        ]);
        
        if (!addCoinsDone) {
            return res.status(400).json({
                status: "error",
                message: "Failed to create order"
            });
        }

        // Process order items
        for (const item of order_items) {
            if (!item.product_id || !item.vendor_id) {
                console.warn("Skipping invalid order item:", item);
                continue;
            }

            // Add order item
            await queryPromis(
                `INSERT INTO order_items 
                (order_id, product_id, size, color, sales_price, old_price, vendor_id, total_price, quantity, coins, product_image, productName) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    addCoinsDone.insertId, item.product_id, item.size, item.color, 
                    item.sales_price, item.old_price, item.vendor_id, item.total_price, 
                    item.quantity, item.coins, item.product_image, item.product_name
                ]
            );
            
            // Collect vendor IDs
            vendorIds.push(item.vendor_id);

            // Add coin history
            await queryPromis(
                `INSERT INTO coins_history 
                (heading, coin_add_at, coin, user_id, coinStatus, orderId, level_profile, earning_type) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    item.product_name, new Date(), item.coins, user_id, 
                    true, addCoinsDone.insertId, userLevel, "self"
                ]
            );
        }

        // Process team distribution
        const valueTotal = 5 * total_coins;
        await teamDistrubutionPayOut(user_id, valueTotal, total_coins, "group", "group purchase earning");

        // Update user coins
        await queryPromis(
            `UPDATE coins SET value=value+? WHERE user_id=?`,
            [total_coins, user_id]
        );

        // Send notifications to unique vendors
        const uniqueVendorIds = [...new Set(vendorIds.filter(id => id !== undefined))];
        for (const vendorId of uniqueVendorIds) {
            try {
                console.log("---------------object");
                // for test        OrderNotification('786', '104');
                await OrderNotification(user_id, vendorId);
            } catch (notifError) {
                console.error(`Failed to notify vendor ${vendorId}:`, notifError);
                // Continue with other vendors even if one fails
            }
        }

        return res.status(200).json({
            status: "success",
            message: "Order placed successfully",
            orderId: addCoinsDone.insertId
        });

    } catch (err) {
        console.error("Order processing error:", err);
        return res.status(500).json({
            status: "error",
            message: "Internal server error while processing order",
            error: err.message
        });
    }
};



const queryPromis = (query, value = []) => {
    return new Promise((resolve, reject) => {
        pool.query(query, value, (err, result) => {
            if (err) {
                reject(err)
            };
            resolve(result);
        })
    })
}


export const getAllOrders = async (req, res) => {
    try {

        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({
                status: "error",
                message: "Missing required fields"
            })
        }
        const queryAllOrders = `SELECT * FROM orders_cart WHERE user_id=?`;
        const values = [userId];
        const allOrders = await queryPromis(queryAllOrders, values);
                      
        if(allOrders.length===0){
            return res.status(404).json({
                status: "error chal",
                message: "No orders found"
            })
        }
        const arrayOrders = [];
        for (let key in allOrders) {
            const queryOrderItems = `SELECT * FROM order_items WHERE order_id=?`
            const valueOrder = [allOrders[key]?.id];
            const orderItems = await queryPromis(queryOrderItems, valueOrder);       
                for(let order of orderItems){
                arrayOrders.push(order)
                }
        }
        if (arrayOrders.length == 0) {
            return res.status(404).json({
                status: "error",
                message: "No orders found"
            })
        }
        return res.status(200).json({
            status: "success",
            message: "All orders fetched successfully",
            data: arrayOrders
        })
    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Operation failed",
            error: err.message
        })
    }
}

