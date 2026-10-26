<div class="download-section download-automated">
<h2>Automated install</h2>
<p>For automated installations, use your <a href="/docs/machine/#machine-account-api-keys">API key</a>:</p>

```bash
curl https://testflows.com/machine/install -fsS | TESTFLOWS_MACHINE_API_KEY=<key> bash
```

<p>When <code>TESTFLOWS_MACHINE_API_KEY</code> is already exported, as a CI secret usually is, the installer reads it from the environment:</p>

```bash
curl https://testflows.com/machine/install -fsS | bash
```

</div>
