// use global from the <script> tag

// keep: const { invoke } = window.__TAURI__.core;  (from the UMD include)
const $ = (s) => document.querySelector(s);

let detected = [];  // store scan results

document.getElementById('btn-detect').addEventListener('click', async () => {
  const out = document.getElementById('detect-out');
  const sel = document.getElementById('base-cmd-select');
  out.textContent = 'Scanning...';
  try {
    const results = await invoke('detect_python');
    detected = Array.isArray(results) ? results.filter(r => r.found) : [];
    if (!detected.length) {
      out.textContent = 'No Python detected';
      sel.innerHTML = '<option value="">— none —</option>';
      return;
    }

    // Pretty print results
    out.textContent = detected.map(r =>
      `✅ Python ${r.version}\n   Path: ${r.sys_executable}`
    ).join('\n\n');

    // Populate dropdown (value = actual interpreter path if available)
    sel.innerHTML = detected.map((r, i) => {
      const value = r.sys_executable && r.sys_executable.length ? r.sys_executable : (r.which || 'python');
      const label = `Python ${r.version}  —  ${value}`;
      return `<option value="${value.replace(/"/g, '&quot;')}">${label}</option>`;
    }).join('');

    // Set hidden base-cmd to selection
    document.getElementById('base-cmd').value = sel.value;
  } catch (e) {
    out.textContent = String(e);
    detected = [];
    document.getElementById('base-cmd-select').innerHTML = '<option value="">— error —</option>';
  }
});

// Keep base-cmd in sync with dropdown selection
document.getElementById('base-cmd-select').addEventListener('change', (e) => {
  document.getElementById('base-cmd').value = e.target.value || 'python';
});

// Create venv handler (unchanged logic; now it will use the chosen interpreter path)
document.getElementById('btn-venv').addEventListener('click', async () => {
  const base = document.getElementById('base-cmd').value.trim() || 'python';
  const path = document.getElementById('env-path').value.trim();
  const out = document.getElementById('venv-out');
  if (!path) { out.textContent = 'Please enter env path'; return; }
  out.textContent = `Creating venv using ${base} ...`;
  try {
    const res = await invoke('create_venv', { baseCmd: base, envPath: path });
    out.textContent = res || 'Done';
    document.getElementById('env-path2').value = path;
  } catch (e) {
    out.textContent = String(e);
  }
});


document.getElementById('btn-venv').addEventListener('click', async () => {
  const base = document.getElementById('base-cmd').value.trim() || 'python';
  const path = document.getElementById('env-path').value.trim();
  const out = document.getElementById('venv-out');
  if (!path) { out.textContent = 'Please enter env path'; return; }
  out.textContent = `Creating venv using ${base} ...`;
  try {
    const res = await invoke('create_venv', { baseCmd: base, envPath: path });
    out.textContent = res || 'Done';
    document.getElementById('env-path2').value = path;
  } catch (e) { out.textContent = String(e); }
});
document.getElementById('btn-install').addEventListener('click', async () => {
  const path = document.getElementById('env-path2').value.trim();
  const pkgs = document.getElementById('packages').value.trim().split(/\s+/).filter(Boolean);
  const out = document.getElementById('install-out');
  if (!path) { out.textContent = 'Please enter env path'; return; }
  if (!pkgs.length) { out.textContent = 'Enter at least one package'; return; }
  out.textContent = `Installing: ${pkgs.join(', ')}`;
  try {
    const res = await invoke('install_packages', { envPath: path, packages: pkgs });
    out.textContent = res || 'Installed';
  } catch (e) { out.textContent = String(e); }
});
