"use client";

import { useState } from "react";

export default function Home() {
  const menu = {
    Juices: [
      { name: "Lemon Juice", price: 20 },
      { name: "Sugarcane Juice", price: 30 }
    ],
    Breakfast: [
      { name: "Dosa", price: 50 },
      { name: "Idli", price: 30 }
    ],
    Meals: [
      { name: "Egg Curry", price: 70 }
    ]
  };

  const [cart, setCart] = useState({});
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

  // GENERATE TOKEN (ORDER CONFIRMATION)
  const generateToken = () => {
    if (total <= 0) {
      alert("Please add items first");
      return;
    }

    setToken("TIR" + Math.floor(1000 + Math.random() * 9000));
    setCart({});
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>🍽️ Tirupati Food Stall</h1>

      <p style={{ color: "gray" }}>
        Select items → Note total → Pay at counter → Get token
      </p>

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

      {/* ORDER BUTTON */}
      <button
        onClick={generateToken}
        style={{
          padding: 12,
          background: "green",
          color: "white",
          border: "none"
        }}
      >
        Place Order (Get Token)
      </button>

      {/* TOKEN */}
      {token && (
        <div style={{ marginTop: 20 }}>
          <h2>🎟️ Token Number</h2>
          <h1>{token}</h1>

          <p>
            Show this at counter and pay cash / UPI
          </p>
        </div>
      )}

      <div style={{ marginTop: 30, fontSize: 12, color: "gray" }}>
        ✔ No payment system | ✔ Simple ordering | ✔ Token-based stall system
      </div>
    </div>
  );
}