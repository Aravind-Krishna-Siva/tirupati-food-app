"use client";

import { useState } from "react";

export default function Home() {
  const menu = {
    Juices: [
      { name: "Lemon Juice", price: 4 },
      { name: "Sugarcane Juice", price: 5 }
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
  const merchantName = "Tirupati Food Stall";

  const [cart, setCart] = useState({});
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paid, setPaid] = useState(false);
  const [token, setToken] = useState(null);

  // ADD ITEM
  const addItem = (item) => {
    setCart((prev) => ({
      ...prev,
      [item.name]: prev[item.name]
        ? { ...item, qty: prev[item.name].qty + 1 }
        : { ...item, qty: 1 }
    }));
  };

  // REMOVE ITEM
  const removeItem = (name) => {
    setCart((prev) => {
      const copy = { ...prev };
      if (!copy[name]) return prev;

      if (copy[name].qty === 1) {
        delete copy[name];
      } else {
        copy[name].qty -= 1;
      }
      return copy;
    });
  };

  // TOTAL
  const total = Object.values(cart).reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  // PLACE ORDER
  const placeOrder = () => {
    if (Object.keys(cart).length === 0) return;
    setOrderPlaced(true);
  };

  // UPI LINK (NO QR)
  const upiLink =
    `upi://pay?pa=${upiId}&pn=${merchantName}&am=${total}&cu=INR`;

  // TOKEN GENERATION
  const generateToken = () => {
    setToken("TIR" + Math.floor(1000 + Math.random() * 9000));
    setCart({});
    setOrderPlaced(false);
    setPaid(false);
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>🍽️ Tirupati Food Stall</h1>

      {/* MENU */}
      {Object.entries(menu).map(([cat, items]) => (
        <div key={cat} style={{ marginTop: 20 }}>
          <h2>{cat}</h2>

          {items.map((item) => (
            <div
              key={item.name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: 8,
                border: "1px solid #ddd",
                marginBottom: 8
              }}
            >
              <span>
                {item.name} - ₹{item.price}
              </span>

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
          padding: 10,
          background: "green",
          color: "white",
          border: "none"
        }}
      >
        Place Order
      </button>

      {/* PAYMENT */}
      {orderPlaced && (
        <div style={{ marginTop: 20 }}>
          <h2>💳 Pay Using UPI</h2>

          <p><b>UPI ID:</b> {upiId}</p>
          <p><b>Amount:</b> ₹{total}</p>

          <button
            onClick={() => {
              window.location.href = upiLink;
            }}
            style={{
              padding: 12,
              background: "blue",
              color: "white",
              border: "none"
            }}
          >
            Pay with PhonePe / GPay / Paytm
          </button>

          <p style={{ marginTop: 10 }}>
            After payment click below:
          </p>

          <button
            onClick={() => setPaid(true)}
            style={{
              padding: 10,
              background: "orange",
              border: "none"
            }}
          >
            I Have Paid
          </button>
        </div>
      )}

      {/* TOKEN */}
      {paid && !token && (
        <div style={{ marginTop: 20 }}>
          <button
            onClick={generateToken}
            style={{
              padding: 10,
              background: "purple",
              color: "white",
              border: "none"
            }}
          >
            Generate Token
          </button>
        </div>
      )}

      {token && (
        <div style={{ marginTop: 20 }}>
          <h2>🎟️ Token</h2>
          <h1>{token}</h1>
          <p>Show this at counter</p>
        </div>
      )}
    </div>
  );
}