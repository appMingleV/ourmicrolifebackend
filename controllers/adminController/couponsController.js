import pool from "../../config/db.js";

export const addCouponTotalAmount = async (req, res) => {
    try {
        const { precentageDis, couponCode, validAt, couponDiscri, status, limitUser, limitAll } = req.body;
        const queryAddCoupon = `INSERT INTO coupons_total_amount (percentage_dis,coupon_code,valid_at,coupon_descri,status,limit_user,limit_all) VALUES (?,?,?,?,?,?,?)`;
        const values = [precentageDis, couponCode, validAt, couponDiscri, status, limitUser, limitAll];

        const addedCoupon = await queryPromise(queryAddCoupon, values);
        if (addedCoupon.affectedRows == 0) return res.status(500).json({
            status: "failed",
            message: "Failed to add coupon"
        })
        return res.status(200).json({
            status: "success",
            message: "Coupon added successfully",
        })

    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Something went wrong while trying to add coupon",
            error: err.message
        })
    }
}


export const deleteCouponTotalAmount = async (req, res) => {
    try {
        const { couponId } = req.params;
        const queryDeleteCoupon = `DELETE FROM coupons_total_amount WHERE id=?`;
        const values = [couponId];

        const deletedCoupon = await queryPromise(queryDeleteCoupon, values);

        if (deletedCoupon.affectedRows) {
            return res.status(400).json({
                status: "failed",
                message: "Coupon not found"
            })
        }
        return res.status(200).json({
            status: "success",
            message: "Coupon deleted successfully",
        })

    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Something went wrong while trying to delete coupon",
            error: err.message
        })
    }
}

export const getALLTotalCouponsTotalAmount = async (req, res) => {
    try {
        const date = new Date();
        const fullDate = date.getDate() + date.getMonth() + date.getFullYear();
        const queryGetCoupon = `SELECT * FROM coupons_total_amount WHERE status="active" ORDER BY percentage_dis DESC`;
        const allCoupons = await queryPromise(queryGetCoupon);
        if (allCoupons.length == 0) {
            return res.status(400).json({
                status: "failed",
                message: "No active coupons found"
            })
        }
        return res.status(200).json(
            {
                status: "success",
                message: "Active coupons fetched successfully",
                data: allCoupons
            })

    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Something went wrong while trying to fetch coupons",
            error: err.message
        })
    }
}


export const applyCouponsTotalAmount = async (req, res) => {
    try {
        const { couponCode, totalAmount, userId } = req.body;
        const queryCheckCoupon = `SELECT date From limit_coupon WHERE couponCode=? AND type="totalAmount" AND user_id=?`;
        const valuesCheckCo = [couponCode, userId]

        const getStatusCheck = await queryPromise(queryCheckCoupon, valuesCheckCo);
        const date = new Date();
        const fullDate = date.getDate() + date.getMonth() + date.getFullYear();
        const queryFind = `SELECT percentage_dis,limit_user,limit_all FROM coupons_total_amount WHERE coupon_code=? AND status="active"`
        const values = [couponCode];

        let lengthUsedCoupon = getStatusCheck.length;

        const couponDetails = await queryPromise(queryFind, values);

        let limitPerUser = couponDetails[0].limit_user;
        let limitAll = couponDetails[0].limit_all;
        if (couponDetails.length == 0) {
            return res.status(400).json({
                status: "failed",
                message: "Coupon  inactive"
            })
        }
        if (limitAll == 0) return res.status(400).json({
            status: "failed",
            message: "Coupon limit reached"
        })
        if (limitPerUser <= lengthUsedCoupon) {
            return res.status(400).json({
                status: "failed",
                message: "you have used all coupons"
            })
        }
        const queryUpdateCoupon = `INSERT INTO  limit_coupon (user_id,couponCode,type,status,date) VALUES (?,?,?,?,?)`;
        const valuesUpdate = [userId, couponCode, "totalAmount", true, fullDate];
        const updateCoupon = await queryPromise(queryUpdateCoupon, valuesUpdate);
        if (updateCoupon.affectedRows == 0) {
            return res.status(500).json({
                status: "failed",
                message: "Failed to apply coupon"
            })
        }
        const queryAllLimitDec = `UPDATE  coupons_total_amount SET limit_all=? WHERE coupon_Code=? AND status="active"`;
        const valuesAllLimit = [--limitAll, couponCode];
        const updateAllLimit = await queryPromise(queryAllLimitDec, valuesAllLimit);

        const { percentage_dis } = couponDetails[0];
        const discountAmount = (totalAmount * percentage_dis) / 100;
        const finalAmount = totalAmount - discountAmount;

        return res.status(200).json({
            status: "success",
            message: "Coupon applied successfully",
            data: {
                finalAmount,
                discountAmount
            }
        })


    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Something went wrong while trying to apply coupon",
            error: err.message
        })
    }
}



