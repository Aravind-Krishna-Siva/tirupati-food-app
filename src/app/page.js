"use client";

import { useEffect, useState } from "react";
import { pb } from "./pocketbase";

export default function Home() {
  const [orders, setOrders] = useState([]);

  const loadOrders = async () => {
    const data = await pb.collection("orders").getFullList({
      sort: "-created",
    });
    setOrders(data);
  };

  const createTestOrder = async () => {
    await pb.collection("orders").create({
      token: "TEST" + Date.now(),
      items: "Lemon Juice x 1",
      total: 20,
      status: "Pending",
    });

    loadOrders();
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
    <div style={{ padding: 30 }}>
      <h1>PocketBase Test</h1>

      <button onClick={createTestOrder}>
        Create Test Order
      </button>

      <h2>Orders</h2>

      {orders.map((o) => (
        <div key={o.id} style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}>
          <h3>{o.token}</h3>
          <p>{o.items}</p>
          <p>₹{o.total}</p>
          <p>{o.status}</p>
        </div>
      ))}
    </div>
  );
}