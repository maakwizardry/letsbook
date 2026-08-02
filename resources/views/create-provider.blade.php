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
        <h1>Create Provider <span id="session-counter" style="font-size:12px; font-weight:400; color:#7dd3fc; margin-left:8px;">0 created this session</span></h1>
        <div id="status" class="status">Click "New Provider" and enter a business name.</div>
        <div id="variants"></div>
        <div class="actions">
            <button id="new-btn">New Provider <span style="opacity:0.7; font-weight:400;">(N)</span></button>
        </div>
    </div>

    <script>
        const statusEl = document.getElementById('status');
        const variantsEl = document.getElementById('variants');
        const newBtn = document.getElementById('new-btn');
        const sessionCounterEl = document.getElementById('session-counter');

        const NICHE_MAP = { '0': 'cleaning', '1': 'barber', '2': 'dentist' };

        let sessionCreatedCount = 0;

        function incrementSessionCounter() {
            sessionCreatedCount += 1;
            sessionCounterEl.textContent = `${sessionCreatedCount} created this session`;
        }

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

        async function copyRandomVariant(variants, providerName, coverNote) {
            if (!variants || variants.length === 0) {
                setStatus(`Created "${providerName}".${coverNote} No outreach variants to copy.`);
                return;
            }

            const variant = variants[Math.floor(Math.random() * variants.length)];

            localStorage.setItem(LAST_USED_KEY, variant.label);
            markLastUsed(variant.label);

            try {
                await navigator.clipboard.writeText(variant.message);
                setStatus(`Created "${providerName}".${coverNote} Copied "${variant.label}" to your clipboard — just paste it.`);
            } catch (err) {
                setStatus(`Created "${providerName}".${coverNote} Couldn't auto-copy (clipboard blocked) — use the Copy button on "${variant.label}".`, true);
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

            const coverImageUrlInput = window.prompt('Cover image URL (optional, leave blank to skip):');
            const coverImageUrl = coverImageUrlInput ? coverImageUrlInput.trim() : '';

            const nicheInput = window.prompt('Business type — 0 = cleaning, 1 = barber, 2 = dentist:', '0');
            if (nicheInput === null) {
                return;
            }
            const niche = NICHE_MAP[nicheInput.trim()] ?? 'cleaning';

            setStatus(`Creating "${trimmed}"...`);
            variantsEl.innerHTML = '';

            try {
                const response = await fetch('/api/providers', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({
                        name: trimmed,
                        cover_image_url: coverImageUrl || null,
                        niche,
                    }),
                });

                const data = await response.json();

                if (response.status === 201) {
                    renderVariants(data.messages);
                    incrementSessionCounter();
                    const coverNote = !coverImageUrl
                        ? ''
                        : data.provider.cover_image_path
                            ? ' Cover image attached.'
                            : ' Cover image download failed — using the default.';
                    await copyRandomVariant(data.messages, data.provider.name, coverNote);
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

        document.addEventListener('keydown', (e) => {
            const target = e.target;
            const isTyping = target instanceof HTMLElement && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
            if (isTyping || e.metaKey || e.ctrlKey || e.altKey) {
                return;
            }
            if (e.key.toLowerCase() === 'n') {
                e.preventDefault();
                createProvider();
            }
        });

        createProvider();
    </script>
</body>
</html>
