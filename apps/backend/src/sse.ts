import type { Request, Response } from 'express';

interface Client {
  id: string;
  res: Response;
  ip: string;
}

class SSEManager {
  private clients: Map<string, Client> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.heartbeatInterval = setInterval(() => {
      this.heartbeat();
    }, 15000);
  }

  public handleConnection(req: Request, res: Response): void {
    const clientId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', clientId, timestamp: new Date().toISOString() })}\n\n`);

    const client: Client = {
      id: clientId,
      res,
      ip: req.ip || 'unknown'
    };

    this.clients.set(clientId, client);
    console.log(`[SSE] Client connected: ${clientId} (Total: ${this.clients.size})`);

    req.on('close', () => {
      this.clients.delete(clientId);
      console.log(`[SSE] Client disconnected: ${clientId} (Total: ${this.clients.size})`);
    });
  }

  public broadcast(type: string, payload: any): void {
    const message = `data: ${JSON.stringify({ type, data: payload, timestamp: new Date().toISOString() })}\n\n`;
    for (const [id, client] of this.clients.entries()) {
      try {
        client.res.write(message);
      } catch (err) {
        console.error(`[SSE] Failed writing to ${id}, removing`, err);
        this.clients.delete(id);
      }
    }
  }

  private heartbeat(): void {
    for (const [id, client] of this.clients.entries()) {
      try {
        client.res.write(`:ping ${Date.now()}\n\n`);
      } catch (err) {
        this.clients.delete(id);
      }
    }
  }

  public getClientCount(): number {
    return this.clients.size;
  }
}

export const sse = new SSEManager();
