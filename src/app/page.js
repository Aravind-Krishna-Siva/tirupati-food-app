"use client";

import { useEffect, useState } from "react";
import { pb } from "./pocketbase";

export default function Home() {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState({});
  const [orders, setOrders] = useState([]);
  const [view, setView] = useState("customer");

  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [token, setToken] = useState(null);

  useEffect(() => {
    loadItems();
    loadOrders();

    pb.collection("orders").subscribe("*", function () {
      loadOrders();
    });

    return () => {
      pb.collection("orders").unsubscribe("*");
    };
  }, []);

  const loadItems = async () => {
    const records = await pb.collection("items").getFullList({
      sort: "created",
    });
    setMenu(records);
  };

  const loadOrders = async () => {
    const records = await pb.collection("orders").getFullList({
      sort: "-created",
    });
    setOrders(records);
  };

  const addItem = (item) => {
    setCart((prev) => ({
      ...prev,
      [item.id]: prev[item.id]
        ? { ...prev[item.id], qty: prev[item.id].qty + 1 }
        : { id: item.id, name: item.name, price: item.price, qty: 1 },
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
    (sum, item) => sum + Number(item.price) * item.qty,
    0
  );

  const placeOrder = async () => {
    if (total <= 0) return;

    const newToken = "TIR" + Date.now().toString().slice(-6);

    const orderItems = Object.values(cart);

    try {
      await pb.collection("orders").create({
        token: newToken,
        items: JSON.stringify(orderItems),
        total: total,
        status: "Pending",
      });

      setToken(newToken);
      setCart({});
      await loadOrders();
    } catch (err) {
      console.error("ORDER ERROR:", err);
      alert("Order not saved. Check PocketBase orders API rules and fields.");
    }
  };

  const updateStatus = async (id, status) => {
    await pb.collection("orders").update(id, { status });
    await loadOrders();
  };

  const handleLogin = () => {
    if (loginUser === "aravind" && loginPass === "1234") {
      setIsOwner(true);
      setView("owner");
      setLoginError("");
      loadOrders();
    } else {
      setLoginError("Invalid username or password");
    }
  };

  return (
    <div style={{ fontFamily: "Arial", background: "#f5f5f5", minHeight: "100vh", paddingBottom: 80 }}>
      <div style={{ padding: 15, background: "white", display: "flex", justifyContent: "space-between" }}>
        <h2>🍽️ Tirupati Food Stall</h2>

        <button onClick={() => setView(view === "customer" ? "login" : "customer")}>
          {view === "customer" ? "Owner Login" : "Customer View"}
        </button>
      </div>

      {view === "login" && !isOwner && (
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10, maxWidth: 300 }}>
          <h2>🔐 Owner Login</h2>

          <input placeholder="Username" value={loginUser} onChange={(e) => setLoginUser(e.target.value)} style={{ padding: 10 }} />

          <input type="password" placeholder="Password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} style={{ padding: 10 }} />

          <button onClick={handleLogin} style={{ padding: 10, background: "green", color: "white", border: "none" }}>
            Login
          </button>

          {loginError && <p style={{ color: "red" }}>{loginError}</p>}
        </div>
      )}

      {view === "customer" && (
        <div style={{ padding: 15 }}>
          <h3>Menu</h3>

          {menu.map((item) => (
            <div key={item.id} style={{ background: "white", padding: 12, marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
              <div>
                <b>{item.name}</b>
                <div>₹{item.price}</div>
                <small>{item.category}</small>
              </div>

              <div>
                <button onClick={() => removeItem(item.id)}>-</button>
                <span style={{ margin: "0 10px" }}>{cart[item.id]?.qty || 0}</span>
                <button onClick={() => addItem(item)}>+</button>
              </div>
            </div>
          ))}
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

          {orders.length === 0 && <p>No orders yet</p>}

          {orders.map((order) => {
            let items = [];
            try {
              items = JSON.parse(order.items || "[]");
            } catch {}

            return (
              <div key={order.id} style={{ background: "white", padding: 12, marginBottom: 12, borderLeft: "5px solid green" }}>
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