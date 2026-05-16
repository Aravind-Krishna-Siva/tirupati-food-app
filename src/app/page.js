"use client";

import { useEffect, useState } from "react";
import { pb } from "./pocketbase";

export default function Home() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadOrders = async () => {
    try {
      const data = await pb.collection("orders").getFullList({
        sort: "-created",
      });
      setOrders(data);
    } catch (err) {
      console.error("LOAD ERROR:", err);
      setError("Load error: " + err.message);
    }
  };

  const createTestOrder = async () => {
    setError("");
    setLoading(true);

    try {
      const record = await pb.collection("orders").create({
        token: "TEST" + Date.now(),
        items: "Lemon Juice x 1",
        total: 20,
        status: "Pending",
      });

      console.log("ORDER CREATED:", record);
      await loadOrders();
      alert("Order created successfully ✅");
    } catch (err) {
      console.error("CREATE ERROR:", err);
      setError(
        "Create error: " +
          (err?.response?.message || err?.message || JSON.stringify(err))
      );
    } finally {
      setLoading(false);
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

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>PocketBase Test</h1>

      <button
        onClick={createTestOrder}
        disabled={loading}
        style={{
          padding: 15,
          background: "green",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        {loading ? "Creating..." : "Create Test Order"}
      </button>

      {error && (
        <pre
          style={{
            background: "#ffe5e5",
            color: "red",
            padding: 15,
            marginTop: 20,
            whiteSpace: "pre-wrap",
          }}
        >
          {error}
        </pre>
      )}

      <h2>Orders</h2>

      {orders.map((o) => (
        <div
          key={o.id}
          style={{
            border: "1px solid #ccc",
            margin: 10,
            padding: 10,
            borderRadius: 8,
          }}
        >
          <h3>{o.token}</h3>
          <p>{o.items}</p>
          <p>₹{o.total}</p>
          <p>{o.status}</p>
        </div>
      ))}
    </div>
  );
}