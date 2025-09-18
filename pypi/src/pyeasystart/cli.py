import shutil, subprocess

def main():
    print("pyEasyStart CLI")
    print("This is a lightweight helper; the full GUI is a Tauri desktop app.")
    print()
    for cmd in (["py","-3","--version"], ["python3","--version"], ["python","--version"]):
        exe = shutil.which(cmd[0])
        if not exe:
            continue
        try:
            out = subprocess.check_output([exe] + cmd[1:], stderr=subprocess.STDOUT, text=True)
            print(f"Detected via {' '.join(cmd)} -> {out.strip()} ({exe})")
        except Exception:
            pass
    print("\nHints:")
    print("  Create env: python -m venv <env-path>")
    print(r"  Install:    <env>\Scripts\python.exe -m pip install pandas numpy")