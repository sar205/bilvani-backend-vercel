const crypto = require('crypto');
const OrderConfirmed = require('../../mongodb/orderConfirmMongo/orderConfirmMongo');

function generateSignature(orderId, paymentId, secret) {
    const data = orderId + "|" + paymentId;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(data);
    return hmac.digest('hex');
}


function generateOrderId() {
    const prefix = "BI";
    const randomNumbers = Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit random number
    return prefix + randomNumbers;
}


exports.verifyPayment = async (req, res) => {
    const { razorpayOrderId, razorpayPaymentId, receivedSignature,  selectedOrder, products , quantity} = req.body;
    const secret = "lpoFpmf5F9xYNViH2SiE6pcr";

    const generatedSignature = generateSignature(razorpayOrderId, razorpayPaymentId, secret);

    if (generatedSignature === receivedSignature) {
        try {
            const permanentId = req.cookies.permanentId;

            if (!permanentId) {
                return res.status(400).json({ success: false, error: "Permanent ID not found in cookies." });
            }

            // Iterate over the products array and create a new order entry for each product
            for (const product of products) {
                delete selectedOrder._id;

                const orderConfirmed = new OrderConfirmed({
                    products: [product],  // Wrap the product in an array
                    customerFirstName: selectedOrder.customerFirstName,
                    district: selectedOrder.district,
                    state: selectedOrder.state,
                    pincode: selectedOrder.pincode,
                    phoneNumber: selectedOrder.phoneNumber,
                    ...selectedOrder,
                    razorpay_order_id: razorpayOrderId,
                    razorpay_payment_id: razorpayPaymentId,
                    razorpay_signature: receivedSignature,
                    orderId: generateOrderId(),  // Generate a new order ID for each product
                    permanentId: permanentId,
                    quantity:quantity,
                    created_at: new Date()
                });

                await orderConfirmed.save();
            }

            res.status(200).json({ success: true, message: "Payment verified and data saved successfully." });
        } catch (error) {
            console.error("Error saving payment verification or order confirmation data:", error);
            res.status(500).json({ success: false, error: "Internal server error." });
        }
    } else {
        res.status(400).json({ success: false, error: "Payment verification failed." });
    }
};



// Controller function to get order details by permanentId

exports.getOrderByPermanentId = async (req, res) => {
    try {
        // Extract permanent ID from cookies
        const permanentId = req.cookies.permanentId;

        if (!permanentId) {
            return res.status(400).json({ success: false, error: "Permanent ID not found in cookies." });
        }

        // Find orders by permanent ID
        const orders = await OrderConfirmed.find({ permanentId });

        if (orders.length === 0) {
            return res.status(404).json({ success: false, message: "No orders found for the given permanent ID." });
        }

        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error("Error fetching orders by permanent ID:", error);
        res.status(500).json({ success: false, error: "Internal server error." });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        // Extract permanent ID from cookies
        const permanentId = req.cookies.permanentId;

        if (!permanentId) {
            return res.status(400).json({ success: false, error: "Permanent ID not found in cookies." });
        }

        // Extract order ID from request params or query string
        const orderId = req.params.orderId; // Assuming order ID is in the route parameters

        // Find order by permanent ID and order ID
        const order = await OrderConfirmed.findOne({ permanentId, _id: orderId });

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found for the given permanent ID and order ID." });
        }

        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error("Error fetching order by permanent ID and order ID:", error);
        res.status(500).json({ success: false, error: "Internal server error." });
    }
};
