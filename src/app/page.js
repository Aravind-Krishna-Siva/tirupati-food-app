"use client";

import { useState } from "react";

export default function Home() {
  const menu = {
    Juices: [
      { name: "Lemon Juice", price: 3 },
      { name: "Sugarcane Juice", price: 2 }
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

  const bankDetails = {
    name: "Tirupati Food Stall",
    account: "234001000918",
    ifsc: "ICIC0000551",
    bank: "ICICI Bank"
  };

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
    if (total <= 0) {
      alert("Please add items first");
      return;
    }
    setOrderPlaced(true);
  };

  // UPI QR (STABLE)
  const upiString =
    `upi://pay?pa=${upiId}` +
    `&pn=${encodeURIComponent("Tirupati Food Stall")}` +
    `&tn=${encodeURIComponent("Food Order")}` +
    `&am=${total}` +
    `&cu=INR`;

  const qrCode =
    `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=` +
    encodeURIComponent(upiString);

  // TOKEN
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

      {/* PAYMENT SECTION */}
      {orderPlaced && (
        <div style={{ marginTop: 20 }}>
          <h2>💳 Payment Options</h2>

          {/* UPI QR */}
          <p><b>Scan & Pay (Recommended):</b></p>
          <img
            src={qrCode}
            alt="UPI QR"
            style={{ border: "1px solid #ccc" }}
          />

          <p>UPI ID: {upiId}</p>

          <hr />

          {/* BANK DETAILS */}
          <h3>🏦 Bank Transfer (Backup)</h3>

          <p><b>Bank:</b> {bankDetails.bank}</p>
          <p><b>Account Name:</b> {bankDetails.name}</p>
          <p><b>Account Number:</b> {bankDetails.account}</p>
          <p><b>IFSC Code:</b> {bankDetails.ifsc}</p>

          <p style={{ fontSize: 12, color: "gray" }}>
            ⚠️ Bank transfer may take time to confirm. Show screenshot at counter.
          </p>

          {/* PAYMENT CONFIRM */}
          <button
            onClick={() => setPaid(true)}
            style={{
              padding: 10,
              background: "blue",
              color: "white",
              border: "none",
              marginTop: 10
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
              background: "orange",
              border: "none"
            }}
          >
            Generate Token
          </button>
        </div>
      )}

      {token && (
        <div style={{ marginTop: 20 }}>
          <h2>🎟️ Token Number</h2>
          <h1>{token}</h1>
          <p>Show this at counter</p>
        </div>
      )}

      <div style={{ marginTop: 30, fontSize: 12, color: "gray" }}>
        ✔ QR Payment (Instant) | ✔ Bank Transfer (Backup) | ✔ Token System Enabled
      </div>
    </div>
  );
}