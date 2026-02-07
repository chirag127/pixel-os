"""
Surge Deployment Script
Deploys Pixel OS to Surge.sh
"""

import os
import subprocess
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
SURGE_TOKEN = os.getenv("SURGE_TOKEN")
SURGE_DOMAIN = os.getenv("SURGE_DOMAIN", "pixel-os.surge.sh")
DIST_DIR = "dist"
TIMEOUT = 300


def run_command(cmd: list[str], cwd: str = None, timeout: int = TIMEOUT, env: dict = None) -> tuple[bool, str]:
    """Run a command and return success status and output."""
    try:
        run_env = os.environ.copy()
        if env:
            run_env.update(env)
        result = subprocess.run(
            cmd,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=timeout,
            shell=True if sys.platform == "win32" else False,
            env=run_env
        )
        output = result.stdout + result.stderr
        return result.returncode == 0, output
    except subprocess.TimeoutExpired:
        return False, f"Command timed out after {timeout}s"
    except Exception as e:
        return False, str(e)


def build_project() -> bool:
    """Build the project."""
    print("📦 Building project...")
    project_root = Path(__file__).parent.parent
    success, output = run_command(["npm", "run", "build"], cwd=str(project_root))
    if success:
        print("✅ Build successful")
    else:
        print(f"❌ Build failed: {output}")
    return success


def deploy_to_surge() -> bool:
    """Deploy to Surge."""
    print("🚀 Deploying to Surge...")

    project_root = Path(__file__).parent.parent
    dist_path = project_root / DIST_DIR

    if not dist_path.exists():
        print(f"❌ Dist directory not found: {dist_path}")
        return False

    # Deploy using Surge CLI
    cmd = ["npx", "surge", str(dist_path), SURGE_DOMAIN]
    env = {"SURGE_TOKEN": SURGE_TOKEN or ""}

    success, output = run_command(cmd, cwd=str(project_root), env=env)

    if success:
        print("✅ Deployment successful!")
        print(f"🌐 URL: https://{SURGE_DOMAIN}")
    else:
        print(f"❌ Deployment failed: {output}")

    return success


def main():
    """Main deployment function."""
    print("=" * 60)
    print("🔷 Surge Deployment")
    print("=" * 60)

    if not SURGE_TOKEN:
        print("❌ Missing SURGE_TOKEN")
        return False

    if not build_project():
        return False

    if not deploy_to_surge():
        return False

    print("\n" + "=" * 60)
    print("✅ Surge deployment complete!")
    print(f"🌐 Live at: https://{SURGE_DOMAIN}")
    print("=" * 60)
    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
