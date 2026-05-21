// ==========================================
// ES Module Import Fix for whatsapp-web.js
// ==========================================
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;

import qrcode from 'qrcode-terminal';
import Product from './models/Product.js';
import User from './models/User.js';
import Order from './models/Order.js';
import Address from './models/Address.js'; 
import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_SfUoUFHQYqa2mk",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "vgLwVjrhCugKBvNYmi6ApKYM",
});

// MEMORY STATE
const userSessions = {};
const phoneToChatId = {}; // 🚀 NEW: Maps real phone number to WhatsApp's Random LID for Delivery Notifications

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { args: ['--no-sandbox', '--disable-setuid-sandbox'], headless: true }
});

client.on('qr', (qr) => {
    console.log('\n=========================================');
    console.log('📱 SCAN THIS QR CODE WITH WHATSAPP TO START BOT');
    console.log('=========================================\n');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ WhatsApp Bot is Ready and Listening!');
});

// ==========================================
// OUTGOING NOTIFICATIONS (DELIVERY FIX)
// ==========================================
export const sendWhatsAppMessage = async (phone, message) => {
    try {
        const cleanPhone = phone.replace(/\D/g, '');
        const phone10 = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;
        
        // 🚀 1. FIRST TRY OUR MEMORY MAP (Bypasses all WhatsApp limits)
        if (phoneToChatId[phone10]) {
            await client.sendMessage(phoneToChatId[phone10], message);
            console.log(`✅ Auto-Notification sent using Secure Mapping for: ${phone10}`);
            return;
        }

        // 2. FALLBACK API METHOD
        const fullNumber = `91${phone10}`;
        const numberDetails = await client.getNumberId(fullNumber);

        if (numberDetails) {
            await client.sendMessage(numberDetails._serialized, message);
            console.log(`✅ Auto-Notification sent using API for: ${fullNumber}`);
        } else {
            console.log(`❌ Auto-Notification Failed: Could not resolve LID.`);
        }
    } catch (error) {
        console.error("Failed to send WA message:", error.message);
    }
};

