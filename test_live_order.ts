import Razorpay from 'razorpay';

const testOrder = async () => {
  try {
    const rzp = new Razorpay({
      key_id: 'rzp_live_STxlKmH3jUfhCg',
      key_secret: 'QyH1Z6s0wV6N23z7XRmEe53q'
    });

    const order = await rzp.orders.create({
      amount: 25000, // 250 INR
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        user_id: "test_user",
        plan_name: "monthly"
      }
    });
    console.log('Order created successfully:', order.id);
  } catch (e) {
    console.error('Error creating order:', e);
  }
};

testOrder();
