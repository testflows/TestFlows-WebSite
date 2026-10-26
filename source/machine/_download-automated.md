<div class="download-section download-automated">
<h2>Automated install</h2>
<p>For automated installations, use your <a href="/docs/machine/#machine-account-api-keys">API key</a>:</p>

```bash
curl https://testflows.com/machine/install -fsS | TESTFLOWS_MACHINE_API_KEY=<key> bash
```

<p>The installer also reads the key from the environment. It must be exported: a variable set without <code>export</code> is not passed to the installer. A CI secret is exported already.</p>

```bash
export TESTFLOWS_MACHINE_API_KEY=<key>
curl https://testflows.com/machine/install -fsS | bash
```

</div>
