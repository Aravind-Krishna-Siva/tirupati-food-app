"use client";

import { useState } from "react";

export default function Home() {
  const menu = {
    Juices: [
      {
        name: "Lemon Juice",
        price: 20,
        image: "https://images.unsplash.com/photo-1587735243615-c03f25aaff15"
      },
      {
        name: "Sugarcane Juice",
        price: 30,
        image: "https://images.unsplash.com/photo-1622597467836-f3c7ca5c9f89"
      }
    ],
    Breakfast: [
      {
        name: "Dosa",
        price: 50,
        image: "https://images.unsplash.com/photo-1668236543090-82b4e8d5c6d6"
      },
      {
        name: "Idli",
        price: 30,
        image: "https://images.unsplash.com/photo-1626777552726-4a6b54b4b2d1"
      }
    ],
    Meals: [
      {
        name: "Egg Curry",
        price: 70,
        image: "https://images.unsplash.com/photo-1604908177522-040f3d5a3b1c"
      }
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

  // PLACE ORDER → TOKEN
  const generateToken = () => {
    if (total <= 0) {
      alert("Please add items first");
      return;
    }

    setToken("TIR" + Math.floor(1000 + Math.random() * 9000));
    setCart({});
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial", background: "#f8f8f8" }}>
      <h1 style={{ textAlign: "center" }}>🍽️ Tirupati Food Stall</h1>

      {/* MENU */}
      {Object.entries(menu).map(([category, items]) => (
        <div key={category} style={{ marginTop: 25 }}>
          <h2>{category}</h2>

          {items.map((item) => (
            <div
              key={item.name}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 12,
                border: "1px solid #ddd",
                borderRadius: 10,
                marginBottom: 10,
                background: "white"
              }}
            >
              {/* IMAGE + INFO */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img
                  src={item.image}
                  alt={item.name}
                  style={{
                    width: 65,
                    height: 65,
                    objectFit: "cover",
                    borderRadius: 10
                  }}
                />

                <div>
                  <b>{item.name}</b>
                  <div style={{ color: "green" }}>₹{item.price}</div>
                </div>
              </div>

              {/* BUTTONS */}
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

      {/* CART SUMMARY */}
      <h2>🛒 Total: ₹{total}</h2>

      <button
        onClick={generateToken}
        style={{
          padding: 12,
          background: "green",
          color: "white",
          border: "none",
          borderRadius: 8
        }}
      >
        Place Order & Get Token
      </button>

      {/* TOKEN */}
      {token && (
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <h2>🎟️ Your Token</h2>
          <h1 style={{ color: "blue" }}>{token}</h1>
          <p>Please show this at counter</p>
        </div>
      )}

      <div style={{ marginTop: 30, fontSize: 12, color: "gray", textAlign: "center" }}>
        ✔ Image Menu | ✔ Cart System | ✔ Token Generator | ✔ Stall Ready
      </div>
    </div>
  );
}