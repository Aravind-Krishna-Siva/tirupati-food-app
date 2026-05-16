"use client";

import { useState } from "react";

export default function Home() {
  const menu = {
    Juices: [
      { name: "Lemon Juice", price: 20 },
      { name: "Sugarcane Juice", price: 30 },
      { name: "Watermelon Juice", price: 40 }
    ],
    Breakfast: [
      { name: "Dosa", price: 50 },
      { name: "Idli", price: 30 }
    ],
    Meals: [
      { name: "Egg Curry", price: 70 }
    ]
  };

  const upiId = "9618060633@ybl";
  const name = "Tirupati Food Stall";

  const [cart, setCart] = useState({});
  const [orderActive, setOrderActive] = useState(false);
  const [token, setToken] = useState(null);

  // ADD ITEM
  const addItem = (item) => {
    setCart((prev) => {
      const existing = prev[item.name];
      return {
        ...prev,
        [item.name]: existing
          ? { ...existing, qty: existing.qty + 1 }
          : { ...item, qty: 1 }
      };
    });
  };

  // REMOVE ITEM
  const removeItem = (name) => {
    setCart((prev) => {
      const existing = prev[name];
      if (!existing) return prev;

      if (existing.qty === 1) {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      }

      return {
        ...prev,
        [name]: { ...existing, qty: existing.qty - 1 }
      };
    });
  };

  // TOTAL
  const total = Object.values(cart).reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  // START ORDER
  const placeOrder = () => {
    if (Object.keys(cart).length === 0) return;
    setOrderActive(true);
  };

  // UPI LINK
  const upiLink = `upi://pay?pa=${upiId}&pn=${name}&am=${total}&cu=INR`;

  // PAYMENT CONFIRM
  const confirmPayment = () => {
    setToken("TIR" + Math.floor(1000 + Math.random() * 9000));
    setCart({});
    setOrderActive(false);
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial", background: "#f9f9f9" }}>
      <h1>🍽️ Tirupati Food Stall</h1>

      {/* MENU */}
      {Object.entries(menu).map(([category, items]) => (
        <div key={category} style={{ marginTop: 20 }}>
          <h2>{category}</h2>

          {items.map((item) => (
            <div
              key={item.name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                background: "#fff",
                padding: 10,
                marginBottom: 10,
                borderRadius: 10
              }}
            >
              <div>
                <b>{item.name}</b>
                <div>₹{item.price}</div>
              </div>

              <div>
                <button onClick={() => removeItem(item.name)}>-</button>
                <span style={{ margin: "0 10px" }}>
                  {cart[item.name]?.qty || 0}
                </span>
                <button onClick={() => addItem(item)}>+</button>
              </div>
            </div>
          ))}
        </div>
      ))}

      <hr />

      {/* TOTAL */}
      <h2>🛒 Total: ₹{total}</h2>

      {/* PLACE ORDER */}
      <button
        onClick={placeOrder}
        style={{
          padding: 12,
          background: "green",
          color: "white",
          border: "none",
          borderRadius: 8
        }}
      >
        Place Order
      </button>

      {/* PAYMENT SECTION */}
      {orderActive && (
        <div style={{ marginTop: 20, background: "#fff", padding: 15 }}>
          <h2>💳 Pay via UPI</h2>
          <p>Amount: ₹{total}</p>

          <a href={upiLink}>
            <button
              style={{
                padding: 10,
                background: "blue",
                color: "white",
                border: "none",
                borderRadius: 8
              }}
            >
              Pay with PhonePe / GPay
            </button>
          </a>

          <p style={{ marginTop: 10 }}>
            After payment click below:
          </p>

          <button
            onClick={confirmPayment}
            style={{
              padding: 10,
              background: "green",
              color: "white",
              border: "none",
              borderRadius: 8
            }}
          >
            I Have Paid → Generate Token
          </button>
        </div>
      )}

      {/* TOKEN */}
      {token && (
        <div style={{ marginTop: 20, background: "#fff", padding: 15 }}>
          <h2>🎟️ Your Token</h2>
          <h1>{token}</h1>
          <p>Show this at counter</p>
        </div>
      )}
    </div>
  );
}