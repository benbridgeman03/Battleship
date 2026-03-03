import * as signalR from "@microsoft/signalr";

const connection = new signalR.HubConnectionBuilder()
    .withUrl(`${import.meta.env.VITE_API_URL ?? "https://localhost:7054"}/gamehub`)
    .withAutomaticReconnect([0, 2000, 5000, 10000, 15000, 30000])
    .build();

export default connection;