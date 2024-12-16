import crypto from 'crypto';
export const decryptRefferal = () => {
    return (req, res, next) => {
        console.log("Decrypt referral middleware is running...");

        const { ref, iv:vi } = req.query; // 'vi' for IV in the query parameters
        console.log("Received ref:", ref, " Received IV:", vi);

        try {
            // Validate `ref` and `vi`
            if (!ref || !vi) {
                console.log("Missing ref or vi in the query parameters.");
                return next();
            }

            // Validate the IV
            const ivBuffer = Buffer.from(vi, 'hex');
            if (ivBuffer.length !== 16) {
                console.error("Invalid IV length. Expected 16 bytes.");
                return res.status(400).json({
                    status: "failed",
                    message: "Invalid IV length.",
                });
            }

            // Validate and convert the key
            const key = Buffer.from(process.env.REFFKEY, 'hex');
            if (!process.env.REFFKEY) {
                console.error("Environment variable REFFKEY is not defined.");
                return res.status(500).json({
                    status: "failed",
                    message: "Encryption key is not configured.",
                });
            }
            if (key.length !== 32) {
                console.error("Invalid REFFKEY length:", key.length);
                return res.status(500).json({
                    status: "failed",
                    message: "Invalid encryption key length. Must be 32 bytes.",
                });
            }

            // Decrypt the referral code
            const decipher = crypto.createDecipheriv('aes-256-cbc', key, ivBuffer);
            let decrypted = decipher.update(ref, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            console.log("Decryption successful:", decrypted);

            // Attach decrypted value to request object
            req.decrypt = decrypted;

            // Proceed to the next middleware or route handler
            next();
        } catch (err) {
            console.error("Decryption error:", err.message);
            return res.status(500).json({
                status: "failed",
                message: "Decryption failed",
                error: err.message,
            });
        }
    };
};
