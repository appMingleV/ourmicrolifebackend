
import pool from "../../config/db.js"

export const buyOrders = async (req, res) => {
    try {
        const { coin, color, products, size, product_configuration_id, old_price, price, quantity, product_name, user_id, image_url } = req.body
        if (!req?.file && !coin && !product_configuration_id && !color && !products && !product_name && !old_price && !price && !user_id && !image_url) {
            return res.status(400).json({
                status: "error",
                message: "Missing required fields"
            })
        }

        const queryBuyOrder = `INSERT INTO buyorder (user_id,coin,color,products,size,product_configuration_id,old_price,price,quantity,product_name,image_url) VALUES (?,?,?,?,?,?,?,?,?,?,?)`
        const values = [user_id, coin, color, products, size, product_configuration_id, old_price, price, quantity, product_name, image_url]

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
    try{
        const {orderId}=req.params;
        if(!orderId){
            return res.status(200).json({
                status:"error",
                message:"Missing required fields"
            })
        }
        const queryCancelOrder=`UPDATE order_items  SET status='canceled' WHERE id=?`;
        const value=[orderId];
        const cancelOrder=await queryPromis(queryCancelOrder,value);
        if(!cancelOrder){
            return res.status(404).json({
                status:"error",
                message:"No order found"
            })
        }
        return res.status(200).json({
            status:"success",
            message:"Order is canceled successfully",
            data:cancelOrder
        })
    }catch(err){
        return res.status(500).json({
            status:"error",
            message:"Operation failed",
            error:err.message
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

        if (!req?.file &&!total_items &&!payment_type &&!total_amount &&!net_amount &&!user_id &&!shipping_charges &&!shipping_address_id &&!order_items &&  !total_coins) {
            return res.status(400).json({
                status: "error",
                message: "Missing required fields"
            })
        }
     
            const queryAddCoins=`INSERT INTO orders_cart (total_items,payment_type,total_amount,net_amount,user_id,shipping_charges,shipping_address_id,total_coins)  VALUES (?, ?, ?, ?, ?, ?, ?,?)`
            const valuesAddCoins=[total_items, payment_type, total_amount, net_amount, user_id, shipping_charges, shipping_address_id, total_coins]
            const addCoinsDone= await queryPromis(queryAddCoins,valuesAddCoins);
            if(!addCoinsDone) return res.status(400).json({
                status: "error",
                message: "Failed to add coins"
            })
            for (const item of order_items) {
                const queryAddItems=`INSERT INTO order_items (order_id, product_id, size, color, sales_price, old_price, vendor_id, total_price, quantity,coins) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)`
                const valuesAddItems=[addCoinsDone.insertId, item.product_id, item.size, item.color, item.sales_price, item.old_price, item.vendor_id, item.total_price, item.quantity,item.coins]
                await queryPromis(queryAddItems, valuesAddItems);
            }
            const queryCoinHistory=`INSERT INTO coins_history (heading,coin_add_at,coin,user_id,coinStatus,orderId) VALUES (?,?,?,?,?,?)`

            const valueCoinHistory=["product A",new Date(),total_coins,user_id,true,addCoinsDone.insertId || null];
            const queryCoinHistoryAdded=await queryPromis(queryCoinHistory,valueCoinHistory);
            if(!queryCoinHistoryAdded){
                return res.status(400).json({
                    status: "error",
                    message: "Failed to add coins history"
                })
            }
            const queryAddCoinsUser = `UPDATE coins SET value=value+? WHERE user_id=?`;
            const valueAddcoin=[total_coins,user_id]
            await queryPromis(queryAddCoinsUser,valueAddcoin);
        
           return res.status(200).json({
            status: "success",
            message: "order items add successfully"
           })
        

    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Something went wrong while trying to order items",
            error: err.message
        })
    }
}


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


export const getAllOrders=(req,res)=>{
    try{
    const queryAllOrders=`SELECT * FROM orders_cart`;

    }catch(err){
        return res.status(500).json({
            status:"error",
            message:"Operation failed",
            error:err.message
        })
    }
}