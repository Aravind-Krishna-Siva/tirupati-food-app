"use client";

import { useEffect, useState } from "react";
import { pb } from "./pocketbase";

export default function Home() {
  const menu = [
    { id: "lemon", name: "Lemon Juice", price: 20, category: "Juices" },
    { id: "sugarcane", name: "Sugarcane Juice", price: 30, category: "Juices" },
    { id: "dosa", name: "Dosa", price: 50, category: "Breakfast" },
    { id: "idli", name: "Idli", price: 30, category: "Breakfast" },
    { id: "egg", name: "Egg Curry", price: 70, category: "Meals" },
  ];

  const [cart, setCart] = useState({});
  const [orders, setOrders] = useState([]);
  const [view, setView] = useState("customer");
  const [token, setToken] = useState(null);
  const [error, setError] = useState("");

  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [isOwner, setIsOwner] = useState(false);

  const loadOrders = async () => {
    try {
      const data = await pb.collection("orders").getFullList({
        sort: "-created",
      });
      setOrders(data);
    } catch (err) {
      setError("Load error: " + JSON.stringify(err.response || err.message));
    }
  };

  useEffect(() => {
    loadOrders();

    pb.collection("orders").subscribe("*", () => {
      loadOrders();
    });

    return () => {
      pb.collection("orders").unsubscribe("*");
    };
  }, []);

  const addItem = (item) => {
    setCart((prev) => ({
      ...prev,
      [item.id]: prev[item.id]
        ? { ...prev[item.id], qty: prev[item.id].qty + 1 }
        : { ...item, qty: 1 },
    }));
  };

  const removeItem = (id) => {
    setCart((prev) => {
      const copy = { ...prev };
      if (!copy[id]) return copy;

      if (copy[id].qty === 1) delete copy[id];
      else copy[id].qty -= 1;

      return copy;
    });
  };

  const total = Object.values(cart).reduce(
    (sum, item) => sum + Number(item.price) * Number(item.qty),
    0
  );

  const placeOrder = async () => {
    if (total <= 0) return;

    setError("");

    const newToken = "TIR" + Date.now().toString().slice(-6);
    const orderItems = Object.values(cart);

    const payload = {
      token: newToken,
      items: JSON.stringify(orderItems),
      total: Number(total),
      status: "Pending",
    };

    try {
      console.log("SENDING TO POCKETBASE:", payload);

      const response = await pb.collection("orders").create(payload);

      console.log("ORDER CREATED:", response);

      setToken(newToken);
      setCart({});
      await loadOrders();
    } catch (err) {
      console.log("FULL ERROR:", err);
      console.log("ERROR RESPONSE:", err?.response);

      setError(
        "Order failed:\n" +
          JSON.stringify(err?.response || err?.message || err, null, 2)
      );
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await pb.collection("orders").update(id, { status });
      await loadOrders();
    } catch (err) {
      alert(JSON.stringify(err.response || err.message));
    }
  };

  const handleLogin = () => {
    if (loginUser === "aravind" && loginPass === "1234") {
      setIsOwner(true);
      setView("owner");
      loadOrders();
    } else {
      alert("Invalid username or password");
    }
  };

  const groupedMenu = menu.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div style={{ fontFamily: "Arial", background: "#f5f5f5", minHeight: "100vh", paddingBottom: 90 }}>
      <div style={{ padding: 15, background: "white", display: "flex", justifyContent: "space-between" }}>
        <h2>🍽️ Tirupati Food Stall</h2>

        <button onClick={() => setView(view === "customer" ? "login" : "customer")}>
          {view === "customer" ? "Owner Login" : "Customer View"}
        </button>
      </div>

      {view === "login" && !isOwner && (
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10, maxWidth: 300 }}>
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

          <button onClick={handleLogin} style={{ padding: 10, background: "green", color: "white" }}>
            Login
          </button>
        </div>
      )}

      {view === "customer" && (
        <div style={{ padding: 15 }}>
          <h3>Menu</h3>

          {Object.entries(groupedMenu).map(([category, items]) => (
            <div key={category}>
              <h3>{category}</h3>

              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: "white",
                    padding: 12,
                    marginBottom: 10,
                    display: "flex",
                    justifyContent: "space-between",
                    borderRadius: 10,
                  }}
                >
                  <div>
                    <b>{item.name}</b>
                    <div>₹{item.price}</div>
                  </div>

                  <div>
                    <button onClick={() => removeItem(item.id)}>-</button>
                    <span style={{ margin: "0 10px" }}>{cart[item.id]?.qty || 0}</span>
                    <button onClick={() => addItem(item)}>+</button>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {error && (
            <pre style={{ background: "#ffe5e5", color: "red", padding: 12, whiteSpace: "pre-wrap" }}>
              {error}
            </pre>
          )}
        </div>
      )}

      {view === "customer" && total > 0 && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "green", color: "white", padding: 15, display: "flex", justifyContent: "space-between" }}>
          <span>🛒 ₹{total}</span>
          <button onClick={placeOrder}>Place Order</button>
        </div>
      )}

      {token && view === "customer" && (
        <div style={{ position: "fixed", inset: 0, background: "white", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <h2>🎟️ Your Token</h2>
          <h1>{token}</h1>
          <button onClick={() => setToken(null)}>Close</button>
        </div>
      )}

      {view === "owner" && isOwner && (
        <div style={{ padding: 15 }}>
          <h2>🧑‍🍳 Owner Dashboard</h2>
          <p>Live Orders: {orders.length}</p>

          {orders.map((order) => {
            let items = [];

            try {
              items = JSON.parse(order.items || "[]");
            } catch {
              items = [];
            }

            return (
              <div key={order.id} style={{ background: "white", padding: 12, marginBottom: 10, borderLeft: "5px solid green" }}>
                <h3>Token: {order.token}</h3>
                <p>Total: ₹{order.total}</p>
                <p>Status: <b>{order.status}</b></p>

                <ul>
                  {items.map((i) => (
                    <li key={i.id}>{i.name} × {i.qty}</li>
                  ))}
                </ul>

                <button onClick={() => updateStatus(order.id, "Preparing")}>Preparing</button>
                <button onClick={() => updateStatus(order.id, "Ready")} style={{ marginLeft: 10 }}>Ready</button>
                <button onClick={() => updateStatus(order.id, "Delivered")} style={{ marginLeft: 10 }}>Delivered</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}