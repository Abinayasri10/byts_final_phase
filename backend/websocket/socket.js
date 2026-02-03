import { WebSocketServer, WebSocket } from 'ws';
import Answer from '../models/Answer.js';

let wss; // Global WebSocket Server instance

export default function setupWebSocket(server) {
    wss = new WebSocketServer({ server });

    wss.on('connection', (ws) => {
        console.log('Client connected via WebSocket');

        ws.on('message', async (message) => {
            try {
                const data = JSON.parse(message.toString());
                console.log('Received message:', data);

                if (data.type === 'NEW_ANSWER') {
                    const { questionId, text, senderIcon, imageUrl, sessionId } = data.payload;

                    const answer = new Answer({
                        questionId,
                        text,
                        senderIcon,
                        imageUrl,
                        sessionId
                    });

                    await answer.save();

                    broadcastToAll({
                        type: 'ANSWER_RECEIVED',
                        payload: answer,
                    });
                }

                if (data.type === 'REACTION') {
                    const { answerId, reaction } = data.payload;
                    const answer = await Answer.findById(answerId);

                    if (answer) {
                        const reactions = answer.reactions ?? new Map();
                        const currentCount = reactions.get(reaction) || 0;

                        reactions.set(reaction, currentCount + 1);
                        answer.reactions = reactions;
                        await answer.save();

                        broadcastToAll({
                            type: 'REACTION_UPDATED',
                            payload: {
                                answerId,
                                reactions: Object.fromEntries(answer.reactions),
                                triggeredBy: reaction,
                                timestamp: Date.now()
                            },
                        });
                    }
                }
            } catch (error) {
                console.error('WebSocket message error:', error);
            }
        });

        ws.on('close', () => {
            console.log('Client disconnected');
        });
    });

    return wss;
}

// Global broadcast function
export function broadcastToAll(data) {
    if (!wss) return;
    
    const broadcastData = JSON.stringify(data);
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(broadcastData);
        }
    });
}

// Export wss for other modules to use
export function getWebSocketServer() {
    return wss;
}