//category coupons-->

export const addCategoryCoupon = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { couponCode, precentageDis, validAt, couponDiscri, status, limitUser, limitAll } = req.body;
        const queryAddCoupon = `INSERT INTO coupons_cate (category_id,percentage_dis,coupon_code,valid_at,coupon_descri,status,limit_user,limit_all) VALUES (?,?,?,?,?,?,?,?)`;
        const values = [categoryId, precentageDis, couponCode, validAt, couponDiscri, status, limitUser, limitAll];
        const addedCoupon = await queryPromise(queryAddCoupon, values);
        if (!addedCoupon) return res.status(500).json({
            status: "failed",
            message: "Failed to add category coupon"
        })
        return res.status(200).json({
            status: "success",
            message: "Category coupon added successfully",
        })
    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Something went wrong while trying to add category coupon",
            error: err.message
        })
    }
}



export const deleteCategoryCoupon = async (req, res) => {
    try {
        const { couponId } = req.params;

        if (!couponId || isNaN(couponId)) {
            return res.status(400).json({
                status: "failed",
                message: "Invalid coupon ID provided",
            });
        }
        const queryDeleteCoupon = `DELETE FROM coupons_cate WHERE id=?`;
        const values = [couponId];

        const deletedCoupon = await queryPromise(queryDeleteCoupon, values);
        console.log(deletedCoupon)
        if (deletedCoupon.affectedRows == 0) {
            return res.status(400).json({
                status: "failed",
                message: "Coupon not found"
            })
        }

        return res.status(200).json({
            status: "success",
            message: "Coupon deleted successfully",
        })

    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Something went wrong while trying to delete category coupon",
            error: err.message
        })
    }

}



export const getALLCategoryCoupons = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const queryGetCoupon = `SELECT * FROM coupons_cate WHERE status="active" ORDER BY percentage_dis DESC`;
        const values = [categoryId];
        const allCoupons = await queryPromise(queryGetCoupon, values);
        if (allCoupons.length == 0) {
            return res.status(400).json({
                status: "failed",
                message: "No active category coupons found"
            })
        }
        return res.status(200).json(
            {
                status: "success",
                message: "Active category coupons fetched successfully",
                data: allCoupons
            })
    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Something went wrong while trying to fetch category coupons",
            error: err.message
        })
    }
}


export const applyCategoryCoupon = async (req, res) => {
    try {
        const { couponCode, productAmount } = req.body;
        const { categoryId } = req.params;
        const queryAppyCoupon = `SELECT percentage_dis FROM coupons_cate WHERE  category_id=? AND coupon_code=? AND status="active"`
        const values = [categoryId, couponCode];
        const couponDetails = await queryPromise(queryAppyCoupon, values);
        if (couponDetails.length == 0) {
            return res.status(400).json({
                status: "failed",
                message: "Coupon inactive"
            })
        }
        const { percentage_dis } = couponDetails[0];
        const discountAmount = (productAmount * percentage_dis) / 100;
        const finalAmount = productAmount - discountAmount;
        return res.status(200).json(
            {
                status: "success",
                message: "Coupon applied successfully",
                data: {
                    finalAmount,
                    discountAmount
                }
            })
    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Something went wrong while trying to apply category coupon",
            error: err.message
        })
    }
}


