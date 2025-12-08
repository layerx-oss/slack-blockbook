/**
 * Server-Sent Events (SSE) client manager
 */

import type { ServerResponse } from "node:http";

import { SSE_KEEPALIVE_INTERVAL } from "../config";

export interface SseClient {
  response: ServerResponse;
  keepAliveInterval: NodeJS.Timeout;
}

export class SseManager {
  private clients: SseClient[] = [];

  /**
   * Add a new SSE client
   */
  addClient(response: ServerResponse): void {
    const keepAliveInterval = setInterval(() => {
      response.write(": keepalive\n\n");
    }, SSE_KEEPALIVE_INTERVAL);

    this.clients.push({ response, keepAliveInterval });
  }

  /**
   * Remove a client by response
   */
  removeClient(response: ServerResponse): void {
    const index = this.clients.findIndex((c) => c.response === response);
    if (index !== -1) {
      const client = this.clients[index]!;
      clearInterval(client.keepAliveInterval);
      this.clients.splice(index, 1);
    }
  }

  /**
   * Send a message to all connected clients
   */
  broadcast(message: string): void {
    for (const client of this.clients) {
      client.response.write(`data: ${message}\n\n`);
    }
  }

  /**
   * Get the number of connected clients
   */
  get clientCount(): number {
    return this.clients.length;
  }

  /**
   * Close all client connections
   */
  closeAll(): void {
    for (const client of this.clients) {
      clearInterval(client.keepAliveInterval);
    }
    this.clients = [];
  }
}
