const midtransClient = require('midtrans-client');
const otpGenerator = require('otp-generator');

// Create Snap API instance
let snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: 'SB-Mid-server-cVagPDP8gc4My0M62bBlqlnh',
});

module.exports = {
    midtrans: async (req, res) => {
        const { grossAmount, firstName, lastName, email, phone } = req.body;

        // Buat orderId dulu
        let orderId = `ORDER-${Date.now()}-${otpGenerator.generate(4, {
            upperCaseAlphabets: false,
            specialChars: false,
        })}`;

        let parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: parseInt(grossAmount),
            },
            credit_card: {
                secure: true,
            },
            customer_details: {
                first_name: firstName,
                last_name: lastName,
                email: email,
                phone: phone,
            },
        };

        try {
            let transaction = await snap.createTransaction(parameter);
            let transactionToken = transaction.token;
            console.log('transactionToken:', transactionToken);
            res.json({ transactionToken });
        } catch (error) {
            console.error("Midtrans Error:", error);
            res.status(500).json({ error: error.message || "Gagal membuat transaksi" });
        }
    },
};
