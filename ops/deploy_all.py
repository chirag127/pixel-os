"""
Deploy All Script
Deploys Pixel OS to all configured platforms
"""

import os
import sys
import subprocess
import time
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration flags
ENABLE_CLOUDFLARE = os.getenv("ENABLE_CLOUDFLARE", "True").lower() == "true"
ENABLE_NETLIFY = os.getenv("ENABLE_NETLIFY", "True").lower() == "true"
ENABLE_VERCEL = os.getenv("ENABLE_VERCEL", "True").lower() == "true"
ENABLE_SURGE = os.getenv("ENABLE_SURGE", "True").lower() == "true"
ENABLE_NEOCITIES = os.getenv("ENABLE_NEOCITIES", "True").lower() == "true"
ENABLE_GITHUB_PAGES = os.getenv("ENABLE_GITHUB_PAGES", "False").lower() == "true"

TIMEOUT = 600  # 10 minutes per deployment


def run_deploy_script(script_name: str) -> tuple[bool, float]:
    """Run a deployment script and return success status and duration."""
    script_path = Path(__file__).parent / script_name

    if not script_path.exists():
        print(f"❌ Script not found: {script_path}")
        return False, 0

    start_time = time.time()

    try:
        result = subprocess.run(
            [sys.executable, str(script_path)],
            capture_output=True,
            text=True,
            timeout=TIMEOUT,
            cwd=str(script_path.parent)
        )
        duration = time.time() - start_time

        if result.returncode == 0:
            return True, duration
        else:
            print(result.stdout)
            print(result.stderr)
            return False, duration
    except subprocess.TimeoutExpired:
        return False, TIMEOUT
    except Exception as e:
        print(f"Error: {e}")
        return False, time.time() - start_time


def main():
    """Deploy to all enabled platforms."""
    print("=" * 70)
    print("🚀 PIXEL OS - MULTI-PLATFORM DEPLOYMENT")
    print("=" * 70)
    print()

    deployments = [
        ("Cloudflare Pages", "deploy_cloudflare.py", ENABLE_CLOUDFLARE),
        ("Netlify", "deploy_netlify.py", ENABLE_NETLIFY),
        ("Vercel", "deploy_vercel.py", ENABLE_VERCEL),
        ("Surge", "deploy_surge.py", ENABLE_SURGE),
        ("Neocities", "deploy_neocities.py", ENABLE_NEOCITIES),
        ("GitHub Pages", "deploy_github_pages.py", ENABLE_GITHUB_PAGES),
    ]

    results = []

    for name, script, enabled in deployments:
        if not enabled:
            print(f"⏭️  {name}: SKIPPED (disabled)")
            results.append((name, None, 0))
            continue

        print(f"\n{'='*50}")
        print(f"🔷 Deploying to {name}...")
        print("=" * 50)

        success, duration = run_deploy_script(script)
        results.append((name, success, duration))

        if success:
            print(f"✅ {name}: SUCCESS ({duration:.1f}s)")
        else:
            print(f"❌ {name}: FAILED ({duration:.1f}s)")

    # Summary
    print("\n" + "=" * 70)
    print("📊 DEPLOYMENT SUMMARY")
    print("=" * 70)

    successful = 0
    failed = 0
    skipped = 0

    for name, success, duration in results:
        if success is None:
            print(f"  ⏭️  {name}: SKIPPED")
            skipped += 1
        elif success:
            print(f"  ✅ {name}: SUCCESS ({duration:.1f}s)")
            successful += 1
        else:
            print(f"  ❌ {name}: FAILED ({duration:.1f}s)")
            failed += 1

    print()
    print(f"Total: {successful} successful, {failed} failed, {skipped} skipped")
    print("=" * 70)

    # Deployment URLs
    print("\n📎 DEPLOYMENT URLS:")
    urls = [
        ("Cloudflare Pages", "https://pixel-os.pages.dev"),
        ("Netlify", "https://pixel-os.netlify.app"),
        ("Vercel", "https://pixel-os.vercel.app"),
        ("Surge", "https://pixel-os.surge.sh"),
        ("Neocities", "https://chirag127.neocities.org"),
        ("GitHub Pages", "https://chirag127.github.io/pixel-os"),
    ]

    for name, url in urls:
        print(f"  • {name}: {url}")

    return failed == 0


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
