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
  const [orders, setOrders] = useState([]);
  const [view, setView] = useState("customer");

  // OWNER LOGIN STATES
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [loginError, setLoginError] = useState("");

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

      if (copy[name].qty === 1) delete copy[name];
      else copy[name].qty -= 1;

      return copy;
    });
  };

  const total = Object.values(cart).reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  // PLACE ORDER
  const placeOrder = () => {
    if (total <= 0) return;

    const newToken = "TIR" + Math.floor(1000 + Math.random() * 9000);

    const newOrder = {
      token: newToken,
      items: cart,
      total,
      status: "Pending"
    };

    setOrders((prev) => [newOrder, ...prev]);
    setToken(newToken);
    setCart({});
  };

  // UPDATE STATUS
  const updateStatus = (token, status) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.token === token ? { ...o, status } : o
      )
    );
  };

  // LOGIN FUNCTION
  const handleLogin = () => {
    if (loginUser === "aravind" && loginPass === "1234") {
      setIsOwner(true);
      setView("owner");
      setLoginError("");
    } else {
      setLoginError("Invalid username or password");
    }
  };

  // LOGOUT
  const logout = () => {
    setIsOwner(false);
    setView("customer");
  };

  return (
    <div style={{ fontFamily: "Arial", background: "#f5f5f5", minHeight: "100vh" }}>

      {/* HEADER */}
      <div style={{
        padding: 15,
        background: "white",
        display: "flex",
        justifyContent: "space-between"
      }}>
        <h2>🍽️ Tirupati Food Stall</h2>

        <button
          onClick={() => setView(view === "customer" ? "login" : "customer")}
        >
          Owner Login
        </button>
      </div>

      {/* ================= LOGIN PAGE ================= */}
      {view === "login" && !isOwner && (
        <div style={{
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          maxWidth: 300
        }}>
          <h2>🔐 Owner Login</h2>

          <input
            placeholder="Username"
            value={loginUser}
            onChange={(e) => setLoginUser(e.target.value)}
            style={{ padding: 10 }}
          />

          <input
            type="password"
            placeholder="Password"
            value={loginPass}
            onChange={(e) => setLoginPass(e.target.value)}
            style={{ padding: 10 }}
          />

          <button
            onClick={handleLogin}
            style={{
              padding: 10,
              background: "green",
              color: "white",
              border: "none"
            }}
          >
            Login
          </button>

          {loginError && (
            <p style={{ color: "red" }}>{loginError}</p>
          )}
        </div>
      )}

      {/* ================= CUSTOMER VIEW ================= */}
      {view === "customer" && (
        <div style={{ padding: 15 }}>
          {Object.entries(menu).map(([cat, items]) => (
            <div key={cat}>
              <h3>{cat}</h3>

              {items.map((item) => (
                <div
                  key={item.name}
                  style={{
                    background: "white",
                    padding: 10,
                    marginBottom: 10,
                    display: "flex",
                    justifyContent: "space-between"
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
        </div>
      )}

      {/* CART BAR */}
      {view === "customer" && total > 0 && (
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

      {/* TOKEN */}
      {token && view === "customer" && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <h2>🎟️ Token</h2>
          <h1>{token}</h1>
          <button onClick={() => setToken(null)}>Close</button>
        </div>
      )}

      {/* ================= OWNER DASHBOARD ================= */}
      {view === "owner" && isOwner && (
        <div style={{ padding: 15 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h2>🧑‍🍳 Owner Dashboard</h2>

            <button onClick={logout}>
              Logout
            </button>
          </div>

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
      )}

    </div>
  );
}