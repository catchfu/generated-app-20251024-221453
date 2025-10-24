import { Hono } from "hono";
import { getAgentByName } from 'agents';
import { ChatAgent } from './agent';
import { API_RESPONSES } from './config';
import { Env, getAppController, registerSession, unregisterSession } from "./core-utils";
import { getDailyChallenge, scoreGuess, getChallengePrompt, getAllChallenges, getHintForChallenge } from './game';
/**
 * DO NOT MODIFY THIS FUNCTION. Only for your reference.
 */
export function coreRoutes(app: Hono<{ Bindings: Env }>) {
    // Use this API for conversations. **DO NOT MODIFY**
    app.all('/api/chat/:sessionId/*', async (c) => {
        try {
        const sessionId = c.req.param('sessionId');
        const agent = await getAgentByName<Env, ChatAgent>(c.env.CHAT_AGENT, sessionId); // Get existing agent or create a new one if it doesn't exist, with sessionId as the name
        const url = new URL(c.req.url);
        url.pathname = url.pathname.replace(`/api/chat/${sessionId}`, '');
        return agent.fetch(new Request(url.toString(), {
            method: c.req.method,
            headers: c.req.header(),
            body: c.req.method === 'GET' || c.req.method === 'DELETE' ? undefined : c.req.raw.body
        }));
        } catch (error) {
        console.error('Agent routing error:', error);
        return c.json({
            success: false,
            error: API_RESPONSES.AGENT_ROUTING_FAILED
        }, { status: 500 });
        }
    });
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    // --- PROMPTle Game Routes ---
    app.get('/api/game/daily', (c) => {
        try {
            const challenge = getDailyChallenge();
            return c.json(challenge);
        } catch (error) {
            console.error('Failed to get daily challenge:', error);
            return c.json({ error: 'Could not retrieve daily challenge.' }, 500);
        }
    });
    app.post('/api/game/guess', async (c) => {
        try {
            const { guess, challengeId, hintPenalty, hints } = await c.req.json();
            if (!guess || !challengeId) {
                return c.json({ error: 'Guess and challengeId are required.' }, 400);
            }
            const originalPrompt = getChallengePrompt(challengeId);
            if (!originalPrompt) {
                return c.json({ error: 'Invalid challenge ID.' }, 404);
            }
            const result = scoreGuess(guess, originalPrompt, hintPenalty, hints);
            return c.json(result);
        } catch (error) {
            console.error('Failed to score guess:', error);
            return c.json({ error: 'An error occurred while scoring your guess.' }, 500);
        }
    });
    app.post('/api/game/hint', async (c) => {
        try {
            const { challengeId, usedHints } = await c.req.json();
            if (!challengeId || !usedHints) {
                return c.json({ error: 'challengeId and usedHints are required.' }, 400);
            }
            const originalPrompt = getChallengePrompt(challengeId);
            if (!originalPrompt) {
                return c.json({ error: 'Invalid challenge ID.' }, 404);
            }
            const hint = getHintForChallenge(originalPrompt, usedHints);
            if (!hint) {
                return c.json({ error: 'No more hints available.' }, 400);
            }
            return c.json({ hint });
        } catch (error) {
            console.error('Failed to get hint:', error);
            return c.json({ error: 'An error occurred while getting a hint.' }, 500);
        }
    });
    app.get('/api/game/archive', (c) => {
        try {
            const challenges = getAllChallenges();
            return c.json(challenges);
        } catch (error) {
            console.error('Failed to get archive:', error);
            return c.json({ error: 'Could not retrieve challenge archive.' }, 500);
        }
    });
    // --- Leaderboard Routes ---
    app.get('/api/game/leaderboard/:date', async (c) => {
        try {
            const date = c.req.param('date');
            const controller = getAppController(c.env);
            const leaderboard = await controller.getLeaderboardForDay(date);
            return c.json(leaderboard);
        } catch (error) {
            console.error('Failed to get leaderboard:', error);
            return c.json({ error: 'Could not retrieve leaderboard.' }, 500);
        }
    });
    app.post('/api/game/leaderboard', async (c) => {
        try {
            const { name, score } = await c.req.json();
            if (!name || typeof score !== 'number') {
                return c.json({ error: 'Name and score are required.' }, 400);
            }
            const date = new Date().toISOString().split('T')[0];
            const controller = getAppController(c.env);
            await controller.addLeaderboardEntry(date, { name, score });
            return c.json({ success: true });
        } catch (error) {
            console.error('Failed to submit score:', error);
            return c.json({ error: 'Could not submit score.' }, 500);
        }
    });
    // --- Session Management Routes (from template) ---
    app.get('/api/sessions', async (c) => {
        try {
            const controller = getAppController(c.env);
            const sessions = await controller.listSessions();
            return c.json({ success: true, data: sessions });
        } catch (error) {
            console.error('Failed to list sessions:', error);
            return c.json({ success: false, error: 'Failed to retrieve sessions' }, { status: 500 });
        }
    });
    app.post('/api/sessions', async (c) => {
        try {
            const body = await c.req.json().catch(() => ({}));
            const { title, sessionId: providedSessionId, firstMessage } = body;
            const sessionId = providedSessionId || crypto.randomUUID();
            let sessionTitle = title;
            if (!sessionTitle) {
                const now = new Date();
                const dateTime = now.toLocaleString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
                if (firstMessage && firstMessage.trim()) {
                    const cleanMessage = firstMessage.trim().replace(/\s+/g, ' ');
                    const truncated = cleanMessage.length > 40 ? cleanMessage.slice(0, 37) + '...' : cleanMessage;
                    sessionTitle = `${truncated} • ${dateTime}`;
                } else {
                    sessionTitle = `Chat ${dateTime}`;
                }
            }
            await registerSession(c.env, sessionId, sessionTitle);
            return c.json({ success: true, data: { sessionId, title: sessionTitle } });
        } catch (error) {
            console.error('Failed to create session:', error);
            return c.json({ success: false, error: 'Failed to create session' }, { status: 500 });
        }
    });
    app.delete('/api/sessions/:sessionId', async (c) => {
        try {
            const sessionId = c.req.param('sessionId');
            const deleted = await unregisterSession(c.env, sessionId);
            if (!deleted) {
                return c.json({ success: false, error: 'Session not found' }, { status: 404 });
            }
            return c.json({ success: true, data: { deleted: true } });
        } catch (error) {
            console.error('Failed to delete session:', error);
            return c.json({ success: false, error: 'Failed to delete session' }, { status: 500 });
        }
    });
    app.put('/api/sessions/:sessionId/title', async (c) => {
        try {
            const sessionId = c.req.param('sessionId');
            const { title } = await c.req.json();
            if (!title || typeof title !== 'string') {
                return c.json({ success: false, error: 'Title is required' }, { status: 400 });
            }
            const controller = getAppController(c.env);
            const updated = await controller.updateSessionTitle(sessionId, title);
            if (!updated) {
                return c.json({ success: false, error: 'Session not found' }, { status: 404 });
            }
            return c.json({ success: true, data: { title } });
        } catch (error) {
            console.error('Failed to update session title:', error);
            return c.json({ success: false, error: 'Failed to update session title' }, { status: 500 });
        }
    });
    app.delete('/api/sessions', async (c) => {
        try {
            const controller = getAppController(c.env);
            const deletedCount = await controller.clearAllSessions();
            return c.json({ success: true, data: { deletedCount } });
        } catch (error) {
            console.error('Failed to clear all sessions:', error);
            return c.json({ success: false, error: 'Failed to clear all sessions' }, { status: 500 });
        }
    });
}