// ==========================================
// THE CONVERSATIONAL ENGINE
// ==========================================
client.on('message', async (msg) => {
    if (msg.isStatus || msg.from.includes('@g.us') || msg.from.includes('broadcast')) return;

    const chatId = msg.from; // Random Masked ID
    const text = msg.body.toLowerCase().trim();

    try {
        // =====================================
        // NEW USER INITIALIZATION
        // =====================================
        if (!userSessions[chatId]) {
            userSessions[chatId] = { step: 'VERIFYING_PHONE', userId: null, cart: [], total: 0, address: null, paymentLinkId: null, availableProducts: [], selectedProduct: null };
            return client.sendMessage(chatId, "Welcome to Fruzo! 🍎\n\nFor your security, please type your *10-digit registered mobile number* to verify your account.");
        }

        const session = userSessions[chatId];

        // GLOBAL RESET
        if (text === 'reset' || text === 'cancel' || text === 'clear') {
            if (session.userId) {
                session.step = 'SHOW_MENU';
                session.cart = [];
                session.total = 0;
                return client.sendMessage(chatId, "Cart cleared! 🛒 Send *HI* to see the menu again.");
            } else {
                session.step = 'VERIFYING_PHONE';
                return client.sendMessage(chatId, "Session reset. Please enter your 10-digit registered mobile number.");
            }
        }

        // =====================================
        // 🚀 THE MANUAL VERIFICATION FLOW
        // =====================================
        if (session.step === 'VERIFYING_PHONE') {
            const enteredPhone = text.replace(/\D/g, ''); // Extract only numbers
            
            if (enteredPhone.length >= 10) {
                const phone10 = enteredPhone.slice(-10);
                
                // Check DB
                const allUsers = await User.find({});
                const user = allUsers.find(u => {
                    if (!u.phone) return false;
                    const dbPhoneClean = u.phone.replace(/\D/g, ''); 
                    return dbPhoneClean.includes(phone10) || phone10.includes(dbPhoneClean.slice(-10));
                });

                if (user) {
                    session.userId = user._id; // Lock the session
                    session.step = 'SHOW_MENU';
                    phoneToChatId[phone10] = chatId; // Save Random ID to memory for delivery notifications!
                    
                    return client.sendMessage(chatId, `✅ Verification Successful!\nWelcome back, ${user.name}! 🍇\n\nType *HI* or *MENU* to see our fresh fruits!`);
                } else {
                    return client.sendMessage(chatId, `❌ Account not found for ${phone10}.\nPlease check your number or register on the Fruzo website first.\n\nTry entering your number again:`);
                }
            } else {
                return client.sendMessage(chatId, "Please enter a valid 10-digit mobile number.");
            }
        }

        // =====================================
        // ENSURE USER IS LOADED
        // =====================================
        const user = await User.findById(session.userId);
        if (!user) {
            session.step = 'VERIFYING_PHONE';
            session.userId = null;
            return client.sendMessage(chatId, "Session expired. Please enter your 10-digit registered mobile number.");
        }

        // =====================================
        // STEP 1: SHOW MENU
        // =====================================
        if (session.step === 'SHOW_MENU') {
            if (text === 'hi' || text === 'hello' || text === 'menu') {
                const products = await Product.find({ inStock: true });
                session.availableProducts = products;
                
                let menuMsg = `Hi ${user.name}! 🍇 Welcome to Fruzo.\n*Reply with the NUMBER of the item you want to add:*\n\n`;
                products.forEach((p, idx) => {
                    menuMsg += `*${idx + 1}.* ${p.name} (₹${p.offerPrice || p.price} / ${p.unit || 'pc'})\n`;
                });
                menuMsg += `\n*(Type CLEAR anytime to reset)*`;

                session.step = 'ADDING_TO_CART';
                return client.sendMessage(chatId, menuMsg);
            }
        }

        // =====================================
        // STEP 2: HANDLE ITEM SELECTION
        // =====================================
        if (session.step === 'ADDING_TO_CART') {
            if (text === 'checkout') {
                if (session.cart.length === 0) return client.sendMessage(chatId, "Your cart is empty! Reply with a number from the menu to add items.");
                
                const userAddrs = await Address.find({ userId: user._id }).sort({ createdAt: -1 });

                if (!userAddrs || userAddrs.length === 0) {
                    return client.sendMessage(chatId, "You don't have any saved addresses. Please add an address on the Fruzo website first.");
                }
                
                let selectedAddress = userAddrs[0];
                if (user.defaultAddress) {
                    const defaultAddr = userAddrs.find(addr => String(addr._id) === String(user.defaultAddress));
                    if (defaultAddr) selectedAddress = defaultAddr;
                }

                session.address = selectedAddress; 
                
                const tax = Math.floor(session.total * 0.02);
                const grandTotal = session.total + tax;
                
                let summaryMsg = `🧾 *CHECKOUT SUMMARY*\n\n`;
                session.cart.forEach(c => { summaryMsg += `- ${c.product.name} (x${c.quantity}) : ₹${c.subtotal}\n`; });
                summaryMsg += `\nSubtotal: ₹${session.total}`;
                summaryMsg += `\nTaxes (2%): ₹${tax}`;
                summaryMsg += `\n*Grand Total: ₹${grandTotal}*\n`;
                summaryMsg += `\n📍 *Delivering to:*\n${session.address.street}, ${session.address.city}\n\n`;
                summaryMsg += `Type *CONFIRM* to generate the payment link.`;

                session.step = 'CHECKOUT';
                return client.sendMessage(chatId, summaryMsg);
            }

            const num = parseInt(text);
            if (num > 0 && num <= session.availableProducts.length) {
                session.selectedProduct = session.availableProducts[num - 1];
                session.step = 'ASK_QTY';
                return client.sendMessage(chatId, `How many units of *${session.selectedProduct.name}* do you want?\n*(Type a number, e.g., 1, 2, 5)*`);
            } else {
                return client.sendMessage(chatId, "Invalid choice. Please type a number from the menu, or type *CHECKOUT* to pay.");
            }
        }

        // =====================================
        // STEP 3: HANDLE QUANTITY
        // =====================================
        if (session.step === 'ASK_QTY') {
            const qty = parseInt(text);
            if (qty > 0) {
                const price = session.selectedProduct.offerPrice || session.selectedProduct.price;
                const subtotal = price * qty;
                
                session.cart.push({ product: session.selectedProduct, quantity: qty, subtotal: subtotal });
                session.total += subtotal;

                let cartStr = `✅ *Added to cart!*\n\n🛒 *Current Cart:*\n`;
                session.cart.forEach(c => { cartStr += `- ${c.product.name} x${c.quantity} (₹${c.subtotal})\n`; });
                cartStr += `\nType another *NUMBER* from the menu to add more items, or type *CHECKOUT* to proceed to payment.`;

                session.step = 'ADDING_TO_CART';
                return client.sendMessage(chatId, cartStr);
            } else {
                return client.sendMessage(chatId, "Please enter a valid quantity (e.g., 2).");
            }
        }

        // =====================================
        // STEP 4: PAYMENT LINK GENERATION
        // =====================================
        if (session.step === 'CHECKOUT') {
            if (text === 'confirm') {
                await client.sendMessage(chatId, "Generating your secure payment link... Please wait ⏳");
                const tax = Math.floor(session.total * 0.02);
                const grandTotal = session.total + tax;

                try {
                    const paymentLinkRequest = {
                        amount: grandTotal * 100, 
                        currency: "INR",
                        accept_partial: false,
                        description: "Fruzo WhatsApp Order",
                        customer: { name: user.name, email: user.email, contact: user.phone },
                        notify: { sms: false, email: false },
                        reminder_enable: false
                    };

                    const paymentLink = await razorpayInstance.paymentLink.create(paymentLinkRequest);
                    session.paymentLinkId = paymentLink.id;
                    
                    let payMsg = `💳 *Secure Payment Link*\n\nAmount: ₹${grandTotal}\nLink: ${paymentLink.short_url}\n\n`;
                    payMsg += `⚠️ *IMPORTANT:* After you complete the payment, come back here and type *PAID* to verify and confirm your order.`;
                    
                    session.step = 'VERIFY_PAYMENT';
                    return client.sendMessage(chatId, payMsg);
                } catch (error) {
                    console.log(error);
                    return client.sendMessage(chatId, "Sorry, payment link generation failed.");
                }
            }
        }

        // =====================================
        // STEP 5: PAYMENT VERIFICATION & ACKNOWLEDGEMENT
        // =====================================
        if (session.step === 'VERIFY_PAYMENT') {
            if (text === 'paid') {
                await client.sendMessage(chatId, "Verifying your payment... ⏳");
                try {
                    const paymentLink = await razorpayInstance.paymentLink.fetch(session.paymentLinkId);
                    
                    if (paymentLink.status === 'paid') {
                        const tax = Math.floor(session.total * 0.02);
                        const grandTotal = session.total + tax;

                        const newOrder = await Order.create({
                            userId: user._id,
                            items: session.cart.map(i => ({ product: i.product._id, quantity: i.quantity })),
                            amount: grandTotal,
                            address: session.address._id,
                            status: 'Order Placed',
                            paymentType: 'Razorpay',
                            isPaid: true,
                            exchangeReason: 'Source: WhatsApp Omnichannel 🟢' 
                        });

                        let ackMsg = `🎉 *Payment Successful! Order Confirmed!*\n\n`;
                        ackMsg += `Thank you, ${user.name}! We have received your payment of ₹${grandTotal}.\n`;
                        ackMsg += `📦 *Order ID:* #${newOrder._id.toString().slice(-8).toUpperCase()}\n`;
                        ackMsg += `📍 *Delivery Address:* ${session.address.street}\n\n`;
                        ackMsg += `You will receive another message on WhatsApp as soon as your order is out for delivery. 🚚🍇\n\n`;
                        ackMsg += `*(Type HI anytime to place a new order)*`;

                        userSessions[chatId] = { step: 'SHOW_MENU', cart: [], total: 0, address: null, paymentLinkId: null, availableProducts: [], selectedProduct: null };

                        return client.sendMessage(chatId, ackMsg);
                    } else {
                        return client.sendMessage(chatId, "❌ Payment not received yet. If you have paid, please wait a minute and type *PAID* again.");
                    }
                } catch (error) {
                    console.log(error);
                    return client.sendMessage(chatId, "Error verifying payment. We will manually check it.");
                }
            }
        }
    } catch (error) {
        console.error("Bot encountered an error processing message:", error);
    }
});

export const startWhatsAppBot = () => {
    client.initialize();
};