const axios = require('axios');

const API_URL = "http://localhost:5000/api";

async function simulate() {
    try {
        console.log("1. Logging in as admin...");
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: "admin@example.com",
            password: "password"
        });
        const token = loginRes.data.token;
        console.log("   Token acquired.");

        const headers = { Authorization: token };

        console.log("2. Creating a test product...");
        const prodRes = await axios.post(`${API_URL}/products`, {
            name: "DEBUG TEST PRODUCT " + Date.now(),
            sku: "TEST-" + Date.now().toString().slice(-4),
            description: "Debug product"
        }, { headers });
        const productId = prodRes.data.id;
        console.log(`   Product created with ID: ${productId}`);

        console.log("3. Attempting to initialize stock...");
        try {
            const stockRes = await axios.post(`${API_URL}/stock/add`, {
                product_id: productId,
                warehouse_id: 1, // Warehouse 2
                quantity: 10,
                shelf_code: "DEBUG-1"
            }, { headers });
            console.log("   Stock initialized successfully:", stockRes.data);
        } catch (err) {
            console.error("   STOCK INITIALIZATION FAILED!");
            if (err.response) {
                console.error("   Status:", err.response.status);
                console.error("   Data:", JSON.stringify(err.response.data));
            } else {
                console.error("   Error:", err.message);
            }
        }

    } catch (err) {
        if (err.response) {
            console.error("Outer Error Status:", err.response.status);
            console.error("Outer Error Data:", JSON.stringify(err.response.data));
        } else {
            console.error("Outer Error:", err.message);
        }
    }
}

simulate();
