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
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 24px;
            gap: 24px;
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
        .field {
            margin-bottom: 12px;
        }
        .field label {
            display: block;
            font-size: 13px;
            color: #94a3b8;
            margin-bottom: 4px;
        }
        .field input {
            width: 100%;
            box-sizing: border-box;
            background: #0f172a;
            color: #e2e8f0;
            border: 1px solid #334155;
            border-radius: 8px;
            padding: 10px 12px;
            font-size: 14px;
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
        .variant {
            margin-bottom: 20px;
        }
        .variant-label {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            font-weight: 600;
            color: #7dd3fc;
            margin-bottom: 6px;
        }
        .last-used-tag {
            display: none;
            background: #166534;
            color: #bbf7d0;
            border-radius: 999px;
            padding: 2px 10px;
            font-size: 11px;
            font-weight: 600;
            white-space: nowrap;
        }
        .variant.last-used .last-used-tag {
            display: inline-block;
        }
        .variant textarea {
            min-height: 180px;
        }
        .variant .actions {
            margin-top: 8px;
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
        <div id="variants"></div>
        <div class="actions">
            <button id="new-btn">New Provider</button>
        </div>
    </div>

    <div class="card">
        <h1>Onboard Provider</h1>
        <div id="onboard-status" class="status">They've agreed to sign up — enter their real name and email, then copy the welcome message below and send it to them yourself.</div>
        <div class="field">
            <label for="onboard-name">Business name</label>
            <input id="onboard-name" type="text" placeholder="Sparkle Clean Co.">
        </div>
        <div class="field">
            <label for="onboard-email">Email</label>
            <input id="onboard-email" type="email" placeholder="owner@example.com">
        </div>
        <div class="actions">
            <button id="onboard-btn">Create &amp; Get Message</button>
        </div>
        <textarea id="onboard-output" readonly placeholder="The welcome message will appear here..." style="margin-top:16px;"></textarea>
        <div class="actions">
            <button id="onboard-copy-btn" class="secondary">Copy</button>
        </div>
    </div>

    <script>
        const statusEl = document.getElementById('status');
        const variantsEl = document.getElementById('variants');
        const newBtn = document.getElementById('new-btn');

        function setStatus(text, isError = false) {
            statusEl.textContent = text;
            statusEl.classList.toggle('error', isError);
        }

        const LAST_USED_KEY = 'outreach-last-used-variant';

        function markLastUsed(label) {
            for (const el of variantsEl.querySelectorAll('.variant')) {
                el.classList.toggle('last-used', el.dataset.label === label);
            }
        }

        function renderVariants(variants) {
            variantsEl.innerHTML = '';
            const lastUsed = localStorage.getItem(LAST_USED_KEY);

            for (const variant of variants) {
                const wrapper = document.createElement('div');
                wrapper.className = 'variant';
                wrapper.dataset.label = variant.label;

                const label = document.createElement('div');
                label.className = 'variant-label';
                label.textContent = variant.label;

                const tag = document.createElement('span');
                tag.className = 'last-used-tag';
                tag.textContent = 'Last used';
                label.appendChild(tag);

                const textarea = document.createElement('textarea');
                textarea.readOnly = true;
                textarea.value = variant.message;

                const actions = document.createElement('div');
                actions.className = 'actions';

                const copyBtn = document.createElement('button');
                copyBtn.className = 'secondary';
                copyBtn.textContent = 'Copy';
                copyBtn.addEventListener('click', async () => {
                    localStorage.setItem(LAST_USED_KEY, variant.label);
                    markLastUsed(variant.label);
                    try {
                        await navigator.clipboard.writeText(textarea.value);
                        setStatus(`Copied "${variant.label}" to clipboard.`);
                    } catch (err) {
                        textarea.select();
                        setStatus('Press Ctrl+C / Cmd+C to copy (clipboard API blocked).');
                    }
                });

                actions.appendChild(copyBtn);
                wrapper.appendChild(label);
                wrapper.appendChild(textarea);
                wrapper.appendChild(actions);
                variantsEl.appendChild(wrapper);

                if (variant.label === lastUsed) {
                    wrapper.classList.add('last-used');
                }
            }
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
            variantsEl.innerHTML = '';

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
                    renderVariants(data.messages);
                    setStatus(`Created "${data.provider.name}". Pick the variant that fits this prospect and copy it.`);
                } else if (response.status === 409) {
                    renderVariants(data.outreach_messages);
                    setStatus(`"${data.provider.name}" already exists. Here are their messages again.`);
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

        createProvider();

        const onboardStatusEl = document.getElementById('onboard-status');
        const onboardNameEl = document.getElementById('onboard-name');
        const onboardEmailEl = document.getElementById('onboard-email');
        const onboardBtn = document.getElementById('onboard-btn');
        const onboardOutputEl = document.getElementById('onboard-output');
        const onboardCopyBtn = document.getElementById('onboard-copy-btn');

        function setOnboardStatus(text, isError = false) {
            onboardStatusEl.textContent = text;
            onboardStatusEl.classList.toggle('error', isError);
        }

        onboardBtn.addEventListener('click', async () => {
            const name = onboardNameEl.value.trim();
            const email = onboardEmailEl.value.trim();

            if (!name || !email) {
                setOnboardStatus('Enter both a name and an email.', true);
                return;
            }

            setOnboardStatus(`Creating "${name}"...`);
            onboardOutputEl.value = '';

            try {
                const response = await fetch('/api/providers/onboard', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({ name, email }),
                });

                const data = await response.json();

                if (response.status === 201) {
                    onboardOutputEl.value = data.message;
                    setOnboardStatus(`Created "${data.provider.name}". Copy the message below and send it to them yourself.`);
                } else if (response.status === 422 && data.errors) {
                    setOnboardStatus(Object.values(data.errors).flat().join('\n'), true);
                } else {
                    setOnboardStatus(data.message || 'Something went wrong.', true);
                }
            } catch (err) {
                setOnboardStatus(`Request failed: ${err.message}`, true);
            }
        });

        onboardCopyBtn.addEventListener('click', async () => {
            if (!onboardOutputEl.value) {
                return;
            }
            try {
                await navigator.clipboard.writeText(onboardOutputEl.value);
                setOnboardStatus('Copied to clipboard.');
            } catch (err) {
                onboardOutputEl.select();
                setOnboardStatus('Press Ctrl+C / Cmd+C to copy (clipboard API blocked).');
            }
        });
    </script>
</body>
</html>
