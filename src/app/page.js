"use client";

import { useState } from "react";

export default function Home() {
  const menu = {
    Juices: [
      { name: "Lemon Juice", price: 20, image: "https://images.unsplash.com/photo-1587735243615-c03f25aaff15" },
      { name: "Sugarcane Juice", price: 30, image: "https://images.unsplash.com/photo-1622597467836-f3c7ca5c9f89" }
    ],
    Breakfast: [
      { name: "Dosa", price: 50, image: "https://images.unsplash.com/photo-1668236543090-82b4e8d5c6d6" },
      { name: "Idli", price: 30, image: "https://images.unsplash.com/photo-1626777552726-4a6b54b4b2d1" }
    ],
    Meals: [
      { name: "Egg Curry", price: 70, image: "https://images.unsplash.com/photo-1604908177522-040f3d5a3b1c" }
    ]
  };

  const [cart, setCart] = useState({});
  const [token, setToken] = useState(null);
  const [orders, setOrders] = useState([]); // 👈 OWNER DASHBOARD DATA

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

      if (copy[name].qty === 1) delete copy[name];
      else copy[name].qty -= 1;

      return copy;
    });
  };

  const total = Object.values(cart).reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  // PLACE ORDER → CREATE TOKEN + STORE ORDER
  const placeOrder = () => {
    if (total <= 0) return;

    const newToken = "TIR" + Math.floor(1000 + Math.random() * 9000);

    const newOrder = {
      token: newToken,
      items: cart,
      total,
      status: "Pending"
    };

    setOrders((prev) => [newOrder, ...prev]); // 👈 ADD TO OWNER BOARD
    setToken(newToken);
    setCart({});
  };

  // UPDATE STATUS (OWNER)
  const updateStatus = (token, status) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.token === token ? { ...o, status } : o
      )
    );
  };

  return (
    <div style={{ fontFamily: "Arial", background: "#f5f5f5" }}>

      {/* HEADER */}
      <div style={{ padding: 15, background: "white", position: "sticky", top: 0 }}>
        <h2>🍽️ Tirupati Food Stall</h2>
      </div>

      {/* CUSTOMER MENU */}
      <div style={{ padding: 15 }}>
        {Object.entries(menu).map(([category, items]) => (
          <div key={category}>
            <h3>{category}</h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {items.map((item) => (
                <div key={item.name} style={{ background: "white", padding: 10 }}>
                  <img src={item.image} style={{ width: "100%", height: 100, objectFit: "cover" }} />

                  <b>{item.name}</b>
                  <div>₹{item.price}</div>

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
          </div>
        ))}
      </div>

      {/* CART BAR */}
      {total > 0 && (
        <div style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "green",
          color: "white",
          padding: 15,
          display: "flex",
          justifyContent: "space-between"
        }}>
          <span>🛒 ₹{total}</span>
          <button onClick={placeOrder}>Place Order</button>
        </div>
      )}

      {/* TOKEN DISPLAY */}
      {token && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <h2>🎟️ Token</h2>
          <h1>{token}</h1>
          <button onClick={() => setToken(null)}>Close</button>
        </div>
      )}

      {/* 🧑‍🍳 OWNER DASHBOARD */}
      <div style={{ padding: 15 }}>
        <h2>🧑‍🍳 Live Orders (Owner Panel)</h2>

        {orders.length === 0 && <p>No orders yet</p>}

        {orders.map((order) => (
          <div
            key={order.token}
            style={{
              background: "white",
              padding: 10,
              marginBottom: 10,
              borderLeft: "5px solid green"
            }}
          >
            <h3>Token: {order.token}</h3>
            <p>Total: ₹{order.total}</p>
            <p>Status: <b>{order.status}</b></p>

            <ul>
              {Object.values(order.items).map((i) => (
                <li key={i.name}>
                  {i.name} × {i.qty}
                </li>
              ))}
            </ul>

            <button onClick={() => updateStatus(order.token, "Preparing")}>
              Preparing
            </button>

            <button onClick={() => updateStatus(order.token, "Ready")}>
              Ready
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}