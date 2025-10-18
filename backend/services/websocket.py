"""
WebSocket manager for real-time updates
"""

from typing import Dict, List
from fastapi import WebSocket


class WebSocketManager:
    """Manager for WebSocket connections"""

    def __init__(self) -> None:
        """Initialize WebSocket manager"""
        self.active_connections: Dict[str, WebSocket] = {}
        self.market_subscribers: Dict[str, List[str]] = {}  # market_id -> [client_ids]

    async def connect(self, websocket: WebSocket, client_id: str) -> None:
        """
        Accept and store a WebSocket connection

        Args:
            websocket: WebSocket connection
            client_id: Unique client identifier
        """
        await websocket.accept()
        self.active_connections[client_id] = websocket
        print(f"🔌 Client {client_id} connected. Total connections: {len(self.active_connections)}")

    async def disconnect(self, client_id: str) -> None:
        """
        Remove a WebSocket connection

        Args:
            client_id: Client identifier
        """
        if client_id in self.active_connections:
            del self.active_connections[client_id]

        # Remove from all market subscriptions
        for market_id in self.market_subscribers:
            if client_id in self.market_subscribers[market_id]:
                self.market_subscribers[market_id].remove(client_id)

        print(f"🔌 Client {client_id} disconnected. Total connections: {len(self.active_connections)}")

    async def disconnect_all(self) -> None:
        """Disconnect all clients"""
        for client_id in list(self.active_connections.keys()):
            await self.disconnect(client_id)

    async def send_personal_message(self, message: str, client_id: str) -> None:
        """
        Send a message to a specific client

        Args:
            message: Message to send
            client_id: Client identifier
        """
        if client_id in self.active_connections:
            websocket = self.active_connections[client_id]
            await websocket.send_text(message)

    async def broadcast(self, message: str) -> None:
        """
        Broadcast a message to all connected clients

        Args:
            message: Message to broadcast
        """
        for client_id, websocket in self.active_connections.items():
            try:
                await websocket.send_text(message)
            except Exception as e:
                print(f"Error broadcasting to {client_id}: {e}")

    async def subscribe_to_market(self, client_id: str, market_id: str) -> None:
        """
        Subscribe a client to market updates

        Args:
            client_id: Client identifier
            market_id: Market identifier
        """
        if market_id not in self.market_subscribers:
            self.market_subscribers[market_id] = []

        if client_id not in self.market_subscribers[market_id]:
            self.market_subscribers[market_id].append(client_id)
            print(f"📊 Client {client_id} subscribed to market {market_id}")

    async def unsubscribe_from_market(self, client_id: str, market_id: str) -> None:
        """
        Unsubscribe a client from market updates

        Args:
            client_id: Client identifier
            market_id: Market identifier
        """
        if market_id in self.market_subscribers:
            if client_id in self.market_subscribers[market_id]:
                self.market_subscribers[market_id].remove(client_id)
                print(f"📊 Client {client_id} unsubscribed from market {market_id}")

    async def broadcast_to_market(self, market_id: str, message: str) -> None:
        """
        Broadcast a message to all subscribers of a market

        Args:
            market_id: Market identifier
            message: Message to broadcast
        """
        if market_id not in self.market_subscribers:
            return

        subscribers = self.market_subscribers[market_id]
        for client_id in subscribers:
            if client_id in self.active_connections:
                try:
                    websocket = self.active_connections[client_id]
                    await websocket.send_text(message)
                except Exception as e:
                    print(f"Error sending to {client_id}: {e}")

    async def send_market_update(
        self,
        market_id: str,
        update_type: str,
        data: dict
    ) -> None:
        """
        Send a market update to all subscribers

        Args:
            market_id: Market identifier
            update_type: Type of update (trade, price_change, resolution, etc.)
            data: Update data
        """
        import json

        message = json.dumps({
            "type": "market_update",
            "market_id": market_id,
            "update_type": update_type,
            "data": data,
            "timestamp": data.get("timestamp")
        })

        await self.broadcast_to_market(market_id, message)

    async def send_tournament_update(
        self,
        tournament_id: str,
        update_type: str,
        data: dict
    ) -> None:
        """
        Send a tournament update to all connected clients

        Args:
            tournament_id: Tournament identifier
            update_type: Type of update
            data: Update data
        """
        import json

        message = json.dumps({
            "type": "tournament_update",
            "tournament_id": tournament_id,
            "update_type": update_type,
            "data": data
        })

        await self.broadcast(message)


# Global singleton instance
websocket_manager = WebSocketManager()
