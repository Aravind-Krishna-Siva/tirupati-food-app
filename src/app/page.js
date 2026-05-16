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

    pb.collection("orders").subscribe("*", () => {
      loadOrders();
    });

    return () => {
      pb.collection("orders").unsubscribe("*");
    };
  }, []);

  const loadItems = async () => {
    try {
      const records = await pb.collection("items").getFullList({
        sort: "-created",
      });

      setMenu(records);
    } catch (error) {
      console.error("Items load error:", error);
    }
  };

  const loadOrders = async () => {
    try {
      const records = await pb.collection("orders").getFullList({
        sort: "-created",
      });

      setOrders(records);
    } catch (error) {
      console.error("Orders load error:", error);
    }
  };

  const getImageUrl = (item) => {
    if (!item.image) return "";
    return `http://127.0.0.1:8090/api/files/items/${item.id}/${item.image}`;
  };

  const addItem = (item) => {
    setCart((prev) => ({
      ...prev,
      [item.name]: prev[item.name]
        ? { ...item, qty: prev[item.name].qty + 1 }
        : { ...item, qty: 1 },
    }));
  };

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

  const total = Object.values(cart).reduce(
    (sum, item) => sum + Number(item.price) * item.qty,
    0
  );

  const placeOrder = async () => {
    if (total <= 0) return;

    const newToken = "TIR" + Math.floor(1000 + Math.random() * 9000);

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
        total,
        status: "Pending",
      });

      setToken(newToken);
      setCart({});
      loadOrders();
    } catch (error) {
      console.error("Order create error:", error);
      alert("Order failed. Please try again.");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await pb.collection("orders").update(id, {
        status,
      });

      loadOrders();
    } catch (error) {
      console.error("Status update error:", error);
    }
  };

  const handleLogin = () => {
    if (loginUser === "aravind" && loginPass === "1234") {
      setIsOwner(true);
      setView("owner");
      setLoginError("");
    } else {
      setLoginError("Invalid username or password");
    }
  };

  const logout = () => {
    setIsOwner(false);
    setView("customer");
  };

  return (
    <div
      style={{
        fontFamily: "Arial",
        background: "#f5f5f5",
        minHeight: "100vh",
        paddingBottom: 80,
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
        }}
      >
        <h2>🍽️ Tirupati Food Stall</h2>

        <button
          onClick={() =>
            setView(view === "customer" ? "login" : "customer")
          }
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
            maxWidth: 300,
            margin: "auto",
          }}
        >
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
              border: "none",
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

          {menu.length === 0 && <p>No items found. Add items in PocketBase.</p>}

          {menu.map((item) => (
            <div
              key={item.id}
              style={{
                background: "white",
                padding: 12,
                marginBottom: 12,
                display: "flex",
                gap: 12,
                justifyContent: "space-between",
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <div style={{ display: "flex", gap: 12 }}>
                {item.image && (
                  <img
                    src={getImageUrl(item)}
                    alt={item.name}
                    width="90"
                    height="90"
                    style={{
                      borderRadius: 12,
                      objectFit: "cover",
                    }}
                  />
                )}

                <div>
                  <b>{item.name}</b>
                  <div>₹{item.price}</div>
                  <small>{item.category}</small>
                </div>
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
            zIndex: 20,
          }}
        >
          <span>🛒 ₹{total}</span>
          <button onClick={placeOrder}>Place Order</button>
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
          <h1>{token}</h1>
          <p>Please show this token at counter.</p>
          <button onClick={() => setToken(null)}>Close</button>
        </div>
      )}

      {view === "owner" && isOwner && (
        <div style={{ padding: 15 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h2>🧑‍🍳 Owner Dashboard</h2>
            <button onClick={logout}>Logout</button>
          </div>

          {orders.length === 0 && <p>No orders yet</p>}

          {orders.map((order) => {
            let parsedItems = [];

            try {
              parsedItems = JSON.parse(order.items || "[]");
            } catch {
              parsedItems = [];
            }

            return (
              <div
                key={order.id}
                style={{
                  background: "white",
                  padding: 12,
                  marginBottom: 12,
                  borderLeft: "5px solid green",
                  borderRadius: 10,
                }}
              >
                <h3>Token: {order.token}</h3>
                <p>Total: ₹{order.total}</p>
                <p>
                  Status: <b>{order.status}</b>
                </p>

                <ul>
                  {parsedItems.map((i) => (
                    <li key={i.name}>
                      {i.name} × {i.qty}
                    </li>
                  ))}
                </ul>

                <button onClick={() => updateStatus(order.id, "Preparing")}>
                  Preparing
                </button>

                <button
                  onClick={() => updateStatus(order.id, "Ready")}
                  style={{ marginLeft: 10 }}
                >
                  Ready
                </button>

                <button
                  onClick={() => updateStatus(order.id, "Delivered")}
                  style={{ marginLeft: 10 }}
                >
                  Delivered
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}