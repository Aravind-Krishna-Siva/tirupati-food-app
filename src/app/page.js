"use client";

import { useEffect, useState } from "react";
import { pb } from "./pocketbase";

export default function Home() {
  const [menu, setMenu] = useState([
    { id: "lemon", name: "Lemon Juice", price: 2, category: "Juices" },
    { id: "sugarcane", name: "Sugarcane Juice", price: 30, category: "Juices" },
    { id: "dosa", name: "Dosa", price: 50, category: "Breakfast" },
    { id: "idli", name: "Idli", price: 30, category: "Breakfast" },
    { id: "egg", name: "Egg Curry", price: 70, category: "Meals" },
  ]);

  const [cart, setCart] = useState({});
  const [orders, setOrders] = useState([]);
  const [view, setView] = useState("customer");

  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [token, setToken] = useState(null);
  const [orderError, setOrderError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadOrders = async () => {
    try {
      const data = await pb.collection("orders").getFullList({
        sort: "-created",
      });

      setOrders(data);
    } catch (err) {
      console.error("LOAD ORDERS ERROR:", err);
      setOrderError("Orders load error: " + err.message);
    }
  };

  useEffect(() => {
    loadOrders();

    pb.collection("orders").subscribe("*", function () {
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

  const removeItem = (itemId) => {
    setCart((prev) => {
      const copy = { ...prev };

      if (!copy[itemId]) return copy;

      if (copy[itemId].qty === 1) {
        delete copy[itemId];
      } else {
        copy[itemId].qty -= 1;
      }

      return copy;
    });
  };

  const total = Object.values(cart).reduce(
    (sum, item) => sum + Number(item.price) * Number(item.qty),
    0
  );

  const placeOrder = async () => {
    if (total <= 0) return;

    setLoading(true);
    setOrderError("");

    const newToken = "TIR" + Date.now().toString().slice(-6);

    const orderItems = Object.values(cart).map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      qty: item.qty,
    }));

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
      console.error("CREATE ORDER ERROR:", err);
      setOrderError(
        "Order failed: " +
          (err?.response?.message || err?.message || JSON.stringify(err))
      );
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await pb.collection("orders").update(orderId, { status });
      await loadOrders();
    } catch (err) {
      console.error("UPDATE STATUS ERROR:", err);
      alert("Status update failed");
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      await pb.collection("orders").delete(orderId);
      await loadOrders();
    } catch (err) {
      console.error("DELETE ORDER ERROR:", err);
      alert("Delete failed");
    }
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

  const logout = () => {
    setIsOwner(false);
    setView("customer");
  };

  const groupedMenu = menu.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div
      style={{
        fontFamily: "Arial",
        background: "#f5f5f5",
        minHeight: "100vh",
        paddingBottom: 90,
      }}
    >
      <div
        style={{
          padding: 15,
          background: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <h2 style={{ margin: 0 }}>🍽️ Tirupati Food Stall</h2>

        <button
          onClick={() => setView(view === "customer" ? "login" : "customer")}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #ddd",
            background: "#fff",
          }}
        >
          {view === "customer" ? "Owner Login" : "Customer View"}
        </button>
      </div>

      {view === "login" && !isOwner && (
        <div
          style={{
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            maxWidth: 320,
            margin: "30px auto",
            background: "white",
            borderRadius: 12,
          }}
        >
          <h2>🔐 Owner Login</h2>

          <input
            placeholder="Username"
            value={loginUser}
            onChange={(e) => setLoginUser(e.target.value)}
            style={{ padding: 12, borderRadius: 8, border: "1px solid #ddd" }}
          />

          <input
            type="password"
            placeholder="Password"
            value={loginPass}
            onChange={(e) => setLoginPass(e.target.value)}
            style={{ padding: 12, borderRadius: 8, border: "1px solid #ddd" }}
          />

          <button
            onClick={handleLogin}
            style={{
              padding: 12,
              background: "green",
              color: "white",
              border: "none",
              borderRadius: 8,
            }}
          >
            Login
          </button>

          {loginError && <p style={{ color: "red" }}>{loginError}</p>}
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
                    padding: 14,
                    marginBottom: 12,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderRadius: 14,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                >
                  <div>
                    <b>{item.name}</b>
                    <div>₹{item.price}</div>
                  </div>

                  <div>
                    <button onClick={() => removeItem(item.id)}>-</button>

                    <span style={{ margin: "0 12px" }}>
                      {cart[item.id]?.qty || 0}
                    </span>

                    <button onClick={() => addItem(item)}>+</button>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {orderError && (
            <pre
              style={{
                background: "#ffe5e5",
                color: "red",
                padding: 12,
                whiteSpace: "pre-wrap",
              }}
            >
              {orderError}
            </pre>
          )}
        </div>
      )}

      {view === "customer" && total > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "green",
            color: "white",
            padding: 15,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 20,
          }}
        >
          <span>
            🛒 {Object.keys(cart).length} items | ₹{total}
          </span>

          <button
            onClick={placeOrder}
            disabled={loading}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "none",
              fontWeight: "bold",
            }}
          >
            {loading ? "Placing..." : "Place Order"}
          </button>
        </div>
      )}

      {token && view === "customer" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 30,
          }}
        >
          <h2>🎟️ Your Token</h2>
          <h1 style={{ fontSize: 60, color: "green" }}>{token}</h1>
          <p>Please show this token at the counter.</p>

          <button
            onClick={() => setToken(null)}
            style={{
              padding: 12,
              background: "green",
              color: "white",
              border: "none",
              borderRadius: 8,
            }}
          >
            Close
          </button>
        </div>
      )}

      {view === "owner" && isOwner && (
        <div style={{ padding: 15 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h2>🧑‍🍳 Owner Dashboard</h2>

            <button onClick={logout}>Logout</button>
          </div>

          <h3>Live Orders: {orders.length}</h3>

          {orders.length === 0 && <p>No orders yet</p>}

          {orders.map((order) => {
            let items = [];

            try {
              items = JSON.parse(order.items || "[]");
            } catch {
              items = [];
            }

            return (
              <div
                key={order.id}
                style={{
                  background: "white",
                  padding: 14,
                  marginBottom: 12,
                  borderLeft:
                    order.status === "Ready"
                      ? "5px solid blue"
                      : order.status === "Delivered"
                      ? "5px solid gray"
                      : "5px solid green",
                  borderRadius: 12,
                }}
              >
                <h2>Token: {order.token}</h2>
                <p>Total: ₹{order.total}</p>
                <p>
                  Status: <b>{order.status}</b>
                </p>

                <ul>
                  {items.map((i) => (
                    <li key={i.id}>
                      {i.name} × {i.qty} = ₹{Number(i.price) * Number(i.qty)}
                    </li>
                  ))}
                </ul>

                <button onClick={() => updateStatus(order.id, "Preparing")}>
                  Preparing
                </button>

                <button
                  onClick={() => updateStatus(order.id, "Ready")}
                  style={{ marginLeft: 8 }}
                >
                  Ready
                </button>

                <button
                  onClick={() => updateStatus(order.id, "Delivered")}
                  style={{ marginLeft: 8 }}
                >
                  Delivered
                </button>

                <button
                  onClick={() => deleteOrder(order.id)}
                  style={{
                    marginLeft: 8,
                    background: "red",
                    color: "white",
                  }}
                >
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}