import * as signalR from "@microsoft/signalr";

const connection = new signalR.HubConnectionBuilder()
    .withUrl(`${import.meta.env.VITE_API_URL ?? "https://localhost:7054"}/gamehub`)
    .build();

export default connection;