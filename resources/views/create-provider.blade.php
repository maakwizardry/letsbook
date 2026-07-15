<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Create Provider</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #0f172a;
            color: #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 24px;
            box-sizing: border-box;
        }
        .card {
            width: 100%;
            max-width: 640px;
            background: #1e293b;
            border-radius: 12px;
            padding: 32px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.4);
        }
        h1 {
            font-size: 18px;
            margin: 0 0 16px;
        }
        .status {
            font-size: 14px;
            color: #94a3b8;
            margin-bottom: 16px;
            white-space: pre-line;
        }
        .status.error {
            color: #f87171;
        }
        textarea {
            width: 100%;
            min-height: 320px;
            box-sizing: border-box;
            background: #0f172a;
            color: #e2e8f0;
            border: 1px solid #334155;
            border-radius: 8px;
            padding: 16px;
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
            font-size: 14px;
            line-height: 1.5;
            white-space: pre-wrap;
            resize: vertical;
        }
        .actions {
            display: flex;
            gap: 8px;
            margin-top: 16px;
        }
        button {
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 10px 16px;
            font-size: 14px;
            cursor: pointer;
        }
        button.secondary {
            background: #334155;
        }
        button:hover {
            filter: brightness(1.1);
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>Create Provider</h1>
        <div id="status" class="status">Click "New Provider" and enter a business name.</div>
        <textarea id="output" readonly placeholder="The outreach message will appear here..."></textarea>
        <div class="actions">
            <button id="new-btn">New Provider</button>
            <button id="copy-btn" class="secondary">Copy</button>
        </div>
    </div>

    <script>
        const statusEl = document.getElementById('status');
        const outputEl = document.getElementById('output');
        const newBtn = document.getElementById('new-btn');
        const copyBtn = document.getElementById('copy-btn');

        function setStatus(text, isError = false) {
            statusEl.textContent = text;
            statusEl.classList.toggle('error', isError);
        }

        async function createProvider() {
            const name = window.prompt('Provider name:');
            if (name === null) {
                return;
            }

            const trimmed = name.trim();
            if (trimmed === '') {
                setStatus('Name cannot be empty.', true);
                return;
            }

            setStatus(`Creating "${trimmed}"...`);
            outputEl.value = '';

            try {
                const response = await fetch('/api/providers', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({ name: trimmed }),
                });

                const data = await response.json();

                if (response.status === 201) {
                    outputEl.value = data.message;
                    setStatus(`Created "${data.provider.name}". Copy the message below.`);
                } else if (response.status === 409) {
                    outputEl.value = data.outreach_message;
                    setStatus(`"${data.provider.name}" already exists. Here's their message again.`);
                } else if (response.status === 422 && data.errors) {
                    setStatus(Object.values(data.errors).flat().join('\n'), true);
                } else {
                    setStatus(data.message || 'Something went wrong.', true);
                }
            } catch (err) {
                setStatus(`Request failed: ${err.message}`, true);
            }
        }

        newBtn.addEventListener('click', createProvider);

        copyBtn.addEventListener('click', async () => {
            if (!outputEl.value) {
                return;
            }
            try {
                await navigator.clipboard.writeText(outputEl.value);
                setStatus('Copied to clipboard.');
            } catch (err) {
                outputEl.select();
                setStatus('Press Ctrl+C / Cmd+C to copy (clipboard API blocked).');
            }
        });

        createProvider();
    </script>
</body>
</html>