export const addSubCategoryCoupon = async (req, res) => {
    try {
        const { categoryId, subCategoryId } = req.params
        const { precentageDis, couponCode, validAt, couponDiscri, status, limitUser, limitAll } = req.body;
        const queryAddCouopon = `INSERT INTO coupons_sub (percentage_dis,coupon_code,valid_at,category_id,sub_category_id,coupon_descri,status,limit_user,limit_all) VALUES (?,?,?,?,?,?,?,?,?)`
        const values = [precentageDis, couponCode, validAt, categoryId, subCategoryId, couponDiscri, status, limitUser, limitAll];
        const addedCoupon = await queryPromise(queryAddCouopon, values);
        if (!addedCoupon) return res.status(500).json({
            status: "failed",
            message: "Failed to add subcategory coupon"
        })

        return res.status(200).json({
            status: "success",
            message: "Subcategory coupon added successfully",
        })
    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Something went wrong while trying to add subcategory coupon",
            error: err.message
        })
    }
}


export const deleteSubCategoryCoupon = async (req, res) => {
    try {

        const { couponId } = req.params;

        if (!couponId || isNaN(couponId)) {
            return res.status(400).json({
                status: "failed",
                message: "Invalid coupon ID provided",
            });
        }
        const queryDeleteCoupon = `DELETE FROM coupons_sub WHERE id=?`;
        const values = [couponId];
        const deletedCoupon = await queryPromise(queryDeleteCoupon, values);
        console.log(deletedCoupon);
        if (deletedCoupon.affectedRows == 0) {
            return res.status(400).json({
                status: "failed",
                message: "Coupon not found"
            })
        }
        return res.status(200).json({
            status: "success",
            message: "Coupon deleted successfully",
        })

    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Something went wrong while trying to delete subcategory coupon",
            error: err.message
        })

    }
}


export const getALLSubCategoryCoupons = async (req, res) => {
    try {

        const { categoryId, subCategoryId } = req.params;
        const queryGetCoupon = `SELECT * FROM coupons_sub WHERE status="active" ORDER BY percentage_dis DESC`;
        const values = [categoryId, subCategoryId];

        const allCoupons = await queryPromise(queryGetCoupon, values);

        if (allCoupons.length == 0) {
            return res.status(400).json({
                status: "failed",
                message: "No active subcategory coupons found"
            })
        }
        return res.status(200).json(
            {
                status: "success",
                message: "Active subcategory coupons fetched successfully",
                data: allCoupons
            })
    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Something went wrong while trying to fetch subcategory coupons",
            error: err.message
        })
    }
}


export const applySubCategoryCoupon = async (req, res) => {
    try {
        const { couponCode, productAmount } = req.body;
        const { categoryId, subCategoryId } = req.params;
        const queryAppyCoupon = `SELECT percentage_dis FROM coupons_sub WHERE  category_id=? AND sub_category_id=? AND coupon_code=? AND status="active"`
        const values = [categoryId, subCategoryId, couponCode];
        const couponDetails = await queryPromise(queryAppyCoupon, values);
        if (couponDetails.length == 0) {
            return res.status(400).json({
                status: "failed",
                message: "Coupon inactive"
            })
        }
        const { percentage_dis } = couponDetails[0];
        const discountAmount = (productAmount * percentage_dis) / 100;
        const finalAmount = productAmount - discountAmount;

        return res.status(200).json(
            {
                status: "success",
                message: "Coupon applied successfully",
                data: {
                    finalAmount,
                    discountAmount
                }
            })

    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Something went wrong while trying to apply subcategory coupon",
            error: err.message
        })
    }
}
const queryPromise = (query, value = []) => {
    return new Promise((resolve, reject) => {
        pool.query(query, value, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        })
    })
}