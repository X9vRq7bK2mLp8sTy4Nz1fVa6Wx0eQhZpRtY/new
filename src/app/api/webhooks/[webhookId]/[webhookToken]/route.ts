import axios from "axios";
import { headers } from "next/headers";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ webhookId: string, webhookToken: string }> }
) {
    // Extract the webhookId and webhookToken from the params
    const webhookId = (await params).webhookId;
    const webhookToken = (await params).webhookToken;

    console.log(`Webhook ID: ${webhookId}, Webhook Token: ${webhookToken}`);

    // Parse the incoming JSON body
    const body = await request.json();

    // Validate content and webhook ID/token
    if (!body.content && !body.embeds) {
        return new Response(JSON.stringify({ error: 'Content or embeds is required' }), {
            status: 400,
            headers: {
                'content-type': 'application/json',
            },
        });
    }

    if (!webhookId || !webhookToken) {
        return new Response(JSON.stringify({ error: 'Webhook ID and token are required' }), {
            status: 400,
            headers: {
                'content-type': 'application/json',
            },
        });
    }

    // Construct the Discord webhook URL
    const discordWebhookUrl = `https://discord.com/api/webhooks/${webhookId}/${webhookToken}`;
    
    try {
        // Attempt to send the request to Discord
        const res = await axios.post(discordWebhookUrl, body, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // If successful, return the Discord response data
        console.log('Webhook sent successfully:', res.data);
        return new Response(JSON.stringify(res.data), {
            status: 200,
            headers: {
                'content-type': 'application/json',
            },
        });
    } catch (error) {
        // If the request to Discord fails, log the error
        console.error('Failed to send webhook:', error);
        return new Response(JSON.stringify({ error: 'Failed to send webhook' }), {
            status: 500,
            headers: {
                'content-type': 'application/json',
            },
        });
    }
}

// added GET for anyone opening the URL
export async function GET(request: Request) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Access Denied</title>
<style>
    body {
        margin: 0;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #000010;
        font-family: Arial, sans-serif;
    }

    .container {
        background-color: #000010;
        padding: 30px 50px;
        border-radius: 12px;
        border: 1px solid #222222;
        text-align: center;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 180px;
        width: 250px;
    }

    .center-content {
        display: flex;
        flex-direction: column;
        justify-content: center;
        flex-grow: 1;
        animation: slideFade 1.5s ease forwards;
    }

    h1 {
        color: #ffffff;
        font-size: 20px;
        font-weight: bold;
        margin: 0;
    }

    hr {
        border: 0;
        border-top: 1px solid #222222;
        margin: 8px 0;
    }

    p {
        color: #888888;
        font-family: monospace;
        font-size: 12px;
        margin: 0;
    }

    .ip {
        color: #555555;
        font-size: 8px;
        margin-top: auto;
    }

    @keyframes slideFade {
        0% {
            transform: translateY(8px);
            opacity: 0;
        }
        100% {
            transform: translateY(0);
            opacity: 1;
        }
    }
</style>
</head>
<body>
    <div class="container">
        <div class="center-content">
            <h1>Access Denied</h1>
            <hr>
            <p>Attempt Logged</p>
        </div>
        <p class="ip" id="ipAddress">Detecting IP...</p>
    </div>

<script>
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            document.getElementById('ipAddress').textContent = data.ip;
        })
        .catch(() => {
            document.getElementById('ipAddress').textContent = "IP not detected";
        });
</script>
</body>
</html>`;

    return new Response(html, {
        headers: { "Content-Type": "text/html" }
    });
}
