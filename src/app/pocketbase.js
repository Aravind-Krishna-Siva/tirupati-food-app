import PocketBase from "pocketbase";

// IMPORTANT: use correct local URL
export const pb = new PocketBase("http://127.0.0.1:8090");

// optional (avoids auth issues later)
pb.autoCancellation(false);