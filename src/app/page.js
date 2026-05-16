"use client";

import { useState } from "react";

export default function Home() {
  const menu = {
    Juices: [
      { name: "Lemon Juice", price: 5 },
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
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paid, setPaid] = useState(false);
  const [token, setToken] = useState(null);

  // add item
  const addItem = (item) => {
    setCart((prev) => ({
      ...prev,
      [item.name]: prev[item.name]
        ? { ...item, qty: prev[item.name].qty + 1 }
        : { ...item, qty: 1 }
    }));
  };

  // remove item
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

  // total
  const total = Object.values(cart).reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  // place order
  const placeOrder = () => {
    if (Object.keys(cart).length === 0) return;
    setOrderPlaced(true);
  };

  // generate token after payment
  const generateToken = () => {
    setToken("TIR" + Math.floor(1000 + Math.random() * 9000));
    setCart({});
    setOrderPlaced(false);
    setPaid(false);
  };

  // UPI QR (static, reliable)
  const upiQR =
    `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=` +
    `upi://pay?pa=${upiId}&pn=${name}&am=${total}&cu=INR`;

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
                marginBottom: 8,
                padding: 8,
                border: "1px solid #ddd"
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

      <h2>🛒 Total: ₹{total}</h2>

      <button
        onClick={placeOrder}
        style={{ padding: 10, background: "green", color: "white" }}
      >
        Place Order
      </button>

      {/* PAYMENT SECTION */}
      {orderPlaced && (
        <div style={{ marginTop: 20 }}>
          <h2>💳 Pay via UPI</h2>

          <p><b>UPI ID:</b> {upiId}</p>
          <p><b>Amount:</b> ₹{total}</p>

          {/* QR CODE */}
          <img src={upiQR} alt="UPI QR" />

          <p>Scan QR using PhonePe / GPay</p>

          <button
            onClick={() => setPaid(true)}
            style={{ padding: 10, background: "blue", color: "white" }}
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
            style={{ padding: 10, background: "orange" }}
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